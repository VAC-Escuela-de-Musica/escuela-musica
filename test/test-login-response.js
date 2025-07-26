const axios = require('axios');

const API_BASE_URL = 'http://146.83.198.35:1230';

async function testLoginResponse() {
  console.log('🔍 [TEST] Verificando respuesta del login');
  
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Status:', loginResponse.status);
    console.log('Headers:', loginResponse.headers);
    console.log('Data completa:', JSON.stringify(loginResponse.data, null, 2));
    
    // Verificar diferentes posibles nombres del token
    console.log('\n🔍 Verificando posibles nombres del token:');
    console.log('accessToken:', loginResponse.data.accessToken ? 'Presente' : 'Ausente');
    console.log('token:', loginResponse.data.token ? 'Presente' : 'Ausente');
    console.log('access_token:', loginResponse.data.access_token ? 'Presente' : 'Ausente');
    console.log('jwt:', loginResponse.data.jwt ? 'Presente' : 'Ausente');
    
    // Verificar estructura del usuario
    console.log('\n🔍 Verificando estructura del usuario:');
    console.log('user:', loginResponse.data.user ? 'Presente' : 'Ausente');
    console.log('user.email:', loginResponse.data.user?.email);
    console.log('user.roles:', loginResponse.data.user?.roles);
    console.log('roles:', loginResponse.data.roles);
    
  } catch (error) {
    console.error('❌ Error en el login:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testLoginResponse(); 