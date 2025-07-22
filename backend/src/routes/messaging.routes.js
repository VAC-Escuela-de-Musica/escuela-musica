import express from 'express';
import messagingController from '../controllers/messaging.controller.js';
import emailConfigController from '../controllers/emailConfig.controller.js';
import { 
  authenticateJWT,
  loadUserData,
  requireAdmin,
  asyncHandler 
} from '../middlewares/index.js';

const router = express.Router();

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[MESSAGING] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`);
  next();
});

// Todas las rutas requieren autenticación
router.use(authenticateJWT);
router.use(loadUserData);

// Rutas para envío de mensajes
router.post('/send-whatsapp', messagingController.sendWhatsAppMessage);
router.post('/send-email', messagingController.sendEmail);
router.post('/send-message', messagingController.sendMessage);

// Rutas para configuración y pruebas
router.get('/config-status', messagingController.getConfigurationStatus);
router.post('/test-message', messagingController.sendTestMessage);

// Rutas para WhatsApp Web
router.get('/whatsapp-web/status', messagingController.getWhatsAppWebStatus);
router.post('/whatsapp-web/initialize', messagingController.initializeWhatsAppWeb);
router.get('/whatsapp-web/qr', messagingController.getWhatsAppWebQR);

// Rutas para configuración de email
router.get('/email-config', emailConfigController.getEmailConfig);
router.post('/email-config', emailConfigController.saveEmailConfig);
router.post('/test-email-config', emailConfigController.testEmailConfig);

// Rutas para plantillas de email
router.get('/email-templates', emailConfigController.getEmailTemplates);
router.post('/email-templates', emailConfigController.addEmailTemplate);
router.get('/email-templates/:id', emailConfigController.getEmailTemplate);
router.put('/email-templates/:id', emailConfigController.updateEmailTemplate);
router.delete('/email-templates/:id', emailConfigController.deleteEmailTemplate);

export default router; 