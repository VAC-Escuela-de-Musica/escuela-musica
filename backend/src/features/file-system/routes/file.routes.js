import { Router } from 'express'
import {
  authenticateJWT,
  loadUserData,
  optionalAuth,
  validateMongoId,
  asyncHandler,
  rateLimiter
} from '../../../middlewares/index.js'
import {
  fileAccessMiddleware,
  fileStreamMiddleware,
  fileCacheMiddleware
} from '../middlewares/index.js'
import {
  getDownloadUrl,
  downloadFile,
  serveFile,
  healthCheck
} from '../controllers/index.js'

const router = Router()

// ============= RUTAS PÚBLICAS (con autenticación opcional) =============

// Aplicar middleware de archivos y rate limiting
router.use(fileAccessMiddleware)
router.use(rateLimiter(2000, 15 * 60 * 1000)) // 2000 requests por 15 minutos para archivos (aumentado para desarrollo)

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticateJWT)
router.use(loadUserData)
// Middleware de debug para todas las rutas de este router (ahora después de autenticación)
router.use((req, res, next) => {
  console.log(`[FILE] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

// Nuevas rutas optimizadas con fallback automático y autenticación opcional
router.get('/serve/:id',
  validateMongoId('id'),
  optionalAuth, // Autenticación opcional para materiales públicos/privados
  fileStreamMiddleware,
  fileCacheMiddleware(3600), // Cache por 1 hora
  asyncHandler(serveFile)
)

router.get('/download/:id',
  validateMongoId('id'),
  optionalAuth, // Autenticación opcional para materiales públicos/privados
  fileStreamMiddleware,
  fileCacheMiddleware(3600),
  asyncHandler(downloadFile)
)

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticateJWT)
router.use(loadUserData)

// Health check del sistema de archivos
router.get('/health',
  asyncHandler(healthCheck)
)

// URLs prefirmadas para diferentes acciones
router.get('/:id/download-url',
  validateMongoId('id'),
  asyncHandler(getDownloadUrl)
)

router.get('/:id/view-url',
  validateMongoId('id'),
  asyncHandler((req, res, next) => {
    req.query.action = 'view'
    getDownloadUrl(req, res, next)
  })
)

export default router
