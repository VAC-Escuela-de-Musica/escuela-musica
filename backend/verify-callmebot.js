import dotenv from 'dotenv';
import axios from 'axios';

// Cargar variables de entorno
dotenv.config();

const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;

if (!CALLMEBOT_API_KEY) {
  console.log('❌ CALLMEBOT_API_KEY no está configurada');
  process.exit(1);
}

console.log('🔍 Verificando Callmebot...');
console.log('🔑 API Key:', CALLMEBOT_API_KEY.substring(0, 10) + '...');

async function verifyCallmebot() {
  try {
    // Primero, verificar que la API key sea válida
    console.log('\n📡 Verificando API key...');
    
    const testResponse = await axios.get('https://api.callmebot.com/whatsapp.php', {
      params: {
        phone: '+34612345678', // Número de prueba
        text: 'Test',
        apikey: CALLMEBOT_API_KEY
      }
    });
    
    console.log('📊 Respuesta de Callmebot:', testResponse.data);
    
    if (testResponse.data.includes('Message sent')) {
      console.log('✅ Callmebot está funcionando correctamente');
      console.log('📝 Nota: Los mensajes aparecerán como enviados por el bot de Callmebot, no desde tu número');
    } else if (testResponse.data.includes('Invalid API key')) {
      console.log('❌ API key inválida');
      console.log('💡 Verifica que hayas obtenido la API key correctamente de callmebot.com');
    } else if (testResponse.data.includes('Phone number not found')) {
      console.log('❌ Número de teléfono no encontrado');
      console.log('💡 Asegúrate de que el número esté registrado en Callmebot');
    } else {
      console.log('⚠️ Respuesta inesperada:', testResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error verificando Callmebot:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Respuesta:', error.response.data);
    }
  }
}

// Ejecutar verificación
verifyCallmebot(); 