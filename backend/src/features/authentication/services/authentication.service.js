'use strict'

/** Modelo de datos 'User' */
import User from '../../../core/models/user.model.js'
import Alumno from '../../../core/models/alumnos.model.js'
/** Modulo 'jsonwebtoken' para crear tokens */
import jwt from 'jsonwebtoken'

import { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } from '../../../core/config/configEnv.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'
import logger from '../../../core/utils/logger.util.js'

/**
 * Inicia sesión con un usuario.
 * @async
 * @function login
 * @param {Object} user - Objeto de usuario
 * @returns {Object} Respuesta estandarizada
 */
async function login (user) {
  try {
    const { email, password } = user

    logger.info('Intento de login', { email })

    // Buscar primero en usuarios normales
    const userFound = await User.findOne({ email })
      .populate('roles')
      .exec()

    if (userFound) {
      const matchPassword = await User.comparePassword(password, userFound.password)
      if (!matchPassword) {
        logger.warn('Intento de login fallido: contraseña incorrecta', { email })
        return {
          success: false,
          error: 'El usuario y/o contraseña son incorrectos',
          data: null
        }
      }
      const accessToken = jwt.sign(
        {
          id: userFound._id,
          email: userFound.email,
          roles: userFound.roles.map(role => ({ _id: role._id, name: role.name }))
        },
        ACCESS_JWT_SECRET,
        { expiresIn: '1d' }
      )
      const refreshToken = jwt.sign(
        {
          id: userFound._id,
          email: userFound.email
        },
        REFRESH_JWT_SECRET,
        { expiresIn: '7d' }
      )
      logger.auth('login_success', userFound._id, { email })
      return {
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: userFound._id,
            email: userFound.email,
            username: userFound.username,
            roles: userFound.roles.map(role => ({ _id: role._id, name: role.name }))
          }
        },
        error: null
      }
    }

    // Si no es usuario normal, buscar en alumnos
    const alumnoFound = await Alumno.findOne({ email }).select('+password roles nombreAlumno email').exec()
    if (!alumnoFound) {
      logger.warn('Intento de login fallido: usuario/alumno no encontrado', { email })
      return {
        success: false,
        error: 'El usuario y/o contraseña son incorrectos',
        data: null
      }
    }
    const matchAlumnoPassword = await Alumno.comparePassword(password, alumnoFound.password)
    if (!matchAlumnoPassword) {
      logger.warn('Intento de login fallido: contraseña incorrecta (alumno)', { email })
      return {
        success: false,
        error: 'El usuario y/o contraseña son incorrectos',
        data: null
      }
    }
    // Generar token para alumno
    const alumnoRoles = (alumnoFound.roles || ['student']).map(r => typeof r === 'string' ? { name: r } : r)
    const accessToken = jwt.sign(
      {
        id: alumnoFound._id,
        email: alumnoFound.email,
        roles: alumnoRoles
      },
      ACCESS_JWT_SECRET,
      { expiresIn: '1d' }
    )
    const refreshToken = jwt.sign(
      {
        id: alumnoFound._id,
        email: alumnoFound.email
      },
      REFRESH_JWT_SECRET,
      { expiresIn: '7d' }
    )
    logger.auth('login_success', alumnoFound._id, { email, alumno: true })
    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: alumnoFound._id,
          email: alumnoFound.email,
          username: alumnoFound.nombreAlumno,
          roles: alumnoRoles
        }
      },
      error: null
    }
  } catch (error) {
    logger.error('Error en login', { error, context: 'authentication.service' })
    handleError(error, 'authentication.service -> login')
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Refresca el token de acceso
 * @async
 * @function refresh
 * @param {Object} cookies - Objeto de cookies
 * @returns {Object} Respuesta estandarizada
 */
async function refresh (cookies) {
  try {
    if (!cookies.jwt) {
      return {
        success: false,
        error: 'No hay autorización',
        data: null
      }
    }

    const refreshToken = cookies.jwt

    return new Promise((resolve) => {
      jwt.verify(refreshToken, REFRESH_JWT_SECRET, async (err, user) => {
        if (err) {
          return resolve({
            success: false,
            error: 'La sesión ha caducado, vuelva a iniciar sesión',
            data: null
          })
        }

        const userFound = await User.findOne({ email: user.email })
          .populate('roles')
          .exec()

        if (!userFound) {
          return resolve({
            success: false,
            error: 'Usuario no autorizado',
            data: null
          })
        }

        const accessToken = jwt.sign(
          {
            id: userFound._id,
            email: userFound.email,
            roles: userFound.roles.map(role => ({ _id: role._id, name: role.name }))
          },
          ACCESS_JWT_SECRET,
          { expiresIn: '1d' }
        )

        resolve({
          success: true,
          data: {
            accessToken,
            user: {
              id: userFound._id,
              email: userFound.email,
              username: userFound.username,
              roles: userFound.roles
            }
          },
          error: null
        })
      })
    })
  } catch (error) {
    handleError(error, 'authentication.service -> refresh')
    return {
      success: false,
      error: error.message,
      data: null
    }
  }
}

/**
 * Verifica un token de acceso.
 * @async
 * @function verifyToken
 * @param {string} token - Token de acceso
 * @returns {Object} Respuesta estandarizada
 */
async function verifyToken (token) {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Token no proporcionado',
        data: null
      }
    }

    const decoded = jwt.verify(token, ACCESS_JWT_SECRET)

    // Buscar usuario por email del token
    let userFound = await User.findOne({ email: decoded.email })
      .populate('roles')
      .exec()
    let isAlumno = false;
    if (!userFound) {
      userFound = await Alumno.findOne({ email: decoded.email })
      isAlumno = !!userFound;
    }

    if (!userFound) {
      return {
        success: false,
        error: 'Usuario no encontrado',
        data: null
      }
    }

    let userData;
    if (isAlumno) {
      // Para alumnos
      const alumnoRoles = (userFound.roles || ['student']).map(r => typeof r === 'string' ? { name: r } : r)
      userData = {
        id: userFound._id,
        email: userFound.email,
        username: userFound.nombreAlumno,
        roles: alumnoRoles
      }
    } else {
      // Para usuarios normales
      userData = {
        id: userFound._id,
        email: userFound.email,
        username: userFound.username,
        roles: userFound.roles.map(role => ({ _id: role._id, name: role.name }))
      }
    }

    return {
      success: true,
      data: {
        user: userData
      },
      error: null
    }
  } catch (error) {
    handleError(error, 'authentication.service -> verifyToken')
    return {
      success: false,
      error: error.message === 'jwt expired' ? 'Token expirado' : 'Token inválido',
      data: null
    }
  }
}

// Exportar funciones individuales y como servicio
export { login, refresh, verifyToken }

// Exportar como servicio principal
export const AuthenticationService = { login, refresh, verifyToken }
