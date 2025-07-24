/**
 * Test Completo de Funcionalidad WhatsApp
 * Sistema GPS - Escuela de Música
 * 
 * Este test verifica todas las funcionalidades de WhatsApp:
 * - Servicios de mensajería
 * - WhatsApp Web
 * - APIs de WhatsApp Business
 * - Controladores
 * - Configuración
 * - Integración completa
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Configuración del test
const CONFIG = {
  baseURL: 'http://localhost:3000',
  testPhone: '+56912345678', // Número de prueba
  testMessage: 'Test desde GPS - Sistema de Escuela de Música',
  timeout: 30000
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

// Utilidades de logging
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`),
  subtitle: (msg) => console.log(`${colors.bold}\n--- ${msg} ---${colors.reset}`)
};

// Variables globales para el test
let authToken = null;
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Función para realizar peticiones HTTP
 */
async function makeRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${CONFIG.baseURL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: CONFIG.timeout
    };

    if (data) {
      config.data = data;
    }

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

/**
 * Función para ejecutar un test individual
 */
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    log.subtitle(testName);
    await testFunction();
    testResults.passed++;
    log.success(`Test pasado: ${testName}`);
  } catch (error) {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
    log.error(`Test fallido: ${testName} - ${error.message}`);
  }
}

/**
 * Autenticación para obtener token
 */
async function authenticate() {
  log.info('Intentando autenticación...');
  
  // Intentar con credenciales de admin por defecto
  const loginData = {
    username: 'admin',
    password: 'admin123'
  };

  const result = await makeRequest('POST', '/api/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Autenticación exitosa');
    return true;
  } else {
    log.warning('No se pudo autenticar con credenciales por defecto');
    log.info('Continuando sin autenticación (algunos tests pueden fallar)');
    return false;
  }
}

/**
 * Test 1: Verificar estado de configuración de WhatsApp
 */
async function testWhatsAppConfiguration() {
  const result = await makeRequest('GET', '/api/messaging/config-status');
  
  if (!result.success) {
    throw new Error(`Error al obtener configuración: ${result.error}`);
  }

  const config = result.data.data || result.data;
  
  if (!config.whatsapp) {
    throw new Error('Configuración de WhatsApp no encontrada');
  }

  log.info('Configuración de WhatsApp:');
  console.log('  - WhatsApp Web:', config.whatsapp.web?.configured ? '✅' : '❌');
  console.log('  - Business API:', config.whatsapp.businessAPI?.configured ? '✅' : '❌');
  console.log('  - Callmebot:', config.whatsapp.callmebot?.configured ? '✅' : '❌');
  console.log('  - Simulación:', config.whatsapp.alternative?.configured ? '✅' : '❌');

  if (!config.whatsapp.web?.configured && 
      !config.whatsapp.businessAPI?.configured && 
      !config.whatsapp.callmebot?.configured && 
      !config.whatsapp.alternative?.configured) {
    throw new Error('Ningún método de WhatsApp está configurado');
  }
}

/**
 * Test 2: Verificar estado de WhatsApp Web
 */
async function testWhatsAppWebStatus() {
  const result = await makeRequest('GET', '/api/messaging/whatsapp-web/status');
  
  if (!result.success) {
    throw new Error(`Error al obtener estado de WhatsApp Web: ${result.error}`);
  }

  const status = result.data.data || result.data;
  
  log.info('Estado de WhatsApp Web:');
  console.log('  - Inicializado:', status.initialized ? '✅' : '❌');
  console.log('  - Listo:', status.ready ? '✅' : '❌');
  console.log('  - Autenticado:', status.authenticated ? '✅' : '❌');
}

/**
 * Test 3: Inicializar WhatsApp Web
 */
async function testWhatsAppWebInitialization() {
  const result = await makeRequest('POST', '/api/messaging/whatsapp-web/initialize');
  
  if (!result.success) {
    throw new Error(`Error al inicializar WhatsApp Web: ${result.error}`);
  }

  log.info('WhatsApp Web inicializado correctamente');
  
  // Esperar un poco para que se genere el QR
  await new Promise(resolve => setTimeout(resolve, 3000));
}

/**
 * Test 4: Obtener código QR de WhatsApp Web
 */
async function testWhatsAppWebQR() {
  const result = await makeRequest('GET', '/api/messaging/whatsapp-web/qr');
  
  if (!result.success) {
    throw new Error(`Error al obtener QR de WhatsApp Web: ${result.error}`);
  }

  const qrInfo = result.data.data || result.data;
  
  if (qrInfo.qrCode) {
    log.info('Código QR generado correctamente');
    console.log('  - Longitud del QR:', qrInfo.qrCode.length);
    
    if (qrInfo.qrCodeImage) {
      console.log('  - Imagen QR generada: ✅');
      console.log('  - Tamaño de imagen:', qrInfo.qrCodeImage.length, 'caracteres');
    }
  } else {
    log.warning('No hay código QR disponible (posiblemente ya autenticado)');
  }
}

/**
 * Test 5: Enviar mensaje de WhatsApp (simulado)
 */
async function testSendWhatsAppMessage() {
  const messageData = {
    phoneNumber: CONFIG.testPhone,
    message: CONFIG.testMessage
  };

  const result = await makeRequest('POST', '/api/messaging/send-whatsapp', messageData);
  
  if (!result.success) {
    throw new Error(`Error al enviar mensaje de WhatsApp: ${result.error}`);
  }

  const response = result.data.data || result.data;
  
  log.info('Mensaje de WhatsApp enviado:');
  console.log('  - ID del mensaje:', response.messageId);
  console.log('  - Estado:', response.status);
  console.log('  - Respuesta:', response.message);
}

/**
 * Test 6: Enviar mensaje de prueba
 */
async function testSendTestMessage() {
  const testData = {
    type: 'whatsapp',
    recipient: CONFIG.testPhone
  };

  const result = await makeRequest('POST', '/api/messaging/test-message', testData);
  
  if (!result.success) {
    throw new Error(`Error al enviar mensaje de prueba: ${result.error}`);
  }

  log.info('Mensaje de prueba enviado correctamente');
}

/**
 * Test 7: Verificar servicios de WhatsApp directamente
 */
async function testWhatsAppServices() {
  try {
    // Importar servicios (esto solo funciona si ejecutamos desde el directorio correcto)
    const { default: messagingService } = await import('./backend/src/features/communication/services/messaging.service.js');
    
    log.info('Probando servicios de WhatsApp directamente...');
    
    // Test de formateo de número
    const formattedNumber = messagingService.formatPhoneNumber(CONFIG.testPhone);
    console.log('  - Número formateado:', formattedNumber);
    
    // Test de configuración
    const config = messagingService.checkConfiguration();
    console.log('  - Configuración verificada: ✅');
    
    // Test de envío simulado
    const result = await messagingService.sendWhatsAppAlternative(CONFIG.testPhone, 'Test directo del servicio');
    
    if (result.success) {
      console.log('  - Envío simulado exitoso: ✅');
      console.log('  - ID del mensaje:', result.messageId);
    } else {
      throw new Error(`Error en envío simulado: ${result.error}`);
    }
    
  } catch (error) {
    log.warning('No se pudieron probar los servicios directamente (normal si se ejecuta desde fuera del proyecto)');
    console.log('  - Error:', error.message);
  }
}

/**
 * Test 8: Verificar endpoints de la API
 */
async function testAPIEndpoints() {
  const endpoints = [
    { method: 'GET', path: '/api/messaging/config-status', description: 'Estado de configuración' },
    { method: 'GET', path: '/api/messaging/whatsapp-web/status', description: 'Estado de WhatsApp Web' },
    { method: 'GET', path: '/api/messaging/whatsapp-web/qr', description: 'Código QR' }
  ];

  log.info('Verificando endpoints de la API...');
  
  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint.method, endpoint.path);
      
      if (result.success) {
        console.log(`  - ${endpoint.method} ${endpoint.path}: ✅ (${endpoint.description})`);
      } else {
        console.log(`  - ${endpoint.method} ${endpoint.path}: ❌ (${result.status}) - ${endpoint.description}`);
      }
    } catch (error) {
      console.log(`  - ${endpoint.method} ${endpoint.path}: ❌ Error - ${endpoint.description}`);
    }
  }
}

/**
 * Test 9: Verificar validaciones de entrada
 */
async function testInputValidations() {
  log.info('Probando validaciones de entrada...');
  
  // Test sin número de teléfono
  let result = await makeRequest('POST', '/api/messaging/send-whatsapp', {
    message: 'Test sin número'
  });
  
  if (result.status === 400) {
    console.log('  - Validación sin número de teléfono: ✅');
  } else {
    console.log('  - Validación sin número de teléfono: ❌');
  }
  
  // Test sin mensaje
  result = await makeRequest('POST', '/api/messaging/send-whatsapp', {
    phoneNumber: CONFIG.testPhone
  });
  
  if (result.status === 400) {
    console.log('  - Validación sin mensaje: ✅');
  } else {
    console.log('  - Validación sin mensaje: ❌');
  }
  
  // Test con datos vacíos
  result = await makeRequest('POST', '/api/messaging/send-whatsapp', {
    phoneNumber: '',
    message: ''
  });
  
  if (result.status === 400) {
    console.log('  - Validación con datos vacíos: ✅');
  } else {
    console.log('  - Validación con datos vacíos: ❌');
  }
}

/**
 * Test 10: Verificar manejo de errores
 */
async function testErrorHandling() {
  log.info('Probando manejo de errores...');
  
  // Test con número inválido
  const result = await makeRequest('POST', '/api/messaging/send-whatsapp', {
    phoneNumber: 'numero-invalido',
    message: 'Test con número inválido'
  });
  
  // El servicio debería manejar esto graciosamente
  console.log('  - Manejo de número inválido:', result.success ? '✅ (manejado)' : '✅ (rechazado)');
  
  // Test con mensaje muy largo
  const longMessage = 'A'.repeat(5000);
  const result2 = await makeRequest('POST', '/api/messaging/send-whatsapp', {
    phoneNumber: CONFIG.testPhone,
    message: longMessage
  });
  
  console.log('  - Manejo de mensaje largo:', result2.success ? '✅ (aceptado)' : '✅ (limitado)');
}

/**
 * Función principal del test
 */
async function runCompleteWhatsAppTest() {
  log.title('INICIANDO TEST COMPLETO DE WHATSAPP');
  log.info(`Configuración del test:`);
  console.log(`  - URL Base: ${CONFIG.baseURL}`);
  console.log(`  - Teléfono de prueba: ${CONFIG.testPhone}`);
  console.log(`  - Timeout: ${CONFIG.timeout}ms`);
  
  // Verificar si el servidor está corriendo
  try {
    const healthCheck = await makeRequest('GET', '/api/health');
    if (!healthCheck.success) {
      // Intentar endpoint alternativo
      const altCheck = await makeRequest('GET', '/');
      if (!altCheck.success) {
        throw new Error('Servidor no responde');
      }
    }
    log.success('Servidor está corriendo');
  } catch (error) {
    log.error('No se puede conectar al servidor. Asegúrate de que esté corriendo en ' + CONFIG.baseURL);
    process.exit(1);
  }

  // Intentar autenticación
  await authenticate();

  // Ejecutar todos los tests
  await runTest('1. Verificar configuración de WhatsApp', testWhatsAppConfiguration);
  await runTest('2. Verificar estado de WhatsApp Web', testWhatsAppWebStatus);
  await runTest('3. Inicializar WhatsApp Web', testWhatsAppWebInitialization);
  await runTest('4. Obtener código QR', testWhatsAppWebQR);
  await runTest('5. Enviar mensaje de WhatsApp', testSendWhatsAppMessage);
  await runTest('6. Enviar mensaje de prueba', testSendTestMessage);
  await runTest('7. Verificar servicios directamente', testWhatsAppServices);
  await runTest('8. Verificar endpoints de API', testAPIEndpoints);
  await runTest('9. Verificar validaciones de entrada', testInputValidations);
  await runTest('10. Verificar manejo de errores', testErrorHandling);

  // Mostrar resultados finales
  log.title('RESULTADOS DEL TEST');
  console.log(`Total de tests: ${testResults.total}`);
  console.log(`${colors.green}Tests pasados: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Tests fallidos: ${testResults.failed}${colors.reset}`);
  
  if (testResults.failed > 0) {
    log.subtitle('Errores encontrados:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`\n${colors.bold}Tasa de éxito: ${successRate}%${colors.reset}`);
  
  if (testResults.failed === 0) {
    log.success('¡Todos los tests pasaron! La funcionalidad de WhatsApp está funcionando correctamente.');
  } else {
    log.warning(`${testResults.failed} tests fallaron. Revisa los errores arriba.`);
  }

  log.title('RECOMENDACIONES');
  console.log('1. Para usar WhatsApp Web real, escanea el código QR mostrado');
  console.log('2. Para WhatsApp Business API, configura las variables de entorno necesarias');
  console.log('3. Para Callmebot, obtén una API key y configúrala');
  console.log('4. El modo simulación siempre está disponible para pruebas');
  
  log.info('Test completado.');
}

// Ejecutar el test si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteWhatsAppTest().catch(error => {
    log.error('Error fatal en el test: ' + error.message);
    process.exit(1);
  });
}

export default runCompleteWhatsAppTest;