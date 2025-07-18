// Test completo del flujo de autenticación
console.log('🧪 TESTING FLUJO COMPLETO DE AUTENTICACIÓN');
console.log('===========================================');

// Simular el flujo completo como lo haría el frontend
async function testCompleteFlow() {
  try {
    // 1. Limpiar localStorage
    console.log('\n1. 🧹 Limpiando localStorage...');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // 2. Intentar login
    console.log('\n2. 🔐 Intentando login...');
    const loginResponse = await fetch('http://localhost:1230/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@email.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login Response:', {
      status: loginResponse.status,
      success: loginData.success,
      hasToken: !!loginData.data?.accessToken,
      hasUser: !!loginData.data?.user
    });
    
    if (!loginResponse.ok || !loginData.success) {
      console.log('❌ Login falló:', loginData);
      return;
    }
    
    const { accessToken, user } = loginData.data;
    console.log('✅ Login exitoso!');
    console.log('👤 Usuario:', user);
    
    // 3. Simular almacenamiento en localStorage
    console.log('\n3. 💾 Simulando almacenamiento en localStorage...');
    const token = accessToken;
    const userData = JSON.stringify(user);
    
    // 4. Verificar token
    console.log('\n4. 🔍 Verificando token...');
    const verifyResponse = await fetch('http://localhost:1230/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('📊 Verify Response:', {
      status: verifyResponse.status,
      success: verifyData.success,
      hasUser: !!verifyData.data?.user
    });
    
    if (!verifyResponse.ok || !verifyData.success) {
      console.log('❌ Verify falló:', verifyData);
      return;
    }
    
    console.log('✅ Token verificado exitosamente!');
    
    // 5. Probar endpoint de materials
    console.log('\n5. 📚 Probando endpoint de materials...');
    const materialsResponse = await fetch('http://localhost:1230/api/materials', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const materialsData = await materialsResponse.json();
    console.log('📊 Materials Response:', {
      status: materialsResponse.status,
      success: materialsData.success,
      hasData: !!materialsData.data
    });
    
    if (materialsResponse.ok && materialsData.success) {
      console.log('✅ Materials endpoint exitoso!');
      console.log('📚 Materiales encontrados:', materialsData.data?.materials?.length || 0);
    } else {
      console.log('❌ Materials endpoint falló:', materialsData);
    }
    
    // 6. Probar endpoint de users
    console.log('\n6. 👥 Probando endpoint de users...');
    const usersResponse = await fetch('http://localhost:1230/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const usersData = await usersResponse.json();
    console.log('📊 Users Response:', {
      status: usersResponse.status,
      success: usersData.success,
      hasData: !!usersData.data
    });
    
    if (usersResponse.ok && usersData.success) {
      console.log('✅ Users endpoint exitoso!');
    } else {
      console.log('❌ Users endpoint falló:', usersData);
    }
    
    console.log('\n🎯 RESUMEN DEL FLUJO:');
    console.log('====================');
    console.log(`✅ Login: ${loginResponse.ok ? 'OK' : 'FALLÓ'}`);
    console.log(`✅ Verify: ${verifyResponse.ok ? 'OK' : 'FALLÓ'}`);
    console.log(`✅ Materials: ${materialsResponse.ok ? 'OK' : 'FALLÓ'}`);
    console.log(`✅ Users: ${usersResponse.ok ? 'OK' : 'FALLÓ'}`);
    
  } catch (error) {
    console.log('❌ Error en el flujo:', error.message);
  }
}

testCompleteFlow();
