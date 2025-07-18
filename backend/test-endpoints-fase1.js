import fetch from 'node-fetch';

console.log('🧪 TESTING LOGIN ENDPOINT - FASE 1');
console.log('=====================================');

async function testLoginEndpoint() {
  try {
    console.log('\n1. 🔍 Intentando login con credenciales de prueba...');
    
    const response = await fetch('http://localhost:1230/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'admin123'
      })
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers));

    const data = await response.json();
    console.log('📊 Response Data:', data);

    if (response.ok && data.success) {
      console.log('\n✅ LOGIN EXITOSO!');
      console.log('✅ Token recibido:', data.data.accessToken?.substring(0, 50) + '...');
      
      // Probar endpoint de verify
      console.log('\n2. 🔍 Probando endpoint /api/auth/verify...');
      
      const verifyResponse = await fetch('http://localhost:1230/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.data.accessToken}`
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log('📊 Verify Response:', verifyData);
      
      if (verifyResponse.ok && verifyData.success) {
        console.log('✅ VERIFY EXITOSO!');
        console.log('✅ Usuario verificado:', verifyData.data.user);
        
        // Probar endpoint de materials
        console.log('\n3. 🔍 Probando endpoint /api/materials...');
        
        const materialsResponse = await fetch('http://localhost:1230/api/materials', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.data.accessToken}`
          }
        });
        
        const materialsData = await materialsResponse.json();
        console.log('📊 Materials Response Status:', materialsResponse.status);
        console.log('📊 Materials Response:', materialsData);
        
        if (materialsResponse.ok) {
          console.log('✅ MATERIALS ENDPOINT EXITOSO!');
        } else {
          console.log('❌ MATERIALS ENDPOINT FALLÓ:', materialsData);
        }
      } else {
        console.log('❌ VERIFY FALLÓ:', verifyData);
      }
    } else {
      console.log('❌ LOGIN FALLÓ:', data);
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

testLoginEndpoint();
