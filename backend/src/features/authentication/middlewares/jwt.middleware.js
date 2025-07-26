'use strict'

import jwt from 'jsonwebtoken'
import { ACCESS_JWT_SECRET } from '../../../core/config/configEnv.js'
import { respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Extrae y valida el token JWT del header Authorization
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const extractJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return respondError(
        req,
        res,
        401,
        'No autorizado',
        'Token no proporcionado o formato inválido'
      )
    }

    const token = authHeader.split(' ')[1]
    req.token = token
    next()
  } catch (error) {
    handleError(error, 'jwt.middleware -> extractJWT')
  }
}

/**
 * Verifica y decodifica el token JWT
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const verifyJWT = (req, res, next) => {
  try {
    console.log('🔍 [JWT-VERIFY] Iniciando verificación de JWT')
    console.log('🔍 [JWT-VERIFY] Token existe:', !!req.token)

    if (!req.token) {
      console.log('❌ [JWT-VERIFY] No hay token')
      return respondError(
        req,
        res,
        401,
        'No autorizado',
        'Token no encontrado'
      )
    }

    jwt.verify(req.token, ACCESS_JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('❌ [JWT-VERIFY] Error verificando token:', err.message)
        return respondError(req, res, 403, 'No autorizado', 'Token inválido o expirado')
      }

      console.log('🔍 [JWT-VERIFY] Token decodificado:', {
        email: decoded.email,
        id: decoded.id,
        roles: decoded.roles,
        rolesLength: decoded.roles?.length
      })

      req.user = {
        email: decoded.email,
        roles: decoded.roles,
        id: decoded.id || decoded._id
      }

      // Compatibilidad con sistema legacy
      req.email = decoded.email
      req.roles = decoded.roles || []

      console.log('✅ [JWT-VERIFY] req.user configurado:', req.user)
      console.log('✅ [JWT-VERIFY] req.roles configurado:', req.roles)
      next()
    })
  } catch (error) {
    console.error('💥 [JWT-VERIFY] Error inesperado:', error)
    handleError(error, 'jwt.middleware -> verifyJWT')
  }
}

/**
 * Middleware combinado para extraer y verificar JWT
 */
const authenticateJWT = [extractJWT, verifyJWT]

export { extractJWT, verifyJWT, authenticateJWT }
