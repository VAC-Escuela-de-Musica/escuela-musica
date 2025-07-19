import messagingService from '../services/messaging.service.js';
import { respondSuccess, respondError } from '../utils/resHandler.js';

class MessagingController {
  /**
   * Envía un mensaje de WhatsApp
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendWhatsAppMessage(req, res) {
    try {
      const { phoneNumber, message } = req.body;

      // Validar datos requeridos
      if (!phoneNumber || !message) {
        return respondError(req, res, 400, 'Número de teléfono y mensaje son requeridos');
      }

      // Verificar configuración de WhatsApp
      const config = messagingService.checkConfiguration();
      if (!config.whatsapp.twilio.configured && !config.whatsapp.businessAPI.configured && !config.whatsapp.callmebot.configured && !config.whatsapp.alternative.configured) {
        return respondError(req, res, 500, 'Servicio de WhatsApp no configurado correctamente');
      }

      // Prioridad: Business API > Callmebot > Twilio > Simulación
      let result;
      if (config.whatsapp.businessAPI.configured) {
        result = await messagingService.sendWhatsAppBusinessAPI(phoneNumber, message);
      } else if (config.whatsapp.callmebot.configured) {
        result = await messagingService.sendWhatsAppCallmebot(phoneNumber, message);
      } else if (config.whatsapp.twilio.configured) {
        result = await messagingService.sendWhatsAppMessage(phoneNumber, message);
      } else {
        result = await messagingService.sendWhatsAppAlternative(phoneNumber, message);
      }

      if (result.success) {
        return respondSuccess(req, res, 200, {
          message: result.message,
          messageId: result.messageId,
          status: result.status
        });
      } else {
        return respondError(req, res, 500, result.message, { error: result.error });
      }
    } catch (error) {
      console.error('Error in sendWhatsAppMessage controller:', error);
      return respondError(req, res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía un email
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendEmail(req, res) {
    try {
      const { email, subject, content } = req.body;

      // Validar datos requeridos
      if (!email || !subject || !content) {
        return respondError(req, res, 400, 'Email, asunto y contenido son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return respondError(req, res, 400, 'Formato de email inválido');
      }

      // Verificar configuración de email
      const config = messagingService.checkConfiguration();
      if (!config.email.configured) {
        return respondError(req, res, 500, 'Servicio de email no configurado correctamente');
      }

      const result = await messagingService.sendEmail(email, subject, content);

      if (result.success) {
        return respondSuccess(req, res, 200, {
          message: result.message,
          messageId: result.messageId,
          status: result.status
        });
      } else {
        return respondError(req, res, 500, result.message, { error: result.error });
      }
    } catch (error) {
      console.error('Error in sendEmail controller:', error);
      return respondError(req, res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía un mensaje (WhatsApp o Email) según el tipo especificado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendMessage(req, res) {
    try {
      const { type, recipient, subject, content } = req.body;

      // Validar tipo de mensaje
      if (!type || !['whatsapp', 'email'].includes(type)) {
        return respondError(req, res, 400, 'Tipo de mensaje debe ser "whatsapp" o "email"');
      }

      if (type === 'whatsapp') {
        return this.sendWhatsAppMessage(req, res);
      } else {
        return this.sendEmail(req, res);
      }
    } catch (error) {
      console.error('Error in sendMessage controller:', error);
      return respondError(req, res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Obtiene el estado de configuración de los servicios de mensajería
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getConfigurationStatus(req, res) {
    try {
      const config = messagingService.checkConfiguration();
      
      return respondSuccess(req, res, 200, {
        message: 'Estado de configuración obtenido',
        configuration: config,
        services: {
          whatsapp: config.whatsapp.twilio.configured || config.whatsapp.alternative.configured,
          email: config.email.configured
        }
      });
    } catch (error) {
      console.error('Error in getConfigurationStatus controller:', error);
      return respondError(req, res, 500, 'Error interno del servidor');
    }
  }

  /**
   * Envía un mensaje de prueba para verificar la configuración
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async sendTestMessage(req, res) {
    try {
      const { type, recipient } = req.body;

      if (!type || !['whatsapp', 'email'].includes(type)) {
        return respondError(req, res, 400, 'Tipo de mensaje debe ser "whatsapp" o "email"');
      }

      if (!recipient) {
        return respondError(req, res, 400, 'Destinatario es requerido');
      }

      const testMessage = 'Este es un mensaje de prueba del sistema GPS. Si recibes este mensaje, la configuración está funcionando correctamente.';

      if (type === 'whatsapp') {
        const result = await messagingService.sendWhatsAppMessage(recipient, testMessage);
        if (result.success) {
          return respondSuccess(req, res, 200, { message: 'Mensaje de prueba de WhatsApp enviado correctamente' });
        } else {
          return respondError(req, res, 500, 'Error al enviar mensaje de prueba de WhatsApp', { error: result.error });
        }
      } else {
        const result = await messagingService.sendEmail(recipient, 'Mensaje de Prueba - GPS', testMessage);
        if (result.success) {
          return respondSuccess(req, res, 200, { message: 'Mensaje de prueba de email enviado correctamente' });
        } else {
          return respondError(req, res, 500, 'Error al enviar mensaje de prueba de email', { error: result.error });
        }
      }
    } catch (error) {
      console.error('Error in sendTestMessage controller:', error);
      return respondError(req, res, 500, 'Error interno del servidor');
    }
  }
}

export default new MessagingController(); 