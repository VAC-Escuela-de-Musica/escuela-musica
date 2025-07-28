import dotenv from 'dotenv';
import mongoose from 'mongoose';
import whatsappWebService from './src/features/communication/services/whatsappWeb.service.js';
import messagingService from './src/features/communication/services/messaging.service.js';

dotenv.config();

async function diagnoseWhatsApp() {
  try {
    console.log('🔧 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión exitosa a MongoDB');

    console.log('\n📱 DIAGNÓSTICO DE WHATSAPP WEB');
    console.log('================================');

    // 1. Verificar configuración
    console.log('\n1️⃣ Verificando configuración...');
    console.log('📁 Session Path:', process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth');
    console.log('🔧 Puppeteer Args:', process.env.WHATSAPP_PUPPETEER_ARGS || 'default');
    console.log('⏱️ Timeout:', process.env.WHATSAPP_TIMEOUT || '60000');

    // 2. Verificar estado del servicio
    console.log('\n2️⃣ Verificando estado del servicio...');
    const status = whatsappWebService.getStatus();
    console.log('📊 Estado:', status);

    // 3. Verificar si hay sesión guardada
    console.log('\n3️⃣ Verificando sesión guardada...');
    const fs = await import('fs');
    const path = await import('path');
    
    const sessionPath = path.default.resolve(process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth');
    const sessionExists = fs.default.existsSync(sessionPath);
    console.log('📁 Directorio de sesión existe:', sessionExists);
    
    if (sessionExists) {
      const files = fs.default.readdirSync(sessionPath);
      console.log('📄 Archivos en sesión:', files);
    }

    // 4. Probar inicialización
    console.log('\n4️⃣ Probando inicialización...');
    try {
      await whatsappWebService.initialize();
      console.log('✅ Inicialización exitosa');
      
      // Esperar un momento para ver si se conecta
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newStatus = whatsappWebService.getStatus();
      console.log('📊 Estado después de inicialización:', newStatus);
      
    } catch (error) {
      console.error('❌ Error en inicialización:', error.message);
    }

    // 5. Probar envío de mensaje
    console.log('\n5️⃣ Probando envío de mensaje...');
    try {
      const testResult = await messagingService.sendWhatsAppMessage(
        '+56912345678', // Número de prueba
        '🔔 Prueba de notificación de cambio de horario'
      );
      console.log('📤 Resultado del envío:', testResult);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.message);
    }

    // 6. Verificar QR si es necesario
    console.log('\n6️⃣ Verificando código QR...');
    const qrCode = whatsappWebService.getQrCode();
    if (qrCode) {
      console.log('📱 Código QR disponible:', qrCode ? 'Sí' : 'No');
      console.log('💡 Necesitas escanear el código QR con WhatsApp');
    } else {
      console.log('✅ No se necesita código QR (ya autenticado)');
    }

    // 7. Recomendaciones
    console.log('\n7️⃣ RECOMENDACIONES');
    console.log('==================');
    
    const currentStatus = whatsappWebService.getStatus();
    if (!currentStatus.isReady) {
      console.log('⚠️ WhatsApp no está listo. Posibles soluciones:');
      console.log('   • Escanea el código QR con WhatsApp');
      console.log('   • Verifica que WhatsApp esté abierto en tu teléfono');
      console.log('   • Reinicia el servicio si es necesario');
    } else {
      console.log('✅ WhatsApp está funcionando correctamente');
    }

    console.log('\n📋 Comandos útiles:');
    console.log('   • Reiniciar WhatsApp: curl -X POST http://localhost:1230/api/messaging/whatsapp/reset');
    console.log('   • Ver estado: curl -X GET http://localhost:1230/api/messaging/whatsapp/status');
    console.log('   • Obtener QR: curl -X GET http://localhost:1230/api/messaging/whatsapp/qr');

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar diagnóstico
diagnoseWhatsApp(); 