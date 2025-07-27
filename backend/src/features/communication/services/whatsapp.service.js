class WhatsAppService {
  // Enviar mensaje de WhatsApp
  static async sendMessage(client, phone, message) {
    try {
      // Verificar si el cliente está listo
      if (!client.info) {
        throw new Error('Cliente de WhatsApp no está listo');
      }

      // Verificar si el número existe
      const isRegistered = await client.isRegisteredUser(phone);
      if (!isRegistered) {
        throw new Error('El número de teléfono no está registrado en WhatsApp');
      }

      // Enviar mensaje
      const result = await client.sendMessage(phone, message);
      
      return {
        success: true,
        messageId: result.id._serialized,
        timestamp: result.timestamp,
        phone: phone,
        message: message
      };

    } catch (error) {
      console.error('Error en WhatsAppService.sendMessage:', error);
      throw error;
    }
  }

  // Enviar mensaje a múltiples números
  static async sendBulkMessage(client, phones, message) {
    try {
      const results = [];
      const errors = [];

      for (const phone of phones) {
        try {
          const result = await this.sendMessage(client, phone, message);
          results.push(result);
        } catch (error) {
          errors.push({
            phone: phone,
            error: error.message
          });
        }
      }

      return {
        success: true,
        sent: results.length,
        failed: errors.length,
        results: results,
        errors: errors
      };

    } catch (error) {
      console.error('Error en WhatsAppService.sendBulkMessage:', error);
      throw error;
    }
  }

  // Verificar estado de conexión
  static async checkConnection(client) {
    try {
      if (!client) {
        return {
          connected: false,
          status: 'not_initialized'
        };
      }

      if (!client.info) {
        return {
          connected: false,
          status: 'initializing'
        };
      }

      return {
        connected: true,
        status: 'ready',
        info: {
          wid: client.info.wid._serialized,
          platform: client.info.platform,
          pushname: client.info.pushname
        }
      };

    } catch (error) {
      console.error('Error en WhatsAppService.checkConnection:', error);
      return {
        connected: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Formatear número de teléfono
  static formatPhoneNumber(phone) {
    try {
      // Remover todos los caracteres no numéricos
      let formatted = phone.replace(/\D/g, '');
      
      // Agregar código de país si no está presente
      if (!formatted.startsWith('56')) {
        formatted = '56' + formatted;
      }
      
      // Agregar sufijo de WhatsApp
      return formatted + '@c.us';
      
    } catch (error) {
      console.error('Error en WhatsAppService.formatPhoneNumber:', error);
      throw new Error('Formato de número de teléfono inválido');
    }
  }

  // Validar número de teléfono
  static validatePhoneNumber(phone) {
    try {
      const formatted = this.formatPhoneNumber(phone);
      const numberOnly = formatted.replace('@c.us', '');
      
      // Verificar que tenga al menos 11 dígitos (56 + 9 dígitos)
      if (numberOnly.length < 11) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      return false;
    }
  }
}

export { WhatsAppService }; 