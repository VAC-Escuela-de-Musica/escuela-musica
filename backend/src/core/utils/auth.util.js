'use strict'

import jwt from 'jsonwebtoken'
import { ACCESS_JWT_SECRET } from '../config/configEnv.js'

/**
 * Verifica un token JWT desde la URL y actualiza el objeto request
 * @param {Object} req - Objeto request de Express
 * @param {string} token - Token JWT a verificar
 * @returns {boolean} - true si la verificación es exitosa, false en caso contrario
 */
export function verifyTokenFromUrl (req, token) {
  // Si ya hay datos de usuario del middleware, usar esos
  if (req.user?.email) {
    return true
  }

  // Si hay token en la URL, verificarlo
  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_JWT_SECRET)

      // Asignar datos del token tanto al formato legacy como al nuevo
      req.email = decoded.email
      req.roles = decoded.roles || []

      // También crear el objeto user para compatibilidad
      req.user = {
        email: decoded.email,
        roles: decoded.roles || [],
        id: decoded.id || decoded._id
      }

      return true
    } catch (tokenError) {
      console.error(`❌ Error validando token URL: ${tokenError.message}`)
      return false
    }
  }

  // Si no hay token ni datos de usuario
  return false
}

/**
 * Verifica si un usuario tiene rol de administrador
 * @param {Object} user - Objeto usuario con roles
 * @returns {boolean} - true si es administrador
 */
export function isUserAdmin (user) {
  if (!user || !user.roles) return false
  return user.roles.includes('admin') || user.roles.includes('administrador')
}

/**
 * Verifica si un usuario tiene rol de profesor
 * @param {Object} user - Objeto usuario con roles
 * @returns {boolean} - true si es profesor
 */
export function isUserProfesor (user) {
  if (!user || !user.roles) return false
  return user.roles.includes('profesor') || user.roles.includes('teacher')
}

/**
 * Verifica si un usuario puede acceder a un recurso basado en roles y propiedad
 * @param {Object} req - Objeto request con datos del usuario
 * @param {string} resourceOwner - Email del propietario del recurso
 * @returns {boolean} - true si tiene acceso
 */
export function canAccessResource (req, resourceOwner) {
  const userEmail = req.email || req.user?.email
  const userRoles = req.roles || req.user?.roles || []

  // Si es el propietario del recurso
  if (userEmail === resourceOwner) return true

  // Si es admin o profesor, puede acceder
  const user = { email: userEmail, roles: userRoles }
  return isUserAdmin(user) || isUserProfesor(user)
}
