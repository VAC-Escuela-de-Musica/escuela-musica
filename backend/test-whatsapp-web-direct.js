import dotenv from 'dotenv';
import whatsappWebService from './src/features/communication/services/whatsappWeb.service.js';

dotenv.config();

async function testWhatsAppWebDirect() {
  try {
    console.log('🔧 PRUEBA DIRECTA DE WHATSAPP WEB');
    console.log('==================================\n');

    // 1. Verificar estado inicial
    console.log('1️⃣ Estado inicial:');
    const status = whatsappWebService.getStatus();
    console.log(status);

    // 2. Inicializar si no está inicializado
    if (!status.initialized) {
      console.log('\n🚀 Inicializando WhatsApp Web...');
      await whatsappWebService.initialize();
      
      // Esperar un poco para que se inicialice
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 3. Verificar estado después de inicialización
    console.log('\n2️⃣ Estado después de inicialización:');
    const statusAfter = whatsappWebService.getStatus();
    console.log(statusAfter);

    // 4. Si está listo, probar envío de mensaje
    if (statusAfter.ready) {
      console.log('\n3️⃣ WhatsApp está listo, probando envío...');
      
      const testNumber = '+56964257112'; // Número de prueba
      const testMessage = '🧪 PRUEBA DIRECTA: Este es un mensaje de prueba desde el servicio de WhatsApp Web.';
      
      console.log(`📱 Enviando mensaje de prueba a: ${testNumber}`);
      console.log(`💬 Mensaje: ${testMessage}`);
      
      const result = await whatsappWebService.sendMessage(testNumber, testMessage);
      
      console.log('\n4️⃣ Resultado del envío:');
      console.log(result);
      
      if (result.success) {
        console.log('✅ ¡Mensaje enviado exitosamente!');
      } else {
        console.log('❌ Error enviando mensaje:', result.error);
      }
    } else {
      console.log('\n⚠️ WhatsApp no está listo');
      
      if (statusAfter.hasQrCode) {
        console.log('📱 Código QR disponible. Escanea con WhatsApp:');
        console.log(statusAfter.qrCode);
      } else {
        console.log('❌ No hay código QR disponible');
      }
    }

    // 5. Mostrar información de debug
    console.log('\n5️⃣ Información de debug:');
    console.log('- Cliente inicializado:', !!whatsappWebService.client);
    console.log('- Estado ready:', whatsappWebService.isReady);
    console.log('- Código QR disponible:', !!whatsappWebService.qrCode);
    console.log('- Imagen QR disponible:', !!whatsappWebService.qrCodeImage);

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  } finally {
    // No destruir el cliente para mantener la sesión
    console.log('\n🔌 Prueba completada (cliente mantenido para sesión)');
  }
}

// Ejecutar la prueba
testWhatsAppWebDirect(); 