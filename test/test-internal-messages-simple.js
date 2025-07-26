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

async function testInternalMessages() {
  console.log('🧪 Probando sistema de mensajes internos...\n');

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

    // 2. Crear mensaje interno
    console.log('2️⃣ Creando mensaje interno...');
    const createResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        subject: 'Prueba de Mensaje Interno',
        content: 'Este es un mensaje de prueba enviado desde el sistema interno.',
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

    // 3. Obtener lista de mensajes
    console.log('3️⃣ Obteniendo lista de mensajes...');
    const listResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (listResponse.status !== 200) {
      throw new Error(`Error obteniendo mensajes: ${listResponse.status}`);
    }

    console.log(`✅ Lista obtenida: ${listResponse.data.data.length} mensajes\n`);

    console.log('🎉 ¡Sistema de mensajes internos funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testInternalMessages(); 