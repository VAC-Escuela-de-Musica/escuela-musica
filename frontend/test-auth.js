// Script para probar la autenticación desde el frontend
console.log('🔍 Verificando estado de autenticación...');

// Verificar token en localStorage
const token = localStorage.getItem('token');
console.log('🔑 Token en localStorage:', token ? 'Presente' : 'No encontrado');

if (token) {
  console.log('🔑 Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
}

// Verificar usuario en localStorage
const user = localStorage.getItem('user');
console.log('👤 Usuario en localStorage:', user ? 'Presente' : 'No encontrado');

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('👤 Datos del usuario:', {
      email: userData.email,
      roles: userData.roles,
      id: userData.id
    });
  } catch (error) {
    console.log('❌ Error parseando datos del usuario:', error.message);
  }
}

// Probar petición a la API
async function testAPI() {
  try {
    console.log('🌐 Probando petición a la API...');
    
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

// Ejecutar prueba si hay token
if (token) {
  testAPI();
} else {
  console.log('⚠️ No hay token, no se puede probar la API');
} 