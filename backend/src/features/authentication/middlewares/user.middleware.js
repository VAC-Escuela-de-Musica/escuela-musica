'use strict'

import User from '../../../core/models/user.model.js'
import Alumno from '../../../core/models/alumnos.model.js'
import Role from '../../../core/models/role.model.js' // ✅ IMPORTAR Role para populate
import { respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Carga los datos completos del usuario autenticado
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const loadUserData = async (req, res, next) => {
  try {
    if (!req.user?.email) {
      return respondError(req, res, 401, 'Usuario no autenticado')
    }

    const email = req.user.email
    
    // Importar Role dinámicamente para asegurar que esté registrado
    const Role = (await import('../../../core/models/role.model.js')).default
    
    let user = await User.findOne({ email }).populate('roles')
    let isAlumno = false
    
    if (!user) {
      user = await Alumno.findOne({ email })
      isAlumno = true
    }

    if (!user) {
      return respondError(req, res, 401, 'Usuario no encontrado')
    }

    // Establecer datos completos del usuario
    req.user.fullData = user
    req.user.id = user._id
    req.user.email = user.email
    
    // Manejar roles según el tipo de usuario
    if (isAlumno) {
      // Para alumnos (Alumno model)
      req.user.roleNames = user.roles || ['estudiante']
    } else {
      // Para usuarios normales (User model)
      req.user.roleNames = Array.isArray(user.roles)
        ? user.roles.map(r => {
            if (typeof r === 'object' && r.name) {
              return r.name; // Extraer el nombre del rol del objeto
            }
            return typeof r === 'string' ? r : r.name || r;
          })
        : []
    }
    
    // Si es alumno, poner nombreAlumno como username
    if (user.nombreAlumno) req.user.username = user.nombreAlumno

    // Asegurar compatibilidad con legacy code
    req.email = req.user.email
    req.roles = req.user.roleNames

    console.log('🔍 [LOAD-USER-DATA] Usuario cargado:', {
      id: req.user.id,
      email: req.user.email,
      roles: req.roles,
      username: req.user.username,
      isAlumno
    })

    next()
  } catch (error) {
    handleError(error, 'user.middleware -> loadUserData')
    return respondError(req, res, 500, 'Error cargando datos de usuario')
  }
}

/**
 * Verifica que el usuario esté activo
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const checkUserStatus = async (req, res, next) => {
  try {
    if (!req.user?.fullData) {
      return respondError(req, res, 401, 'Datos de usuario no cargados')
    }

    const user = req.user.fullData

    if (user.status === 'inactive') {
      return respondError(req, res, 403, 'Cuenta de usuario inactiva')
    }

    if (user.status === 'suspended') {
      return respondError(req, res, 403, 'Cuenta de usuario suspendida')
    }

    next()
  } catch (error) {
    handleError(error, 'user.middleware -> checkUserStatus')
  }
}

export { loadUserData, checkUserStatus }
