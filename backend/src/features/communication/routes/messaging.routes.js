import express from 'express'
import messagingController from '../controllers/messaging.controller.js'
import emailConfigController from '../controllers/emailConfig.controller.js'
import {
  authenticateJWT,
  loadUserData,
  requireAdmin,
  requireAdminOrAsistente,
  asyncHandler
} from '../../../middlewares/index.js'

const router = express.Router()

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[MESSAGING] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`)
  next()
})

// Ruta de prueba para verificar autenticación
router.get('/auth-test', authenticateJWT, loadUserData, (req, res) => {
  console.log('🔍 [AUTH-TEST] Verificando estado de autenticación')
  console.log('🔍 [AUTH-TEST] req.user:', req.user)
  console.log('🔍 [AUTH-TEST] req.roles:', req.roles)
  console.log('🔍 [AUTH-TEST] req.email:', req.email)
  
  res.json({
    success: true,
    message: 'Autenticación verificada',
    user: req.user,
    roles: req.roles,
    email: req.email
  })
})

// Ruta de prueba alternativa sin autenticación para debugging
router.post('/test-email-config-debug', (req, res) => {
  console.log('🔍 [TEST-EMAIL-CONFIG-DEBUG] Petición recibida (sin autenticación)')
  console.log('🔍 [TEST-EMAIL-CONFIG-DEBUG] req.body:', req.body)
  
  // Llamar al controlador original
  emailConfigController.testEmailConfig(req, res)
})

// Ruta de prueba sin restricciones de autorización (solo para desarrollo)
router.post('/test-email-config-unrestricted', (req, res) => {
  console.log('🔍 [TEST-EMAIL-UNRESTRICTED] Petición recibida (sin restricciones)')
  console.log('🔍 [TEST-EMAIL-UNRESTRICTED] req.body:', req.body)
  
  // Llamar al método sin restricciones
  emailConfigController.testEmailConfigUnrestricted(req, res)
})

// Rutas públicas (sin autenticación) - para utilidades de diagnóstico
router.post('/whatsapp-web/reset', messagingController.resetWhatsAppWeb)
router.post('/whatsapp-web/initialize', messagingController.initializeWhatsAppWeb)

// Todas las demás rutas requieren autenticación
router.use(authenticateJWT)
router.use(loadUserData)

// Rutas para envío de mensajes
router.post('/send-whatsapp', messagingController.sendWhatsAppMessage)
router.post('/send-email', messagingController.sendEmail)
router.post('/send-message', messagingController.sendMessage)

// Rutas para configuración y pruebas
router.get('/config-status', messagingController.getConfigurationStatus)
router.post('/test-message', messagingController.sendTestMessage)

// Rutas para WhatsApp Web (autenticadas)
router.get('/whatsapp-web/status', messagingController.getWhatsAppWebStatus)
router.get('/whatsapp-web/qr', messagingController.getWhatsAppWebQR)

// Rutas para configuración de email (administradores y asistentes)
router.get('/email-config', requireAdminOrAsistente, emailConfigController.getEmailConfig)
router.post('/email-config', requireAdminOrAsistente, emailConfigController.saveEmailConfig)
router.post('/email-config/test', requireAdminOrAsistente, emailConfigController.testEmailConfig)
// Ruta de prueba simplificada para debugging (administradores y asistentes)
router.post('/test-email-config', requireAdminOrAsistente, (req, res) => {
  console.log('🔍 [TEST-EMAIL-CONFIG] Petición recibida')
  console.log('🔍 [TEST-EMAIL-CONFIG] req.user:', req.user)
  console.log('🔍 [TEST-EMAIL-CONFIG] req.roles:', req.roles)
  console.log('🔍 [TEST-EMAIL-CONFIG] req.body:', req.body)
  
  // Verificar si el usuario tiene permisos
  if (!req.user) {
    console.log('❌ [TEST-EMAIL-CONFIG] Usuario no autenticado')
    return res.status(403).json({
      success: false,
      message: 'No autorizado - Usuario no autenticado'
    })
  }
  
  // Permitir acceso a cualquier usuario autenticado para pruebas
  console.log('✅ [TEST-EMAIL-CONFIG] Usuario autenticado, procediendo...')
  
  // Llamar al controlador original
  emailConfigController.testEmailConfig(req, res)
})

// Rutas para plantillas de email
router.get('/email-templates', emailConfigController.getEmailTemplates)
router.post('/email-templates', emailConfigController.addEmailTemplate)
router.get('/email-templates/:id', emailConfigController.getEmailTemplate)
router.put('/email-templates/:id', emailConfigController.updateEmailTemplate)
router.delete('/email-templates/:id', emailConfigController.deleteEmailTemplate)

export default router
