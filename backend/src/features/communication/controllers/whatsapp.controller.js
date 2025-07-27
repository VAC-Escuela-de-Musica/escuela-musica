import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { WhatsAppService } from '../services/whatsapp.service.js';

let whatsappClient = null;
let isInitialized = false;
let currentQR = null;

// Inicializar cliente de WhatsApp
async function initializeWhatsApp(req, res) {
  try {
    if (isInitialized && whatsappClient) {
      return res.status(200).json({
        success: true,
        message: 'WhatsApp ya está inicializado',
        status: 'ready'
      });
    }

    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    whatsappClient.on('qr', (qr) => {
      console.log('QR RECIBIDO:', qr);
      currentQR = qr;
    });

    whatsappClient.on('ready', () => {
      console.log('Cliente WhatsApp listo!');
      isInitialized = true;
      currentQR = null; // Limpiar QR cuando esté listo
    });

    whatsappClient.on('authenticated', () => {
      console.log('WhatsApp autenticado!');
      currentQR = null; // Limpiar QR cuando se autentique
    });

    whatsappClient.on('auth_failure', (msg) => {
      console.log('Error de autenticación WhatsApp:', msg);
      isInitialized = false;
    });

    whatsappClient.on('disconnected', (reason) => {
      console.log('Cliente WhatsApp desconectado:', reason);
      isInitialized = false;
    });

    await whatsappClient.initialize();

    res.status(200).json({
      success: true,
      message: 'WhatsApp inicializado correctamente',
      status: 'initializing'
    });

  } catch (error) {
    console.error('Error al inicializar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al inicializar WhatsApp',
      error: error.message
    });
  }
}

// Obtener QR actual
async function getWhatsAppQR(req, res) {
  try {
    if (!currentQR) {
      return res.status(404).json({
        success: false,
        message: 'No hay código QR disponible'
      });
    }

    res.status(200).json({
      success: true,
      qr: currentQR,
      message: 'Código QR disponible'
    });

  } catch (error) {
    console.error('Error al obtener QR de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener QR de WhatsApp',
      error: error.message
    });
  }
}

// Obtener estado de WhatsApp
async function getWhatsAppStatus(req, res) {
  try {
    if (!whatsappClient) {
      return res.status(200).json({
        success: true,
        status: 'not_initialized',
        message: 'WhatsApp no está inicializado'
      });
    }

    const isReady = whatsappClient.info ? true : false;
    
    res.status(200).json({
      success: true,
      status: isReady ? 'ready' : 'initializing',
      message: isReady ? 'WhatsApp está listo' : 'WhatsApp se está inicializando',
      hasQR: !!currentQR,
      info: isReady ? {
        wid: whatsappClient.info.wid._serialized,
        platform: whatsappClient.info.platform,
        pushname: whatsappClient.info.pushname
      } : null
    });

  } catch (error) {
    console.error('Error al obtener estado de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado de WhatsApp',
      error: error.message
    });
  }
}

// Enviar mensaje de WhatsApp
async function sendWhatsAppMessage(req, res) {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número de teléfono y mensaje son requeridos'
      });
    }

    if (!whatsappClient || !isInitialized) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está inicializado'
      });
    }

    // Formatear número de teléfono (agregar código de país si no está presente)
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('56')) {
      formattedPhone = '56' + formattedPhone;
    }
    formattedPhone = formattedPhone + '@c.us';

    const result = await WhatsAppService.sendMessage(whatsappClient, formattedPhone, message);

    res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: result
    });

  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje de WhatsApp',
      error: error.message
    });
  }
}

// Enviar mensaje de prueba
async function sendTestWhatsAppMessage(req, res) {
  try {
    const { testPhone, testMessage } = req.body;

    if (!testPhone || !testMessage) {
      return res.status(400).json({
        success: false,
        message: 'Número de teléfono de prueba y mensaje son requeridos'
      });
    }

    if (!whatsappClient || !isInitialized) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp no está inicializado'
      });
    }

    // Formatear número de teléfono
    let formattedPhone = testPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('56')) {
      formattedPhone = '56' + formattedPhone;
    }
    formattedPhone = formattedPhone + '@c.us';

    const result = await WhatsAppService.sendMessage(whatsappClient, formattedPhone, testMessage);

    res.status(200).json({
      success: true,
      message: 'Mensaje de prueba enviado correctamente',
      data: result
    });

  } catch (error) {
    console.error('Error al enviar mensaje de prueba de WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje de prueba de WhatsApp',
      error: error.message
    });
  }
}

// Desconectar WhatsApp
async function disconnectWhatsApp(req, res) {
  try {
    if (whatsappClient) {
      await whatsappClient.destroy();
      whatsappClient = null;
      isInitialized = false;
    }

    res.status(200).json({
      success: true,
      message: 'WhatsApp desconectado correctamente'
    });

  } catch (error) {
    console.error('Error al desconectar WhatsApp:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desconectar WhatsApp',
      error: error.message
    });
  }
}

export {
  initializeWhatsApp,
  getWhatsAppStatus,
  getWhatsAppQR,
  sendWhatsAppMessage,
  sendTestWhatsAppMessage,
  disconnectWhatsApp
}; 