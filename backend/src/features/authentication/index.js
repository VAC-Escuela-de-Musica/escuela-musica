'use strict'

// Exportar controladores
export { default as authController } from './controllers/auth.controller.js'

// Exportar servicios
export {
  login,
  refresh,
  verifyToken
} from './services/authentication.service.js'

export {
  AuthorizationService
} from './services/authorization.service.js'

// Exportar middlewares individuales
export { verifyJWT as authenticationMiddleware } from './middlewares/index.js'
export { authorizeRoles } from './middlewares/authorization.middleware.js'

// Exportar middlewares agrupados
export {
  authenticateJWT,
  verifyJWT,
  extractJWT,
  optionalAuth,
  loadUserData,
  requireRole,
  requireAdmin,
  requireAdminOrProfesor,
  requireAuthenticated,
  requireOwnershipOrAdmin
} from './middlewares/index.js'

// Exportar rutas
export { default as authRoutes } from './routes/auth.routes.js'
