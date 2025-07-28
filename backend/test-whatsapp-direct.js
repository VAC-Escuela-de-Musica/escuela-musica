import dotenv from 'dotenv';
import whatsappWebService from './src/features/communication/services/whatsappWeb.service.js';
import messagingService from './src/features/communication/services/messaging.service.js';

dotenv.config();

async function testWhatsAppDirect() {
  try {
    console.log('📱 PRUEBA DIRECTA DE WHATSAPP WEB');
    console.log('==================================');

    // 1. Verificar estado inicial
    console.log('\n1️⃣ Estado inicial:');
    const initialStatus = whatsappWebService.getStatus();
    console.log(initialStatus);

    // 2. Inicializar WhatsApp
    console.log('\n2️⃣ Inicializando WhatsApp...');
    await whatsappWebService.initialize();
    
    // Esperar un momento para que se genere el QR
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const statusAfterInit = whatsappWebService.getStatus();
    console.log('Estado después de inicialización:', statusAfterInit);

    // 3. Mostrar código QR si está disponible
    if (statusAfterInit.hasQrCode) {
      console.log('\n3️⃣ Código QR disponible:');
      console.log('📱 Escanea este código QR con WhatsApp:');
      console.log(statusAfterInit.qrCode);
      
      console.log('\n💡 Instrucciones:');
      console.log('1. Abre WhatsApp en tu teléfono');
      console.log('2. Ve a Configuración > Dispositivos vinculados');
      console.log('3. Escanea el código QR mostrado arriba');
      console.log('4. Espera a que se conecte');
      
      // Esperar a que se conecte
      console.log('\n⏳ Esperando conexión...');
      let attempts = 0;
      const maxAttempts = 30; // 30 segundos
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const currentStatus = whatsappWebService.getStatus();
        
        if (currentStatus.ready) {
          console.log('✅ WhatsApp conectado exitosamente!');
          break;
        }
        
        attempts++;
        console.log(`⏳ Intento ${attempts}/${maxAttempts} - Estado: ${currentStatus.ready ? 'Conectado' : 'Esperando'}`);
      }
      
      if (attempts >= maxAttempts) {
        console.log('❌ Tiempo de espera agotado. WhatsApp no se conectó.');
        return;
      }
    }

    // 4. Probar envío de mensaje
    console.log('\n4️⃣ Probando envío de mensaje...');
    const testNumber = '+56912345678'; // Número de prueba
    const testMessage = '🔔 Prueba de notificación de cambio de horario desde el sistema';
    
    try {
      const result = await messagingService.sendWhatsAppMessage(testNumber, testMessage);
      console.log('📤 Resultado del envío:', result);
      
      if (result.success) {
        console.log('✅ Mensaje enviado correctamente');
      } else {
        console.log('❌ Error enviando mensaje:', result.error);
      }
    } catch (error) {
      console.error('❌ Error en envío:', error.message);
    }

    // 5. Verificar estado final
    console.log('\n5️⃣ Estado final:');
    const finalStatus = whatsappWebService.getStatus();
    console.log(finalStatus);

    // 6. Recomendaciones
    console.log('\n6️⃣ RECOMENDACIONES:');
    if (finalStatus.ready) {
      console.log('✅ WhatsApp está funcionando correctamente');
      console.log('💡 El sistema de notificaciones de cambio de horario funcionará con WhatsApp');
    } else {
      console.log('⚠️ WhatsApp no está listo');
      console.log('💡 Las notificaciones de cambio de horario funcionarán sin WhatsApp');
      console.log('📧 Los mensajes internos y email seguirán funcionando');
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
}

// Ejecutar prueba
testWhatsAppDirect(); 