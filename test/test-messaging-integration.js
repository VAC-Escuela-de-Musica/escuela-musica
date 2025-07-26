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

async function testMessagingIntegration() {
  console.log('🧪 Probando integración de mensajes internos en mensajería...\n');

  try {
    // 1. Login como administrador
    console.log('1️⃣ Login como administrador...');
    const loginResponse = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'admin123'
      }
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Error en login: ${loginResponse.status}`);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Verificar que el endpoint de mensajes internos funcione
    console.log('2️⃣ Verificando endpoint de mensajes internos...');
    const messagesResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (messagesResponse.status !== 200) {
      throw new Error(`Error obteniendo mensajes: ${messagesResponse.status}`);
    }

    console.log('✅ Endpoint de mensajes internos funcionando');
    console.log(`   Mensajes encontrados: ${messagesResponse.data.data.length}\n`);

    // 3. Crear un mensaje de prueba
    console.log('3️⃣ Creando mensaje de prueba...');
    const createResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        subject: 'Prueba desde Mensajería',
        content: 'Este es un mensaje de prueba enviado desde la sección de mensajería.',
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

    if (createResponse.status !== 201) {
      throw new Error(`Error creando mensaje: ${createResponse.data.message || createResponse.status}`);
    }

    console.log('✅ Mensaje creado exitosamente');
    console.log(`   ID: ${createResponse.data.data._id}`);
    console.log(`   Asunto: ${createResponse.data.data.subject}\n`);

    // 4. Verificar estadísticas
    console.log('4️⃣ Verificando estadísticas...');
    const statsResponse = await makeRequest(`${API_BASE}/internal-messages/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (statsResponse.status !== 200) {
      throw new Error(`Error obteniendo estadísticas: ${statsResponse.status}`);
    }

    console.log('✅ Estadísticas obtenidas:');
    console.log(`   Total de mensajes: ${statsResponse.data.data.totalMessages}`);
    console.log(`   Mensajes enviados: ${statsResponse.data.data.sentMessages}\n`);

    console.log('🎉 ¡Integración de mensajes internos en mensajería funcionando correctamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Login de administrador');
    console.log('   ✅ Endpoint de mensajes internos');
    console.log('   ✅ Creación de mensajes');
    console.log('   ✅ Estadísticas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMessagingIntegration(); 