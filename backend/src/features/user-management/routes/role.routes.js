import { Router } from 'express'
import roleController from '../controllers/role.controller.js'
import { 
  authenticateJWT,
  loadUserData,
  requireAdmin,
  asyncHandler,
  sanitizeInput
} from '../../../middlewares/index.js'

const router = Router()

// Aplicar middlewares base a todas las rutas
router.use(sanitizeInput)
router.use(authenticateJWT)
router.use(loadUserData)

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[ROLE] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

router.get('/', requireAdmin, asyncHandler(roleController.getRoles))

export default router
