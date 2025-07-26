'use strict'
// Autorizacion - Comprobar el rol del usuario
// import User from "../models/user.model.js";
// import { respondError } from "../utils/responseHandler.util.js";
// import { handleError } from "../utils/errorHandler.util.js";
// import ROLES from "../constants/roles.constants.js";

// Mapeo de ObjectIds a roles (basado en los IDs reales de la base de datos)
const ROLE_MAPPING = {
  '687dbca578c6f5e67d2dca07': 'administrador',
  '687dbca578c6f5e67d2dca0a': 'asistente',
  '687dbca578c6f5e67d2dca0d': 'profesor'
}

/**
 * Convierte roles de ObjectId a string si es necesario
 * @param {Array} roles - Array de roles (pueden ser ObjectIds, objetos con _id/name, o strings)
 * @returns {Array} Array de roles como strings
 */
function normalizeRoles (roles) {
  if (!Array.isArray(roles)) return []

  return roles.map((role) => {
    // Si es un objeto con propiedades _id y name (desde JWT)
    if (typeof role === 'object' && role !== null) {
      if (role.name) {
        return role.name // Usar directamente el nombre del rol
      }
      if (role._id) {
        const roleId = role._id.toString()
        return ROLE_MAPPING[roleId] || 'estudiante'
      }
    }
    
    const roleStr = role.toString()
    // Si es un ObjectId (24 caracteres hexadecimales), usar el mapeo
    if (roleStr.length === 24 && /^[0-9a-fA-F]{24}$/.test(roleStr)) {
      return ROLE_MAPPING[roleStr] || 'estudiante'
    }
    // Si ya es un string, devolverlo tal como está
    return roleStr
  })
}

/**
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
export function isAdmin (req, res, next) {
  const normalizedRoles = normalizeRoles(req.roles)

  // Verificar si el usuario tiene el rol "administrador"
  if (normalizedRoles.includes('administrador')) {
    return next()
  }

  return res.status(403).json({ message: 'No autorizado' })
}

/**
 * Middleware para autorizar roles específicos
 * @param {Array} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export function authorizeRoles (allowedRoles) {
  return (req, res, next) => {
    if (!req.roles || !Array.isArray(req.roles)) {
      return res.status(403).json({ message: 'No autorizado - Roles no encontrados' })
    }

    const normalizedRoles = normalizeRoles(req.roles)
    const hasPermission = normalizedRoles.some((role) => allowedRoles.includes(role))

    if (hasPermission) {
      return next()
    }

    return res.status(403).json({ message: 'No autorizado - Rol insuficiente' })
  }
}
