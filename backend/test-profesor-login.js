const API_BASE_URL = 'http://localhost:1230/api';

async function testProfesorLogin() {
  try {
    console.log('🔍 Probando login con profesor@email.com...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'profesor@email.com',
        password: 'profesor123'
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
        token: data.data?.accessToken ? 'SÍ' : 'NO',
        user: data.data?.user ? data.data.user.email : 'NO',
        roles: data.data?.user ? data.data.user.roles : 'NO',
        data: data
      });
      
      // Decodificar el token para ver su contenido
      if (data.data?.accessToken) {
        const tokenParts = data.data.accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 Contenido del token JWT:', {
            id: payload.id,
            email: payload.email,
            roles: payload.roles
          });
        }
      }
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testProfesorLogin(); 