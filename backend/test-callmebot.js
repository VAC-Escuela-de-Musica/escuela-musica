import dotenv from 'dotenv';
import axios from 'axios';

// Cargar variables de entorno
dotenv.config();

const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;

if (!CALLMEBOT_API_KEY) {
  console.log('❌ CALLMEBOT_API_KEY no está configurada en el archivo .env');
  process.exit(1);
}

console.log('✅ CALLMEBOT_API_KEY encontrada');
console.log('🔑 API Key:', CALLMEBOT_API_KEY.substring(0, 10) + '...');

// Función para probar Callmebot
async function testCallmebot() {
  try {
    console.log('\n📱 Probando Callmebot...');
    
    // Reemplaza con tu número de teléfono para la prueba
    const testPhone = '+34612345678'; // Cambia este número por el tuyo
    const testMessage = '🧪 Prueba del sistema GPS - Callmebot funcionando correctamente!';
    
    console.log(`📞 Enviando mensaje a: ${testPhone}`);
    console.log(`💬 Mensaje: ${testMessage}`);
    
    const response = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: testPhone,
        text: testMessage,
        apikey: CALLMEBOT_API_KEY
      }
    });
    
    console.log('✅ Respuesta de Callmebot:', response.data);
    
    if (response.data.includes('Message sent')) {
      console.log('🎉 ¡Mensaje enviado exitosamente!');
    } else {
      console.log('⚠️ Respuesta inesperada:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Respuesta:', error.response.data);
    }
  }
}

// Ejecutar prueba
testCallmebot(); 