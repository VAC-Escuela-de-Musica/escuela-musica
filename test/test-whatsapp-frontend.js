/**
 * Test del Frontend de WhatsApp
 * Sistema GPS - Escuela de Música
 * 
 * Este test verifica el componente WhatsAppConfig y la integración frontend
 */

import axios from 'axios';

// Configuración del test
const CONFIG = {
  baseURL: 'http://localhost:3000',
  frontendURL: 'http://localhost:5173', // URL típica de Vite
  testPhone: '+56912345678',
  testMessage: 'Test desde frontend - GPS System'
};

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
};

/**
 * Simulador del servicio de mensajería del frontend
 */
class MockMessagingService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  setAuthToken(token) {
    this.token = token;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const config = {
        method: options.method || 'GET',
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...options.headers
        },
        timeout: 10000
      };

      if (options.body) {
        config.data = JSON.parse(options.body);
      }

      const response = await axios(config);
      return {
        ok: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      return {
        ok: false,
        status: error.response?.status || 500,
        error: error.response?.data || error.message
      };
    }
  }

  // Métodos que simula el messagingService.js del frontend
  async getWhatsAppWebStatus() {
    const response = await this.makeRequest('/api/messaging/whatsapp-web/status');
    if (!response.ok) {
      throw new Error(`Error getting WhatsApp Web status: ${response.error}`);
    }
    return response.data;
  }

  async initializeWhatsAppWeb() {
    const response = await this.makeRequest('/api/messaging/whatsapp-web/initialize', {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error(`Error initializing WhatsApp Web: ${response.error}`);
    }
    return response.data;
  }

  async getWhatsAppWebQR() {
    const response = await this.makeRequest('/api/messaging/whatsapp-web/qr');
    if (!response.ok) {
      throw new Error(`Error getting QR code: ${response.error}`);
    }
    return response.data;
  }

  async sendWhatsAppMessage(phoneNumber, message) {
    const response = await this.makeRequest('/api/messaging/send-whatsapp', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, message })
    });
    if (!response.ok) {
      throw new Error(`Error sending WhatsApp message: ${response.error}`);
    }
    return response.data;
  }

  async getConfigurationStatus() {
    const response = await this.makeRequest('/api/messaging/config-status');
    if (!response.ok) {
      throw new Error(`Error getting configuration status: ${response.error}`);
    }
    return response.data;
  }
}

/**
 * Simulador del estado del componente WhatsAppConfig
 */
class MockWhatsAppConfig {
  constructor(messagingService) {
    this.messagingService = messagingService;
    this.state = {
      status: null,
      qrCode: null,
      qrCodeImage: null,
      isLoading: false,
      message: '',
      testPhone: '',
      testMessage: '',
      alertInfo: { type: '', message: '' },
      showQRDialog: false
    };
  }

  // Simula el método loadStatus del componente
  async loadStatus() {
    try {
      this.state.isLoading = true;
      const response = await this.messagingService.getWhatsAppWebStatus();
      this.state.status = response.data || response;
      this.state.isLoading = false;
      return this.state.status;
    } catch (error) {
      this.state.isLoading = false;
      throw error;
    }
  }

  // Simula el método initializeWhatsApp del componente
  async initializeWhatsApp() {
    try {
      this.state.isLoading = true;
      await this.messagingService.initializeWhatsAppWeb();
      
      // Esperar un poco y cargar el estado
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.loadStatus();
      
      this.state.isLoading = false;
      return true;
    } catch (error) {
      this.state.isLoading = false;
      throw error;
    }
  }

  // Simula el método loadQRCode del componente
  async loadQRCode() {
    try {
      const response = await this.messagingService.getWhatsAppWebQR();
      const qrInfo = response.data || response;
      
      this.state.qrCode = qrInfo.qrCode;
      this.state.qrCodeImage = qrInfo.qrCodeImage;
      
      return qrInfo;
    } catch (error) {
      throw error;
    }
  }

  // Simula el método sendTestMessage del componente
  async sendTestMessage(phone, message) {
    try {
      this.state.isLoading = true;
      const response = await this.messagingService.sendWhatsAppMessage(phone, message);
      this.state.isLoading = false;
      return response;
    } catch (error) {
      this.state.isLoading = false;
      throw error;
    }
  }
}

/**
 * Test de autenticación
 */
async function testAuthentication(messagingService) {
  log.title('PROBANDO AUTENTICACIÓN');
  
  try {
    // Intentar login con credenciales por defecto
    const response = await messagingService.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (response.ok && response.data.token) {
      messagingService.setAuthToken(response.data.token);
      log.success('Autenticación exitosa');
      return true;
    } else {
      log.warning('No se pudo autenticar con credenciales por defecto');
      return false;
    }
  } catch (error) {
    log.warning('Error en autenticación: ' + error.message);
    return false;
  }
}

/**
 * Test del servicio de mensajería del frontend
 */
async function testMessagingService(messagingService) {
  log.title('PROBANDO SERVICIO DE MENSAJERÍA DEL FRONTEND');
  
  try {
    // Test de estado de configuración
    log.info('Obteniendo estado de configuración...');
    const configStatus = await messagingService.getConfigurationStatus();
    console.log('  - Configuración obtenida: ✅');
    
    // Test de estado de WhatsApp Web
    log.info('Obteniendo estado de WhatsApp Web...');
    const status = await messagingService.getWhatsAppWebStatus();
    console.log('  - Estado obtenido: ✅');
    console.log('    - Inicializado:', status.data?.initialized || status.initialized ? '✅' : '❌');
    console.log('    - Listo:', status.data?.ready || status.ready ? '✅' : '❌');
    
    return { configStatus, status };
  } catch (error) {
    log.error('Error en servicio de mensajería: ' + error.message);
    throw error;
  }
}

/**
 * Test del componente WhatsAppConfig simulado
 */
async function testWhatsAppConfigComponent(messagingService) {
  log.title('PROBANDO COMPONENTE WHATSAPPCONFIG');
  
  const component = new MockWhatsAppConfig(messagingService);
  
  try {
    // Test de carga inicial de estado
    log.info('Cargando estado inicial...');
    const initialStatus = await component.loadStatus();
    console.log('  - Estado inicial cargado: ✅');
    console.log('    - Inicializado:', initialStatus.initialized ? '✅' : '❌');
    console.log('    - Listo:', initialStatus.ready ? '✅' : '❌');
    
    // Test de inicialización si no está inicializado
    if (!initialStatus.initialized) {
      log.info('Inicializando WhatsApp Web...');
      await component.initializeWhatsApp();
      console.log('  - Inicialización completada: ✅');
    }
    
    // Test de carga de código QR
    log.info('Cargando código QR...');
    const qrInfo = await component.loadQRCode();
    
    if (qrInfo.qrCode) {
      console.log('  - Código QR obtenido: ✅');
      console.log('    - Longitud:', qrInfo.qrCode.length);
      
      if (qrInfo.qrCodeImage) {
        console.log('  - Imagen QR obtenida: ✅');
        console.log('    - Tamaño:', qrInfo.qrCodeImage.length, 'caracteres');
      }
    } else {
      console.log('  - No hay código QR disponible (posiblemente autenticado): ℹ️');
    }
    
    // Test de envío de mensaje de prueba
    log.info('Probando envío de mensaje...');
    try {
      const messageResult = await component.sendTestMessage(
        CONFIG.testPhone,
        CONFIG.testMessage
      );
      console.log('  - Mensaje enviado: ✅');
      console.log('    - Resultado:', messageResult.data?.message || messageResult.message);
    } catch (error) {
      console.log('  - Error en envío:', error.message);
      log.info('    (Esto es normal si WhatsApp Web no está autenticado)');
    }
    
    return component;
  } catch (error) {
    log.error('Error en componente: ' + error.message);
    throw error;
  }
}

/**
 * Test de flujo completo del usuario
 */
async function testUserFlow(messagingService) {
  log.title('PROBANDO FLUJO COMPLETO DEL USUARIO');
  
  log.info('Simulando flujo típico del usuario:');
  
  try {
    // 1. Usuario abre la página de configuración
    console.log('  1. Usuario abre configuración de WhatsApp');
    const component = new MockWhatsAppConfig(messagingService);
    await component.loadStatus();
    console.log('     - Estado cargado: ✅');
    
    // 2. Usuario hace clic en "Inicializar WhatsApp Web"
    console.log('  2. Usuario inicializa WhatsApp Web');
    if (!component.state.status?.initialized) {
      await component.initializeWhatsApp();
      console.log('     - Inicialización completada: ✅');
    } else {
      console.log('     - Ya estaba inicializado: ✅');
    }
    
    // 3. Usuario hace clic en "Generar Código QR"
    console.log('  3. Usuario genera código QR');
    const qrInfo = await component.loadQRCode();
    if (qrInfo.qrCode) {
      console.log('     - QR generado: ✅');
    } else {
      console.log('     - QR no disponible: ℹ️');
    }
    
    // 4. Usuario ingresa datos de prueba
    console.log('  4. Usuario ingresa datos de prueba');
    component.state.testPhone = CONFIG.testPhone;
    component.state.testMessage = CONFIG.testMessage;
    console.log('     - Datos ingresados: ✅');
    
    // 5. Usuario envía mensaje de prueba
    console.log('  5. Usuario envía mensaje de prueba');
    try {
      await component.sendTestMessage(
        component.state.testPhone,
        component.state.testMessage
      );
      console.log('     - Mensaje enviado: ✅');
    } catch (error) {
      console.log('     - Error en envío (esperado si no autenticado): ⚠️');
    }
    
    log.success('Flujo de usuario completado');
    
  } catch (error) {
    log.error('Error en flujo de usuario: ' + error.message);
  }
}

/**
 * Test de validaciones del frontend
 */
function testFrontendValidations() {
  log.title('PROBANDO VALIDACIONES DEL FRONTEND');
  
  const component = new MockWhatsAppConfig(new MockMessagingService(CONFIG.baseURL));
  
  // Test de validación de teléfono
  log.info('Probando validaciones de entrada...');
  
  const testCases = [
    { phone: '', message: 'Test', valid: false, description: 'Teléfono vacío' },
    { phone: CONFIG.testPhone, message: '', valid: false, description: 'Mensaje vacío' },
    { phone: 'invalid', message: 'Test', valid: true, description: 'Teléfono inválido (se permite)' },
    { phone: CONFIG.testPhone, message: CONFIG.testMessage, valid: true, description: 'Datos válidos' }
  ];
  
  testCases.forEach((testCase, index) => {
    const isValid = testCase.phone && testCase.message;
    const result = isValid === testCase.valid ? '✅' : '❌';
    console.log(`  ${index + 1}. ${testCase.description}: ${result}`);
  });
}

/**
 * Test de manejo de errores del frontend
 */
async function testFrontendErrorHandling(messagingService) {
  log.title('PROBANDO MANEJO DE ERRORES DEL FRONTEND');
  
  // Crear un servicio con URL incorrecta para simular errores
  const errorService = new MockMessagingService('http://localhost:9999');
  const component = new MockWhatsAppConfig(errorService);
  
  log.info('Probando manejo de errores de red...');
  
  try {
    await component.loadStatus();
    console.log('  - Error de red: ❌ (debería haber fallado)');
  } catch (error) {
    console.log('  - Error de red manejado correctamente: ✅');
  }
  
  // Test con servicio real pero endpoint inexistente
  log.info('Probando manejo de errores de API...');
  
  try {
    await messagingService.makeRequest('/api/endpoint-inexistente');
    console.log('  - Error de API: ❌ (debería haber fallado)');
  } catch (error) {
    console.log('  - Error de API manejado correctamente: ✅');
  }
}

/**
 * Función principal del test
 */
async function runFrontendWhatsAppTest() {
  log.title('INICIANDO TEST DEL FRONTEND DE WHATSAPP');
  
  console.log('Este test verificará:');
  console.log('  1. Servicio de mensajería del frontend');
  console.log('  2. Componente WhatsAppConfig simulado');
  console.log('  3. Flujo completo del usuario');
  console.log('  4. Validaciones del frontend');
  console.log('  5. Manejo de errores');
  
  const messagingService = new MockMessagingService(CONFIG.baseURL);
  
  try {
    // Verificar conectividad con el backend
    log.info('Verificando conectividad con el backend...');
    const healthCheck = await messagingService.makeRequest('/api/health');
    if (!healthCheck.ok) {
      const altCheck = await messagingService.makeRequest('/');
      if (!altCheck.ok) {
        throw new Error('No se puede conectar al backend');
      }
    }
    log.success('Backend accesible');
    
    // Intentar autenticación
    await testAuthentication(messagingService);
    
    // Ejecutar tests
    await testMessagingService(messagingService);
    await testWhatsAppConfigComponent(messagingService);
    await testUserFlow(messagingService);
    testFrontendValidations();
    await testFrontendErrorHandling(messagingService);
    
    log.title('TEST DEL FRONTEND COMPLETADO');
    log.success('Todos los tests del frontend han sido ejecutados');
    
    log.info('Notas importantes:');
    console.log('  - Este test simula el comportamiento del componente React');
    console.log('  - Para probar la UI real, abre el navegador en ' + CONFIG.frontendURL);
    console.log('  - Navega a la sección de configuración de WhatsApp');
    console.log('  - Verifica que todos los botones y campos funcionen correctamente');
    
  } catch (error) {
    log.error('Error durante el test del frontend: ' + error.message);
    console.error(error.stack);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runFrontendWhatsAppTest();
}

export default runFrontendWhatsAppTest;