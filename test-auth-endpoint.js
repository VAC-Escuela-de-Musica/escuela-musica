import fetch from 'node-fetch';

async function testAuthEndpoint() {
  console.log('🔍 Probando endpoint de autenticación...');
  
  try {
    // Obtener token del localStorage (simulado)
    const token = process.argv[2];
    
    if (!token) {
      console.log('❌ No se proporcionó token');
      console.log('Uso: node test-auth-endpoint.js <token>');
      return;
    }
    
    console.log('🔑 Token proporcionado:', token.substring(0, 20) + '...');
    
    // Probar endpoint de autenticación
    const response = await fetch('http://localhost:1230/api/messaging/auth-test', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Respuesta exitosa:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Error en la petición:', error.message);
  }
}

testAuthEndpoint(); 