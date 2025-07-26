/**
 * MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
 * Exportaciones centralizadas para manejo de JWT, usuarios y roles
 */

// Middlewares de JWT
export { extractJWT, verifyJWT, authenticateJWT } from './jwt.middleware.js'

// Middleware de autenticación opcional
export { optionalAuth } from './optional.middleware.js'

// Middlewares de usuario
export { loadUserData, checkUserStatus } from './user.middleware.js'

// Middlewares de roles y autorización
export {
  requireRole,
  requireAdmin,
  requireAdminOrProfesor,
  requireAdminOrAsistente,
  requireAuthenticated,
  requireOwnershipOrAdmin
} from './role.middleware.js'
