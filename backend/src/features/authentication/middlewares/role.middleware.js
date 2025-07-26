'use strict'

import { respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'
import logger from '../../../core/utils/logger.util.js'

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log('🔍 [REQUIRE-ROLE] Verificando roles para:', allowedRoles)
      console.log('🔍 [REQUIRE-ROLE] req.user:', req.user)
      console.log('🔍 [REQUIRE-ROLE] req.email:', req.email)
      console.log('🔍 [REQUIRE-ROLE] req.roles:', req.roles)
      
      // Intentar obtener roles de diferentes fuentes
      let userRoles = []

      // 1. Roles cargados por loadUserData (preferido)
      if (req.user?.roleNames) {
        userRoles = req.user.roleNames
        console.log('✅ [REQUIRE-ROLE] Roles obtenidos de req.user.roleNames:', userRoles)
      }
      // 2. Roles del token JWT directo
      else if (req.user?.roles) {
        console.log('🔍 [REQUIRE-ROLE] req.user.roles encontrado:', req.user.roles)
        // Si es array de objetos (populate), extraer nombres
        if (Array.isArray(req.user.roles) && req.user.roles.length > 0) {
          if (typeof req.user.roles[0] === 'object' && req.user.roles[0].name) {
            userRoles = req.user.roles.map(role => role.name)
            console.log('✅ [REQUIRE-ROLE] Roles extraídos de objetos:', userRoles)
          } else if (typeof req.user.roles[0] === 'string') {
            userRoles = req.user.roles
            console.log('✅ [REQUIRE-ROLE] Roles directos (strings):', userRoles)
          }
        }
      }
      // 3. Compatibilidad con sistema legacy
      else if (req.email && req.roles) {
        userRoles = Array.isArray(req.roles) ? req.roles : [req.roles]
        console.log('✅ [REQUIRE-ROLE] Roles obtenidos de sistema legacy:', userRoles)
      }

      console.log('🔍 [REQUIRE-ROLE] Roles finales del usuario:', userRoles)

      if (!userRoles.length) {
        console.log('❌ [REQUIRE-ROLE] No hay roles disponibles')
        return respondError(req, res, 401, 'Información de roles no disponible')
      }

      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role))
      console.log('🔍 [REQUIRE-ROLE] ¿Tiene rol requerido?', hasRequiredRole)
      console.log('🔍 [REQUIRE-ROLE] Roles requeridos:', allowedRoles)
      console.log('🔍 [REQUIRE-ROLE] Roles del usuario:', userRoles)

      if (!hasRequiredRole) {
        console.log('❌ [REQUIRE-ROLE] Acceso denegado - Roles insuficientes')
        logger.warn('Acceso denegado por roles insuficientes', {
          userEmail: req.user?.email || req.email,
          userRoles,
          requiredRoles: allowedRoles,
          url: req.url,
          method: req.method
        })

        return respondError(
          req,
          res,
          403,
          `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
        )
      }

      console.log('✅ [REQUIRE-ROLE] Acceso permitido')
      next()
    } catch (error) {
      console.error('💥 [REQUIRE-ROLE] Error:', error)
      logger.error('Error en requireRole', { error, context: 'role.middleware' })
      handleError(error, 'role.middleware -> requireRole')
      return respondError(req, res, 500, 'Error verificando permisos')
    }
  }
}

/**
 * Verifica si el usuario es administrador
 */
const requireAdmin = requireRole(['administrador'])

/**
 * Verifica si el usuario es administrador o profesor
 */
const requireAdminOrProfesor = requireRole(['administrador', 'profesor'])

/**
 * Verifica si el usuario es administrador o asistente
 */
const requireAdminOrAsistente = requireRole(['administrador', 'asistente'])

/**
 * Verifica si el usuario es administrador, profesor o alumno
 */
const requireAuthenticated = requireRole(['administrador', 'profesor'])

/**
 * Middleware más específico para verificar si es propietario del recurso o admin
 * @param {Function} getResourceOwnerId - Función que extrae el ID del propietario del recurso
 */
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.fullData) {
        return respondError(req, res, 401, 'Usuario no autenticado')
      }

      const user = req.user.fullData
      const userRoles = req.user.roleNames

      // Si es admin, permitir acceso
      if (userRoles.includes('administrador')) {
        return next()
      }

      // Verificar propiedad del recurso
      const resourceOwnerId = await getResourceOwnerId(req)
      if (user._id.toString() === resourceOwnerId?.toString()) {
        return next()
      }

      return respondError(
        req,
        res,
        403,
        'Solo puedes acceder a tus propios recursos o ser administrador'
      )
    } catch (error) {
      handleError(error, 'role.middleware -> requireOwnershipOrAdmin')
    }
  }
}

export {
  requireRole,
  requireAdmin,
  requireAdminOrProfesor,
  requireAdminOrAsistente,
  requireAuthenticated,
  requireOwnershipOrAdmin
}
