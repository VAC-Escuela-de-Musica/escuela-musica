import express from 'express'
import {
  authenticateJWT,
  loadUserData,
  requireAdmin,
  validateMongoId,
  asyncHandler,
  sanitizeInput
} from '../../../middlewares/index.js'
import InternalMessageController from '../controllers/internalMessage.controller.js'

const router = express.Router()

// Aplicar middlewares base a todas las rutas
router.use(sanitizeInput)
router.use(authenticateJWT)
router.use(loadUserData)

// Middleware de debug
router.use((req, res, next) => {
  console.log(`[INTERNAL-MESSAGES] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

// Rutas para administradores y profesores
router.post('/', requireAdmin, asyncHandler(InternalMessageController.createMessage))
router.get('/', requireAdmin, asyncHandler(InternalMessageController.getAllMessages))
router.get('/stats', requireAdmin, asyncHandler(InternalMessageController.getMessageStats))
router.put('/:messageId/send', requireAdmin, asyncHandler(InternalMessageController.sendMessage))
router.delete('/:messageId', requireAdmin, asyncHandler(InternalMessageController.deleteMessage))
router.get('/:messageId', requireAdmin, asyncHandler(InternalMessageController.getMessageById))

// Rutas para estudiantes
router.get('/student/:studentId', validateMongoId('studentId'), asyncHandler(InternalMessageController.getStudentMessages))
router.get('/student/:studentId/unread', validateMongoId('studentId'), asyncHandler(InternalMessageController.getUnreadMessages))
router.put('/:messageId/read', validateMongoId('messageId'), asyncHandler(InternalMessageController.markAsRead))

export default router
