/**
 * Test específico para WhatsApp Web Service
 * Sistema GPS - Escuela de Música
 *
 * Este test se enfoca específicamente en el servicio de WhatsApp Web
 */

import whatsappWebService from './src/features/communication/services/whatsappWeb.service.js'
import messagingService from './src/features/communication/services/messaging.service.js'

// Configuración
const TEST_CONFIG = {
  testPhone: '+56912345678',
  testMessage: 'Test de WhatsApp Web desde GPS System',
  timeout: 30000
}

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.bold}${colors.blue}\n=== ${msg} ===${colors.reset}`)
}

/**
 * Test del estado inicial
 */
function testInitialState () {
  log.title('PROBANDO ESTADO INICIAL')

  const status = whatsappWebService.getStatus()

  log.info('Estado inicial de WhatsApp Web:')
  console.log('  - Inicializado:', status.initialized ? '✅' : '❌')
  console.log('  - Listo:', status.ready ? '✅' : '❌')
  console.log('  - Autenticado:', status.authenticated ? '✅' : '❌')

  if (!status.initialized) {
    log.info('WhatsApp Web no está inicializado (esperado en estado inicial)')
  }

  return status
}

/**
 * Test de inicialización
 */
async function testInitialization () {
  log.title('PROBANDO INICIALIZACIÓN')

  try {
    log.info('Inicializando WhatsApp Web...')
    const result = await whatsappWebService.initialize()

    if (result.success) {
      log.success('WhatsApp Web inicializado correctamente')

      // Esperar un poco para que se genere el QR
      log.info('Esperando generación de código QR...')
      await new Promise(resolve => setTimeout(resolve, 5000))

      return true
    } else {
      log.error(`Error en inicialización: ${result.error}`)
      return false
    }
  } catch (error) {
    log.error(`Error durante inicialización: ${error.message}`)
    return false
  }
}

/**
 * Test del código QR
 */
function testQRCode () {
  log.title('PROBANDO CÓDIGO QR')

  const qrInfo = whatsappWebService.getQrCode()

  if (qrInfo.qrCode) {
    log.success('Código QR generado')
    console.log('  - Longitud del QR:', qrInfo.qrCode.length)

    if (qrInfo.qrCodeImage) {
      log.success('Imagen QR generada')
      console.log('  - Tamaño de imagen:', qrInfo.qrCodeImage.length, 'caracteres')
      console.log('  - Formato:', qrInfo.qrCodeImage.startsWith('data:image') ? 'Base64 válido' : 'Formato desconocido')
    } else {
      log.warning('Imagen QR no disponible')
    }

    // Mostrar instrucciones
    log.info('Para continuar con el test completo:')
    console.log('  1. Abre WhatsApp en tu teléfono')
    console.log('  2. Ve a Configuración > Dispositivos vinculados')
    console.log('  3. Toca "Vincular un dispositivo"')
    console.log('  4. Escanea el código QR mostrado en la consola')
    console.log('  5. Espera a que se establezca la conexión')

    return true
  } else {
    log.warning('No hay código QR disponible')
    log.info('Esto puede significar que:')
    console.log('  - WhatsApp Web ya está autenticado')
    console.log('  - El servicio no se ha inicializado correctamente')
    console.log('  - Hay un problema con la generación del QR')

    return false
  }
}

/**
 * Test del estado después de inicialización
 */
function testStatusAfterInit () {
  log.title('PROBANDO ESTADO DESPUÉS DE INICIALIZACIÓN')

  const status = whatsappWebService.getStatus()

  log.info('Estado actual de WhatsApp Web:')
  console.log('  - Inicializado:', status.initialized ? '✅' : '❌')
  console.log('  - Listo:', status.ready ? '✅' : '❌')
  console.log('  - Autenticado:', status.authenticated ? '✅' : '❌')

  if (status.initialized) {
    log.success('WhatsApp Web está inicializado')
  } else {
    log.error('WhatsApp Web no está inicializado')
  }

  if (status.ready) {
    log.success('WhatsApp Web está listo para enviar mensajes')
    return true
  } else {
    log.warning('WhatsApp Web no está listo (necesita autenticación)')
    return false
  }
}

/**
 * Test de envío de mensaje (solo si está listo)
 */
async function testSendMessage (isReady) {
  log.title('PROBANDO ENVÍO DE MENSAJE')

  if (!isReady) {
    log.warning('Saltando test de envío - WhatsApp Web no está listo')
    log.info('Para probar el envío, primero autentica WhatsApp Web escaneando el QR')
    return
  }

  try {
    log.info(`Enviando mensaje de prueba a ${TEST_CONFIG.testPhone}...`)

    const result = await whatsappWebService.sendMessage(
      TEST_CONFIG.testPhone,
      TEST_CONFIG.testMessage
    )

    if (result.success) {
      log.success('Mensaje enviado correctamente')
      console.log('  - ID del mensaje:', result.messageId)
      console.log('  - Estado:', result.status)
    } else {
      log.error(`Error al enviar mensaje: ${result.error}`)
      console.log('  - Mensaje de error:', result.message)
    }
  } catch (error) {
    log.error(`Error durante envío: ${error.message}`)
  }
}

/**
 * Test de integración con messaging service
 */
async function testMessagingServiceIntegration () {
  log.title('PROBANDO INTEGRACIÓN CON MESSAGING SERVICE')

  try {
    // Test de estado
    const status = messagingService.getWhatsAppWebStatus()
    log.info('Estado desde messaging service:')
    console.log('  - Inicializado:', status.initialized ? '✅' : '❌')
    console.log('  - Listo:', status.ready ? '✅' : '❌')

    // Test de QR
    const qrInfo = messagingService.getWhatsAppWebQR()
    if (qrInfo.qrCode) {
      log.success('QR obtenido desde messaging service')
    } else {
      log.info('No hay QR disponible desde messaging service')
    }

    // Test de envío usando messaging service
    log.info('Probando envío usando messaging service...')
    const result = await messagingService.sendWhatsAppWeb(
      TEST_CONFIG.testPhone,
      'Test desde messaging service'
    )

    if (result.success) {
      log.success('Envío exitoso desde messaging service')
    } else {
      log.warning(`Envío desde messaging service: ${result.message}`)
      if (result.needsAuth) {
        log.info('Se requiere autenticación (esperado si no se ha escaneado el QR)')
      }
    }
  } catch (error) {
    log.error(`Error en integración: ${error.message}`)
  }
}

/**
 * Test de formateo de números
 */
function testPhoneNumberFormatting () {
  log.title('PROBANDO FORMATEO DE NÚMEROS')

  const testNumbers = [
    '+56912345678',
    '56912345678',
    '912345678',
    '+1234567890',
    '1234567890'
  ]

  testNumbers.forEach(number => {
    try {
      const formatted = whatsappWebService.formatPhoneNumber(number)
      console.log(`  ${number} -> ${formatted}`)
    } catch (error) {
      console.log(`  ${number} -> Error: ${error.message}`)
    }
  })
}

/**
 * Test de limpieza
 */
async function testCleanup () {
  log.title('PROBANDO LIMPIEZA')

  try {
    const result = await whatsappWebService.destroy()
    if (result && result.success) {
      log.success('Limpieza exitosa')
    } else {
      log.info('Limpieza completada (sin confirmación explícita)')
    }
  } catch (error) {
    log.warning(`Error durante limpieza: ${error.message}`)
  }
}

/**
 * Función principal
 */
async function runWhatsAppWebTest () {
  log.title('INICIANDO TEST DE WHATSAPP WEB')

  console.log('Este test verificará:')
  console.log('  1. Estado inicial del servicio')
  console.log('  2. Inicialización del cliente')
  console.log('  3. Generación de código QR')
  console.log('  4. Estado después de inicialización')
  console.log('  5. Envío de mensajes (si está autenticado)')
  console.log('  6. Integración con messaging service')
  console.log('  7. Formateo de números de teléfono')
  console.log('  8. Limpieza del servicio')

  try {
    // 1. Estado inicial
    testInitialState()

    // 2. Inicialización
    const initSuccess = await testInitialization()

    if (!initSuccess) {
      log.error('No se pudo inicializar WhatsApp Web. Terminando test.')
      return
    }

    // 3. Código QR
    const hasQR = testQRCode()

    // 4. Estado después de inicialización
    const isReady = testStatusAfterInit()

    // 5. Envío de mensaje
    await testSendMessage(isReady)

    // 6. Integración
    await testMessagingServiceIntegration()

    // 7. Formateo de números
    testPhoneNumberFormatting()

    // Esperar un poco antes de limpiar
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 8. Limpieza
    await testCleanup()

    log.title('TEST COMPLETADO')

    if (isReady) {
      log.success('WhatsApp Web está funcionando correctamente')
    } else {
      log.warning('WhatsApp Web está funcionando pero necesita autenticación')
      log.info('Para completar la configuración, escanea el código QR mostrado')
    }
  } catch (error) {
    log.error(`Error durante el test: ${error.message}`)
    console.error(error.stack)
  }
}

// Ejecutar directamente
runWhatsAppWebTest()

export default runWhatsAppWebTest
