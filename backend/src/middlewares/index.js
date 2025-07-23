/**
 * MIDDLEWARES - ÍNDICE PRINCIPAL
 * Exportaciones centralizadas de todos los middlewares organizados por responsabilidad
 */

// === AUTENTICACIÓN Y AUTORIZACIÓN ===
export {
  // JWT
  extractJWT,
  verifyJWT,
  authenticateJWT,
  
  // Autenticación opcional
  optionalAuth,
  
  // Usuario
  loadUserData,
  checkUserStatus,
  
  // Roles y Autorización
  requireRole,
  requireAdmin,
  requireAdminOrProfesor,
  requireAuthenticated,
  requireOwnershipOrAdmin
} from '../features/authentication/middlewares/index.js';

// === VALIDACIÓN ===
export {
  // Validación de requests
  validateRequest,
  validateMongoId,
  validateRequiredFields,
  sanitizeInput,
  
  // Validación de archivos
  validateFileType,
  validateImageFile,
  validateMaterialFile,
  validateDocumentFile,
  validateFileSize,
  requireFile,
  validateFileName
} from './validation/index.js';

// === MANEJO DE ERRORES ===
export {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  accessErrorLogger
} from './error/index.js';

// === MANEJO DE ARCHIVOS ===
export {
  // Control de acceso
  fileAccessMiddleware,
  fileStreamMiddleware,
  fileSecurityMiddleware,
  fileCacheMiddleware,
  fileAccessLogger
} from '../features/file-system/middlewares/index.js';

// === MIDDLEWARES COMUNES ===
export {
  requestLogger,
  rateLimiter,
  performanceMonitor,
  securityHeaders,
  requestInfo
} from './common.middleware.js';
