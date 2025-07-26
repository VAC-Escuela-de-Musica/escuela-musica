const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:1230/api';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function createAdminUser() {
  console.log('🔧 Verificando y creando usuario administrador...\n');

  try {
    // 1. Intentar login con credenciales por defecto
    console.log('1️⃣ Probando login con credenciales por defecto...');
    const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'administrador@email.com',
        password: 'admin123'
      }
    });

    if (loginResponse.status === 200 && loginResponse.data.success) {
      console.log('✅ Usuario administrador ya existe y funciona correctamente');
      console.log(`   Email: administrador@email.com`);
      console.log(`   Password: admin123`);
      return;
    }

    console.log('❌ Usuario administrador no existe o credenciales incorrectas');
    console.log('   Creando nuevo usuario administrador...\n');

    // 2. Crear usuario administrador
    console.log('2️⃣ Creando usuario administrador...');
    const createUserResponse = await makeRequest(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer admin-temp-token' // Token temporal
      },
      body: {
        username: 'administrador',
        email: 'administrador@email.com',
        rut: '12345678-0',
        password: 'admin123',
        roles: ['administrador']
      }
    });

    console.log(`   Status: ${createUserResponse.status}`);
    console.log(`   Response: ${JSON.stringify(createUserResponse.data)}\n`);

    if (createUserResponse.status === 201 || createUserResponse.status === 200) {
      console.log('✅ Usuario administrador creado exitosamente');
    } else {
      console.log('❌ Error creando usuario administrador');
      console.log('   Posibles causas:');
      console.log('   - El endpoint requiere autenticación');
      console.log('   - El usuario ya existe');
      console.log('   - Error en la base de datos');
    }

    // 3. Probar login nuevamente
    console.log('3️⃣ Probando login con el nuevo usuario...');
    const newLoginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'administrador@email.com',
        password: 'admin123'
      }
    });

    if (newLoginResponse.status === 200 && newLoginResponse.data.success) {
      console.log('✅ Login exitoso con el nuevo usuario');
      console.log('   Credenciales válidas:');
      console.log('   - Email: administrador@email.com');
      console.log('   - Password: admin123');
    } else {
      console.log('❌ Login fallido con el nuevo usuario');
      console.log(`   Error: ${JSON.stringify(newLoginResponse.data)}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser(); 