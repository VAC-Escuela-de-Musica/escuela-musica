import express from 'express'
import {
  authenticateJWT,
  loadUserData,
  requireAdmin,
  requireAdminOrProfesor,
  validateMongoId,
  asyncHandler,
  sanitizeInput
} from '../../../middlewares/index.js'
import ProfesoresController from '../controllers/profesores.controller.js'

const router = express.Router()

// Aplicar middlewares base a todas las rutas
router.use(sanitizeInput)
router.use(authenticateJWT)
router.use(loadUserData)

// Middleware de debug
router.use((req, res, next) => {
  console.log(`[PROFESORES] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  console.log(`[PROFESORES] Headers:`, {
    authorization: req.headers.authorization ? 'Presente' : 'Ausente',
    'x-csrf-token': req.headers['x-csrf-token'] ? 'Presente' : 'Ausente',
    'content-type': req.headers['content-type']
  })
  console.log(`[PROFESORES] User object:`, req.user)
  console.log(`[PROFESORES] User roles:`, req.user?.roles)
  next()
})

// Rutas principales - Todas requieren acceso administrativo
router.get('/', requireAdmin, asyncHandler(ProfesoresController.getAllProfesores))
router.post('/', requireAdmin, asyncHandler(ProfesoresController.createProfesores))
router.put('/:id', validateMongoId('id'), requireAdmin, asyncHandler(ProfesoresController.updateProfesores))
router.delete('/:id', validateMongoId('id'), requireAdmin, asyncHandler(ProfesoresController.deleteProfesores))
router.get('/:id', validateMongoId('id'), requireAdmin, asyncHandler(ProfesoresController.getProfesoresById))

// Rutas adicionales
router.get('/email/:email', requireAdmin, asyncHandler(ProfesoresController.getProfesorByEmail))
router.get('/activos/lista', requireAdminOrProfesor, asyncHandler(ProfesoresController.getProfesoresActivos))
router.put('/:id/toggle-status', validateMongoId('id'), requireAdmin, asyncHandler(ProfesoresController.toggleProfesorStatus))

export default router 