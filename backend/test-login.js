const API_BASE_URL = 'http://localhost:1230/api';

async function testLogin() {
  try {
    console.log('🔍 Probando login con bairon.s@email.com...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bairon.s@email.com',
        password: 'user123'
      }),
      credentials: 'include'
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📄 Respuesta completa:', responseText);
    
    if (!response.ok) {
      console.error(`❌ Error: ${responseText}`);
      return;
    }

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Login exitoso:', {
        token: data.token ? 'SÍ' : 'NO',
        user: data.user ? data.user.email : 'NO',
        roles: data.user ? data.user.roles : 'NO',
        data: data
      });
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testLogin(); 