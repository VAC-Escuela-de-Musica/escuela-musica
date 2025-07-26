const axios = require('axios');

const API_BASE_URL = 'http://146.83.198.35:1230';

async function testProfesoresAuth() {
  console.log('🔍 [TEST] Iniciando prueba de autenticación para profesores');
  
  try {
    // 1. Login como administrador
    console.log('\n1️⃣ Intentando login como administrador...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    });
    
    console.log('✅ Login exitoso');
    console.log('Token:', loginResponse.data.data.accessToken ? 'Presente' : 'Ausente');
    console.log('User:', loginResponse.data.data.user?.email);
    console.log('Roles:', loginResponse.data.data.user?.roles);
    
    const token = loginResponse.data.data.accessToken;
    
    if (!token) {
      console.log('❌ No se obtuvo token de acceso');
      return;
    }
    
    // 2. Verificar token
    console.log('\n2️⃣ Verificando token...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token verificado');
    console.log('User data:', verifyResponse.data);
    
    // 3. Probar endpoint de profesores
    console.log('\n3️⃣ Probando endpoint de profesores...');
    const profesoresResponse = await axios.get(`${API_BASE_URL}/api/profesores`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Endpoint de profesores funciona');
    console.log('Response:', profesoresResponse.data);
    
    // 4. Probar creación de profesor
    console.log('\n4️⃣ Probando creación de profesor...');
    const profesorData = {
      nombre: 'Profesor',
      apellidos: 'Prueba',
      rut: '12.345.678-9',
      email: 'profesor@email.com',
      numero: '+56962774850',
      password: '123456',
      sueldo: 500000,
      fechaContrato: new Date().toISOString()
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/profesores`, profesorData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profesor creado exitosamente');
    console.log('Profesor creado:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Ejecutar la prueba
testProfesoresAuth(); 