const API_BASE_URL = 'http://localhost:1230/api';

class MessagingService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Realiza una petición HTTP con autenticación
   */
  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };


    try {
      console.log('🌐 Frontend Service: Haciendo petición a:', `${this.baseURL}${endpoint}`);
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      console.log('📡 Frontend Service: Respuesta recibida:', {
        status: response.status,
        ok: response.ok,
        data: data
      });
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Frontend Service: Error en petición:', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} message - Contenido del mensaje
   */
  async sendWhatsAppMessage(phoneNumber, message) {
    return this.makeRequest('/messaging/send-whatsapp', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        message
      })
    });
  }

  /**
   * Envía un email
   * @param {string} email - Email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} content - Contenido del email
   */
  async sendEmail(email, subject, content) {
    return this.makeRequest('/messaging/send-email', {
      method: 'POST',
      body: JSON.stringify({
        email,
        subject,
        content
      })
    });
  }

  /**
   * Envía un mensaje genérico (WhatsApp o Email)
   * @param {string} type - Tipo de mensaje ('whatsapp' o 'email')
   * @param {string} recipient - Destinatario (teléfono o email)
   * @param {string} subject - Asunto (solo para email)
   * @param {string} content - Contenido del mensaje
   */
  async sendMessage(type, recipient, subject, content) {
    return this.makeRequest('/messaging/send-message', {
      method: 'POST',
      body: JSON.stringify({
        type,
        recipient,
        subject,
        content
      })
    });
  }

  /**
   * Obtiene el estado de configuración de los servicios
   */
  async getConfigurationStatus() {
    return this.makeRequest('/messaging/config-status', {
      method: 'GET'
    });
  }

  /**
   * Envía un mensaje de prueba
   * @param {string} type - Tipo de mensaje ('whatsapp' o 'email')
   * @param {string} recipient - Destinatario
   */
  async sendTestMessage(type, recipient) {
    return this.makeRequest('/messaging/test-message', {
      method: 'POST',
      body: JSON.stringify({
        type,
        recipient
      })
    });
  }

  /**
   * Obtiene la configuración de email
   */
  async getEmailConfig() {
    return this.makeRequest('/messaging/email-config', {
      method: 'GET'
    });
  }

  /**
   * Guarda la configuración de email
   * @param {Object} config - Configuración de email
   */
  async saveEmailConfig(config) {
    return this.makeRequest('/messaging/email-config', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  /**
   * Prueba la configuración de email
   * @param {Object} testData - Datos de prueba
   */
  async testEmailConfig(testData) {
    return this.makeRequest('/messaging/test-email-config', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  /**
   * Obtiene las plantillas de email
   */
  async getEmailTemplates() {
    return this.makeRequest('/messaging/email-templates', {
      method: 'GET'
    });
  }

  /**
   * Agrega una nueva plantilla de email
   * @param {Object} template - Plantilla de email
   */
  async addEmailTemplate(template) {
    return this.makeRequest('/messaging/email-templates', {
      method: 'POST',
      body: JSON.stringify(template)
    });
  }

  /**
   * Actualiza una plantilla de email
   * @param {string} id - ID de la plantilla
   * @param {Object} template - Plantilla actualizada
   */
  async updateEmailTemplate(id, template) {
    return this.makeRequest(`/messaging/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template)
    });
  }

  /**
   * Elimina una plantilla de email
   * @param {string} id - ID de la plantilla
   */
  async deleteEmailTemplate(id) {
    return this.makeRequest(`/messaging/email-templates/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Obtiene el estado de WhatsApp Web
   */
  async getWhatsAppWebStatus() {
    return this.makeRequest('/messaging/whatsapp-web/status', {
      method: 'GET'
    });
  }

  /**
   * Inicializa WhatsApp Web
   */
  async initializeWhatsAppWeb() {
    return this.makeRequest('/messaging/whatsapp-web/initialize', {
      method: 'POST'
    });
  }

  /**
   * Obtiene el código QR de WhatsApp Web
   */
  async getWhatsAppWebQR() {
    console.log('🔍 Frontend Service: Obteniendo QR...');
    // Agregar timestamp para evitar caché del navegador
    const timestamp = new Date().getTime();
    const response = await this.makeRequest(`/messaging/whatsapp-web/qr?t=${timestamp}`, {
      method: 'GET'
      // Sin headers personalizados - usa solo los headers por defecto con autenticación
    });
    console.log('📱 Frontend Service: Respuesta QR recibida:', response);
    return response;
  }

  /**
   * Resetea/limpia la sesión de WhatsApp Web
   */
  async resetWhatsAppWeb() {
    console.log('🔄 Frontend Service: Reseteando WhatsApp Web...');
    const response = await this.makeRequest('/messaging/whatsapp-web/reset', {
      method: 'POST'
    });
    console.log('✅ Frontend Service: WhatsApp Web reseteado:', response);
    return response;
  }
}

export default new MessagingService();