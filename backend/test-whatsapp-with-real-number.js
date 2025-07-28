import dotenv from 'dotenv';
import whatsappWebService from './src/features/communication/services/whatsappWeb.service.js';
import messagingService from './src/features/communication/services/messaging.service.js';

dotenv.config();

async function testWhatsAppWithRealNumber() {
  try {
    console.log('🔧 PRUEBA DE WHATSAPP CON NÚMERO REAL');
    console.log('=====================================\n');

    // 1. Verificar estado de WhatsApp Web
    console.log('1️⃣ Estado de WhatsApp Web:');
    const status = whatsappWebService.getStatus();
    console.log(status);

    // 2. Si no está listo, inicializar
    if (!status.ready) {
      console.log('\n⚠️ WhatsApp no está listo. Inicializando...');
      await whatsappWebService.initialize();
      
      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusAfter = whatsappWebService.getStatus();
      console.log('Estado después de inicialización:', statusAfter);
      
      if (!statusAfter.ready) {
        console.log('❌ WhatsApp aún no está listo. Necesita autenticación.');
        return;
      }
    }

    // 3. Número de prueba (el que sabemos que existe)
    const testNumber = '+56962774850';
    const testMessage = '🧪 PRUEBA REAL: Este es un mensaje de prueba desde el servicio de notificaciones.';

    console.log('\n2️⃣ Probando envío directo con WhatsApp Web:');
    console.log(`📱 Número: ${testNumber}`);
    console.log(`💬 Mensaje: ${testMessage}`);

    // 4. Probar envío directo con WhatsApp Web
    const result = await whatsappWebService.sendMessage(testNumber, testMessage);
    console.log('\n3️⃣ Resultado del envío directo:');
    console.log(result);

    // 5. Probar a través del servicio de mensajería
    console.log('\n4️⃣ Probando a través del servicio de mensajería:');
    const messagingResult = await messagingService.sendWhatsAppWeb(testNumber, testMessage);
    console.log('Resultado del servicio de mensajería:');
    console.log(messagingResult);

    // 6. Probar el método simulado como fallback
    console.log('\n5️⃣ Probando método simulado como fallback:');
    const simulatedResult = await messagingService.sendWhatsAppMessage(testNumber, testMessage);
    console.log('Resultado del método simulado:');
    console.log(simulatedResult);

    // 7. Análisis de resultados
    console.log('\n📊 ANÁLISIS DE RESULTADOS:');
    console.log('==========================');
    console.log(`• WhatsApp Web directo: ${result.success ? '✅ ÉXITO' : '❌ FALLO'}`);
    console.log(`• Servicio de mensajería: ${messagingResult.success ? '✅ ÉXITO' : '❌ FALLO'}`);
    console.log(`• Método simulado: ${simulatedResult.success ? '✅ ÉXITO' : '❌ FALLO'}`);

    if (result.success) {
      console.log('\n✅ WhatsApp Web funciona correctamente');
      console.log('💡 El problema debe estar en el servicio de notificaciones');
    } else {
      console.log('\n❌ WhatsApp Web no funciona');
      console.log('💡 Necesita autenticación o hay un problema de configuración');
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    console.log('\n🔌 Prueba completada');
  }
}

// Ejecutar la prueba
testWhatsAppWithRealNumber(); 