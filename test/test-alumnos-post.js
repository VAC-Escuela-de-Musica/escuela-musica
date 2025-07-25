const axios = require('axios');

const BACKEND_URL = 'http://localhost:1230';

async function testAlumnosPost() {
  console.log('🔍 PROBANDO ENDPOINT POST /api/alumnos');
  console.log('='.repeat(50));
  
  try {
    // Paso 1: Login
    console.log('\n1. 🔐 Realizando login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login exitoso');
    console.log('📧 Usuario:', loginResponse.data.data.user.email);
    console.log('👥 Roles:', loginResponse.data.data.user.roles.map(r => r.name).join(', '));
    console.log('🎫 Token (primeros 50 chars):', token.substring(0, 50) + '...');
    
    // Paso 2: Probar POST
    console.log('\n2. 📚 Probando POST /api/alumnos...');
    const testStudent = {
      nombre: 'Test Student Debug',
      email: 'test.debug@student.com',
      rut: '12345678-9',
      telefono: '123456789'
    };
    
    console.log('📝 Datos a enviar:', JSON.stringify(testStudent, null, 2));
    
    const postResponse = await axios.post(`${BACKEND_URL}/api/alumnos`, testStudent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ POST exitoso!');
    console.log('📄 Respuesta:', JSON.stringify(postResponse.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ ERROR DETECTADO:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Message:', error.response?.data?.error || error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('\n📄 Respuesta completa del servidor:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.response?.headers) {
      console.log('\n📋 Headers de respuesta:');
      console.log(JSON.stringify(error.response.headers, null, 2));
    }
  }
  
  console.log('\n🏁 Prueba completada');
}

// Ejecutar la prueba
testAlumnosPost().catch(console.error);