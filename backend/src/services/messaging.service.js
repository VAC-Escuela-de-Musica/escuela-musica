import nodemailer from 'nodemailer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class MessagingService {
  constructor() {
    // Configuración de Nodemailer para Email
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail', // Puedes cambiar a 'outlook', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // Usar contraseña de aplicación para Gmail
      }
    });
  }

  /**
   * Envía un mensaje de WhatsApp usando APIs gratuitas
   * @param {string} to - Número de teléfono del destinatario (con código de país)
   * @param {string} message - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppMessage(to, message) {
    try {
      // Formatear el número de teléfono
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Opción 1: Usar API gratuita de WhatsApp (ejemplo con una API pública)
      // Nota: Esta es una simulación, en producción necesitarías una API real
      
      // Simular envío exitoso para pruebas
      console.log('Simulando envío de WhatsApp a:', formattedNumber);
      console.log('Mensaje:', message);
      
      // En un entorno real, aquí harías la llamada a la API
      // const response = await axios.post('https://api.whatsapp.com/send', {
      //   phone: formattedNumber,
      //   message: message
      // });
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        status: 'sent',
        message: 'Mensaje de WhatsApp enviado correctamente (simulado)'
      };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar mensaje de WhatsApp'
      };
    }
  }

  /**
   * Envía un email usando Nodemailer
   * @param {string} to - Email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} content - Contenido del email
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendEmail(to, subject, content) {
    try {
      // Cargar configuración dinámica
      const configPath = path.join(process.cwd(), 'email-config.json');
      let config = null;
      
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(configData);
      }

      // Si no hay configuración dinámica, usar variables de entorno
      if (!config || !config.enabled) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
          return {
            success: false,
            error: 'Configuración de email no encontrada',
            message: 'Configure el email desde el panel de administración'
          };
        }
        
        config = {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || '587',
          secure: process.env.EMAIL_SECURE === 'true',
          user: process.env.EMAIL_USER,
          password: process.env.EMAIL_PASSWORD,
          fromName: process.env.EMAIL_FROM_NAME || 'GPS System',
          fromEmail: process.env.EMAIL_USER
        };
      }

      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password
        }
      });

      const result = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
        to: to,
        subject: subject,
        html: this.formatEmailContent(content),
        text: content
      });

      console.log('Email sent successfully:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId,
        status: 'sent',
        message: 'Email enviado correctamente'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar email'
      };
    }
  }

  /**
   * Envía un mensaje usando WhatsApp Web API (simulación)
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} message - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppAlternative(to, message) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Simular envío usando WhatsApp Web API
      console.log('Simulando envío alternativo de WhatsApp a:', formattedNumber);
      console.log('Mensaje:', message);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        messageId: `alt_${Date.now()}`,
        status: 'sent',
        message: 'Mensaje de WhatsApp enviado correctamente (simulado)'
      };
    } catch (error) {
      console.error('Error sending WhatsApp message (alternative):', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar mensaje de WhatsApp'
      };
    }
  }

  /**
   * Envía un mensaje de WhatsApp usando WhatsApp Business API
   * @param {string} to - Número de teléfono del destinatario (con código de país)
   * @param {string} message - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppBusinessAPI(to, message) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: formattedNumber,
          type: "text",
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('WhatsApp Business API message sent successfully:', response.data);
      
      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: 'sent',
        message: 'Mensaje de WhatsApp enviado correctamente'
      };
    } catch (error) {
      console.error('Error sending WhatsApp Business API message:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar mensaje de WhatsApp'
      };
    }
  }

  /**
   * Envía un mensaje de WhatsApp usando Callmebot
   * @param {string} to - Número de teléfono del destinatario (con código de país)
   * @param {string} message - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendWhatsAppCallmebot(to, message) {
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      
      const response = await axios.get(
        `https://api.callmebot.com/whatsapp.php`,
        {
          params: {
            phone: formattedNumber,
            text: message,
            apikey: process.env.CALLMEBOT_API_KEY
          }
        }
      );

      console.log('Callmebot WhatsApp message sent successfully:', response.data);
      
      return {
        success: true,
        messageId: `callmebot_${Date.now()}`,
        status: 'sent',
        message: 'Mensaje de WhatsApp enviado correctamente'
      };
    } catch (error) {
      console.error('Error sending Callmebot WhatsApp message:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar mensaje de WhatsApp'
      };
    }
  }

  /**
   * Formatea el número de teléfono para WhatsApp
   * @param {string} phoneNumber - Número de teléfono
   * @returns {string} - Número formateado
   */
  formatPhoneNumber(phoneNumber) {
    // Remover espacios, guiones y paréntesis
    let formatted = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Asegurar que tenga el código de país
    if (!formatted.startsWith('+')) {
      // Si no tiene +, asumir que es código de país español
      formatted = '+34' + formatted;
    }
    
    return formatted;
  }

  /**
   * Formatea el contenido del email con HTML
   * @param {string} content - Contenido del email
   * @returns {string} - Contenido formateado en HTML
   */
  formatEmailContent(content) {
    // Convertir saltos de línea en <br> para HTML
    const htmlContent = content.replace(/\n/g, '<br>');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 0 0 5px 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>GPS - Sistema de Gestión Académica</h2>
          </div>
          <div class="content">
            ${htmlContent}
          </div>
          <div class="footer">
            <p>Este es un mensaje automático del sistema GPS.</p>
            <p>Por favor, no responda a este email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Verifica la configuración de los servicios
   * @returns {Object} - Estado de la configuración
   */
  checkConfiguration() {
    const config = {
      whatsapp: {
        twilio: {
          configured: false, // Deshabilitado para pruebas
          missing: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER']
        },
        businessAPI: {
          configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
          missing: []
        },
        callmebot: {
          configured: !!process.env.CALLMEBOT_API_KEY,
          missing: []
        },
        alternative: {
          configured: true, // Siempre disponible para simulación
          missing: []
        }
      },
      email: {
        configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        missing: []
      }
    };

    // Verificar variables de WhatsApp Business API
    if (!process.env.WHATSAPP_ACCESS_TOKEN) config.whatsapp.businessAPI.missing.push('WHATSAPP_ACCESS_TOKEN');
    if (!process.env.WHATSAPP_PHONE_NUMBER_ID) config.whatsapp.businessAPI.missing.push('WHATSAPP_PHONE_NUMBER_ID');
    
    // Verificar variables de Callmebot
    if (!process.env.CALLMEBOT_API_KEY) config.whatsapp.callmebot.missing.push('CALLMEBOT_API_KEY');
    
    // Verificar variables de email
    if (!process.env.EMAIL_USER) config.email.missing.push('EMAIL_USER');
    if (!process.env.EMAIL_PASSWORD) config.email.missing.push('EMAIL_PASSWORD');

    return config;
  }
}

export default new MessagingService(); 