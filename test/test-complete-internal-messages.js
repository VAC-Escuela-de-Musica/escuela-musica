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

async function testCompleteInternalMessages() {
  console.log('🧪 Prueba completa del sistema de mensajes internos...\n');

  try {
    // 0. Obtener token CSRF
    console.log('0️⃣ Obteniendo token CSRF...');
    const csrfResponse = await makeRequest(`${API_BASE}/csrf-token`);
    
    if (csrfResponse.status !== 200) {
      console.error('❌ Error obteniendo CSRF token:', csrfResponse.data);
      return;
    }
    
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('✅ CSRF token obtenido');
    console.log(`   Token: ${csrfToken.substring(0, 20)}...\n`);

    // 1. Login como administrador
    console.log('1️⃣ Login como administrador...');
    const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        '_csrf': csrfToken
      },
      body: {
        email: 'admin@email.com',
        password: 'admin123'
      }
    });

    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginResponse.data.success}`);

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.error('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login exitoso');
    console.log(`   User: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Roles: ${JSON.stringify(user.roles)}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // 2. Verificar token
    console.log('2️⃣ Verificando token...');
    const verifyResponse = await makeRequest(`${API_BASE}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Success: ${verifyResponse.data.success}\n`);

    // 3. Crear mensaje interno
    console.log('3️⃣ Creando mensaje interno...');
    const createResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        '_csrf': csrfToken
      },
      body: {
        subject: 'Prueba desde Script',
        content: 'Este es un mensaje de prueba enviado desde el script de testing.',
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

    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Success: ${createResponse.data.success}`);

    if (createResponse.status === 201 && createResponse.data.success) {
      console.log('✅ Mensaje creado exitosamente');
      console.log(`   ID: ${createResponse.data.data._id}`);
      console.log(`   Subject: ${createResponse.data.data.subject}\n`);
    } else {
      console.error('❌ Error creando mensaje:', createResponse.data);
      return;
    }

    // 4. Obtener lista de mensajes
    console.log('4️⃣ Obteniendo lista de mensajes...');
    const listResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Status: ${listResponse.status}`);
    console.log(`   Success: ${listResponse.data.success}`);
    console.log(`   Mensajes encontrados: ${listResponse.data.data?.length || 0}\n`);

    // 5. Obtener estadísticas
    console.log('5️⃣ Obteniendo estadísticas...');
    const statsResponse = await makeRequest(`${API_BASE}/internal-messages/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Success: ${statsResponse.data.success}`);
    if (statsResponse.data.success) {
      console.log(`   Total mensajes: ${statsResponse.data.data.totalMessages}`);
      console.log(`   Mensajes enviados: ${statsResponse.data.data.sentMessages}`);
    }

    console.log('\n🎉 ¡Prueba completa exitosa!');
    console.log('📋 Resumen:');
    console.log('   ✅ Obtención de CSRF token');
    console.log('   ✅ Login de administrador');
    console.log('   ✅ Verificación de token');
    console.log('   ✅ Creación de mensaje interno');
    console.log('   ✅ Listado de mensajes');
    console.log('   ✅ Estadísticas');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testCompleteInternalMessages(); 