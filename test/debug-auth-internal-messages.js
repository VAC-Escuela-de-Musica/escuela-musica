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

    console.log('🔍 Request options:', {
      method: requestOptions.method,
      path: requestOptions.path,
      headers: requestOptions.headers
    });

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`📡 Response status: ${res.statusCode}`);
        console.log(`📡 Response headers:`, res.headers);
        try {
          const jsonData = JSON.parse(data);
          console.log(`📡 Response data:`, jsonData);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          console.log(`📡 Response text:`, data);
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    if (options.body) {
      console.log('📤 Request body:', options.body);
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function debugAuthInternalMessages() {
  console.log('🔍 Debug de autenticación para mensajes internos...\n');

  try {
    // 1. Login como administrador
    console.log('1️⃣ Login como administrador...');
    const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        email: 'administrador@email.com',
        password: 'admin123'
      }
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Error en login: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login exitoso');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User: ${loginResponse.data.data.user.username}`);
    console.log(`   Email: ${loginResponse.data.data.user.email}`);
    console.log(`   Roles: ${JSON.stringify(loginResponse.data.data.user.roles)}\n`);

    // 2. Verificar token
    console.log('2️⃣ Verificando token...');
    const verifyResponse = await makeRequest(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Verificación de token:');
    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Data: ${JSON.stringify(verifyResponse.data)}\n`);

    // 3. Intentar crear mensaje interno
    console.log('3️⃣ Intentando crear mensaje interno...');
    const createResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        subject: 'Prueba de Debug',
        content: 'Este es un mensaje de prueba para debug.',
        recipientType: 'all_students',
        type: 'notification',
        priority: 'medium',
        delivery: {
          sendInternal: true,
          sendEmail: false,
          sendWhatsApp: false
        }
      }
    });

    console.log('✅ Respuesta de creación de mensaje:');
    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Data: ${JSON.stringify(createResponse.data)}\n`);

    if (createResponse.status === 403) {
      console.log('❌ Error 403 - Problema de autorización');
      console.log('   Posibles causas:');
      console.log('   - Usuario no tiene rol de administrador');
      console.log('   - Token no válido');
      console.log('   - Middleware de autorización fallando');
    } else if (createResponse.status === 201) {
      console.log('🎉 ¡Mensaje creado exitosamente!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAuthInternalMessages(); 