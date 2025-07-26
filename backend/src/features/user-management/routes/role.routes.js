import { Router } from 'express'
import roleController from '../controllers/role.controller.js'
import { extractJWT } from '../../authentication/middlewares/jwt.middleware.js'

const router = Router()

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[ROLE] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

// Todas las rutas requieren autenticación
router.use(extractJWT)

router.get('/', roleController.getRoles)

export default router
