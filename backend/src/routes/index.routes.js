import { Router } from 'express'

// Importación de rutas
import userRoutes from '../features/user-management/routes/user.routes.js'
import authRoutes from '../features/authentication/routes/auth.routes.js'
import materialRoutes from '../features/content-management/routes/material.routes.js'
import fileRoutes from '../features/file-system/routes/file.routes.js'
import alumnosRoutes from '../features/student-management/routes/alumnos.routes.js'
import profesoresRoutes from '../features/profesor-management/routes/profesores.routes.js'
import galeriaRoutes from '../features/content-management/routes/galeria.routes.js'
import messagingRoutes from '../features/communication/routes/messaging.routes.js'
import internalMessageRoutes from '../features/communication/routes/internalMessage.routes.js'
import roleRoutes from '../features/user-management/routes/role.routes.js'
import cardsProfesoresRoutes from '../features/website-content/routes/cardsProfesores.routes.js'
import carouselRoutes from '../features/website-content/routes/carousel.routes.js'
import testimonioRoutes from '../features/website-content/routes/testimonio.routes.js'
import ClasesRoutes from '../features/clases-management/routes/clase.routes.js'

import adminRoutes from './admin.routes.js'

// Middlewares centralizados
import {
  requestLogger,
  performanceMonitor,
  securityHeaders,
  requestInfo,
  globalErrorHandler,
  notFoundHandler,
  sanitizeInput
} from '../middlewares/index.js'

// ============= DEFINICIÓN DE RUTAS =============
// Ruta para exponer el token CSRF al frontend
import lusca from 'lusca'

'use strict'

// Función para validar que la URL de redirección es local
function isLocalUrl (path) {
  try {
    const baseUrl = 'http://localhost' // Cambia esto por el dominio de tu app si es necesario
    return new URL(path, baseUrl).origin === baseUrl
  } catch (e) {
    return false
  }
}

// Instancia del enrutador
const router = Router()

// ============= MIDDLEWARES GLOBALES =============
router.use(requestInfo)
router.use(requestLogger)
router.use(performanceMonitor)
router.use(securityHeaders)
router.use(sanitizeInput)
const { csrf } = lusca

router.get('/csrf-token', csrf(), (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Health check global del sistema
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  })
})

// Auth routes
router.use('/auth', authRoutes)

// Protected routes
router.use('/users', userRoutes)
router.use('/roles', roleRoutes)
router.use('/files', fileRoutes)
router.use('/materials', materialRoutes)
router.use('/galeria', galeriaRoutes)
router.use('/alumnos', alumnosRoutes)
router.use('/profesores', profesoresRoutes)
router.use('/messaging', messagingRoutes)
router.use('/internal-messages', internalMessageRoutes)
router.use('/cards-profesores', cardsProfesoresRoutes)
router.use('/carousel', carouselRoutes)
router.use('/testimonios', testimonioRoutes)
router.use("/clases", ClasesRoutes);

// Legacy compatibility
router.use('/materiales', (req, res) => {
  console.log(`⚠️ Acceso a ruta obsoleta: ${req.method} ${req.originalUrl}`)
  const targetUrl = req.originalUrl.replace('/materiales', '/materials')
  if (isLocalUrl(targetUrl)) {
    res.redirect(307, targetUrl)
  } else {
    res.redirect(307, '/')
  }
})

// ============= RUTAS DE ADMINISTRACIÓN =============
// Rutas de administración - autenticación manejada en admin.routes.js
router.use('/admin', adminRoutes)

// ============= MANEJO DE ERRORES =============
// Middleware para manejar rutas no encontradas
router.use(notFoundHandler)

// Middleware global para manejo de errores
router.use(globalErrorHandler)

export default router
