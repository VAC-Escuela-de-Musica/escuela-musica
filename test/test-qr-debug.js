import axios from 'axios';

// Configuración
const BASE_URL = 'http://localhost:1230';
const TEST_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'admin123'
};

// Función para hacer login y obtener token
async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CREDENTIALS);
    console.log('✅ Login exitoso:', response.data.success);
    console.log('📋 Respuesta completa del login:', JSON.stringify(response.data, null, 2));
    return response.data.data.accessToken;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar endpoint específico
async function testEndpoint(token, endpoint, method = 'GET') {
  try {
    console.log(`\n📡 Probando ${method} ${endpoint}...`);
    console.log(`🔑 Token: ${token ? token.substring(0, 20) + '...' : 'No token'}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${BASE_URL}/api/messaging${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('📤 Config de request:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers.Authorization
    });
    
    const response = await axios(config);
    
    console.log('✅ Respuesta exitosa:');
    console.log('  Status:', response.status);
    console.log('  Success:', response.data.success);
    console.log('  Data keys:', Object.keys(response.data.data || {}));
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`);
    console.error('  Status:', error.response?.status);
    console.error('  Message:', error.response?.data?.message || error.message);
    console.error('  Full response:', error.response?.data);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando pruebas de debug para /qr vs /status\n');
    
    // 1. Login
    const token = await login();
    
    // 2. Probar /status (que funciona)
    console.log('\n=== PROBANDO /whatsapp-web/status ===');
    const statusResult = await testEndpoint(token, '/whatsapp-web/status');
    
    // 3. Probar /qr (que falla)
    console.log('\n=== PROBANDO /whatsapp-web/qr ===');
    const qrResult = await testEndpoint(token, '/whatsapp-web/qr');
    
    console.log('\n✅ Ambas pruebas completadas exitosamente');
    
  } catch (error) {
    console.error('\n💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main();