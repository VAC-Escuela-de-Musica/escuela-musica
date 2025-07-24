import http from 'http';

// Configuración
const BASE_URL = 'http://localhost:1230';
const ADMIN_EMAIL = 'admin@email.com';
const ADMIN_PASSWORD = 'admin123';

// Función para hacer peticiones HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          console.log('JSON Parse Error:', e.message);
          console.log('Raw body:', body);
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testMaterialDeletion() {
  try {
    console.log('🔍 Iniciando prueba de eliminación de material...');
    
    // 1. Login como admin
    console.log('\n1. 🔐 Iniciando sesión como admin...');
    const loginOptions = {
      hostname: 'localhost',
      port: 1230,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.error('❌ Error en login:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data?.accessToken;
    if (!token) {
      console.error('❌ No se obtuvo token de acceso');
      return;
    }
    
    console.log('✅ Login exitoso, token obtenido');
    
    // 2. Verificar token
    console.log('\n2. 🔍 Verificando token...');
    const verifyOptions = {
      hostname: 'localhost',
      port: 1230,
      path: '/api/auth/verify',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const verifyResponse = await makeRequest(verifyOptions);
    console.log('Verify response status:', verifyResponse.status);
    console.log('User data:', JSON.stringify(verifyResponse.data, null, 2));
    
    // 3. Listar materiales
    console.log('\n3. 📚 Obteniendo lista de materiales...');
    const materialsOptions = {
      hostname: 'localhost',
      port: 1230,
      path: '/api/materials',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const materialsResponse = await makeRequest(materialsOptions);
    console.log('Materials response status:', materialsResponse.status);
    console.log('Materials response type:', typeof materialsResponse.data);
    console.log('Materials response raw:', materialsResponse.data);
    
    if (materialsResponse.status !== 200) {
      console.error('❌ Error obteniendo materiales:', materialsResponse.data);
      return;
    }
    
    const responseData = materialsResponse.data;
    const materials = responseData.data?.documents;
    console.log('Response data structure:', Object.keys(responseData));
    console.log('Materials array length:', materials ? materials.length : 'undefined');
    console.log('Materials type:', typeof materials);
    
    if (materials && materials.length > 0) {
      console.log('First material ID:', materials[0]._id);
    }
    
    if (!materials || materials.length === 0) {
      console.log('⚠️ No hay materiales para eliminar');
      return;
    }
    
    const materialToDelete = materials[0];
    console.log(`📄 Material a eliminar: ${materialToDelete._id} - ${materialToDelete.nombre || materialToDelete.title || 'Sin título'}`);
    console.log('Material ID:', materialToDelete._id);
    
    // 4. Intentar eliminar material
    console.log('\n4. 🗑️ Intentando eliminar material...');
    const deleteOptions = {
      hostname: 'localhost',
      port: 1230,
      path: `/api/materials/${materialToDelete._id}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const deleteResponse = await makeRequest(deleteOptions);
    console.log('Delete response status:', deleteResponse.status);
    console.log('Delete response:', JSON.stringify(deleteResponse.data, null, 2));
    
    if (deleteResponse.status === 200) {
      console.log('✅ Material eliminado exitosamente');
    } else if (deleteResponse.status === 403) {
      console.log('❌ Error 403 Forbidden - Permisos insuficientes');
      console.log('🔍 Revisar logs del servidor para más detalles');
    } else {
      console.log(`❌ Error ${deleteResponse.status}:`, deleteResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar la prueba
testMaterialDeletion();