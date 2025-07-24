import express from 'express'
import {
  authenticateJWT,
  loadUserData,
  requireAdmin,
  validateMongoId,
  asyncHandler,
  sanitizeInput
} from '../../../middlewares/index.js'
import AlumnosController from '../controllers/alumnos.controller.js'

const router = express.Router()

// Aplicar middlewares base a todas las rutas
router.use(sanitizeInput)
router.use(authenticateJWT)
router.use(loadUserData)

// Middleware de debug
router.use((req, res, next) => {
  console.log(`[ALUMNOS] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

router.get('/', asyncHandler(AlumnosController.getAllAlumnos))
router.post('/', requireAdmin, asyncHandler(AlumnosController.createAlumnos))
router.put('/:id', validateMongoId('id'), requireAdmin, asyncHandler(AlumnosController.updateAlumnos))
router.delete('/:id', validateMongoId('id'), requireAdmin, asyncHandler(AlumnosController.deleteAlumnos))
router.get('/:id', validateMongoId('id'), asyncHandler(AlumnosController.getAlumnosById))

export default router
