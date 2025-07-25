
'use strict'

// Función para validar que la URL de redirección es local
function isLocalUrl(path) {
  try {
    const baseUrl = 'http://localhost'; // Cambia esto por el dominio de tu app si es necesario
    return new URL(path, baseUrl).origin === baseUrl;
  } catch (e) {
    return false;
  }
}

import { Router } from 'express'

// Importación de rutas
import userRoutes from '../features/user-management/routes/user.routes.js'
import authRoutes from '../features/authentication/routes/auth.routes.js'
import materialRoutes from '../features/content-management/routes/material.routes.js'
import fileRoutes from '../features/file-system/routes/file.routes.js'
import alumnosRoutes from '../features/student-management/routes/alumnos.routes.js'
import galeriaRoutes from '../features/content-management/routes/galeria.routes.js'
import messagingRoutes from '../features/communication/routes/messaging.routes.js'
import roleRoutes from '../features/user-management/routes/role.routes.js'
import cardsProfesoresRoutes from '../features/website-content/routes/cardsProfesores.routes.js'
import carouselRoutes from '../features/website-content/routes/carousel.routes.js'

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

// Instancia del enrutador
const router = Router()

// ============= MIDDLEWARES GLOBALES =============
router.use(requestInfo)
router.use(requestLogger)
router.use(performanceMonitor)
router.use(securityHeaders)
router.use(sanitizeInput)

// ============= DEFINICIÓN DE RUTAS =============
// Ruta para exponer el token CSRF al frontend
import lusca from 'lusca'
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
    version: '1.0.0'
  })
})

// Rutas para usuarios - autenticación manejada en user.routes.js
router.use('/users', userRoutes)

// Rutas para autenticación - públicas
router.use('/auth', authRoutes)

// Rutas para materiales - autenticación manejada en material.routes.js
router.use('/materials', materialRoutes)

// Rutas para archivos - operaciones de archivos optimizadas
router.use('/files', fileRoutes)

// Rutas de administración - solo para desarrollo
router.use('/admin', adminRoutes)

// Rutas para alumnos - autenticación manejada en alumnos.routes.js
router.use('/alumnos', alumnosRoutes)

// Rutas para galería - autenticación manejada en galeria.routes.js
router.use('/galeria', galeriaRoutes)

// Rutas para mensajería - autenticación manejada en messaging.routes.js
router.use('/messaging', messagingRoutes)

// Rutas para roles - autenticación manejada en role.routes.js
router.use('/roles', roleRoutes)

// Rutas para tarjetas de profesores
router.use('/cards-profesores', cardsProfesoresRoutes)

// Rutas para carousel - autenticación manejada en carousel.routes.js
router.use('/carousel', carouselRoutes)

// ============= COMPATIBILIDAD CON RUTAS OBSOLETAS =============
router.use('/materiales', (req, res) => {
  console.log(`⚠️ Acceso a ruta obsoleta: ${req.method} ${req.originalUrl}`)
  const targetUrl = req.originalUrl.replace('/materiales', '/materials');
  if (isLocalUrl(targetUrl)) {
    res.redirect(307, targetUrl);
  } else {
    res.redirect(307, '/');
  }
})

// ============= MANEJO DE ERRORES =============
router.use(notFoundHandler)
router.use(globalErrorHandler)

export default router
