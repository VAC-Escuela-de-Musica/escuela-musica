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

async function testFrontendInternalMessages() {
  console.log('🧪 Simulando peticiones del frontend para mensajes internos...\n');

  try {
    // 1. Obtener CSRF token
    console.log('1️⃣ Obteniendo CSRF token...');
    const csrfResponse = await makeRequest(`${API_BASE}/csrf-token`);
    
    if (csrfResponse.status !== 200) {
      console.error('❌ Error obteniendo CSRF token:', csrfResponse.data);
      return;
    }
    
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('✅ CSRF token obtenido:', csrfToken.substring(0, 20) + '...\n');

    // 2. Login como administrador
    console.log('2️⃣ Login como administrador...');
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

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.error('❌ Error en login:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login exitoso');
    console.log('   Token JWT:', token.substring(0, 20) + '...\n');

    // 3. Crear mensaje interno (simulando frontend)
    console.log('3️⃣ Creando mensaje interno (simulando frontend)...');
    const createResponse = await makeRequest(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        '_csrf': csrfToken
      },
      body: {
        subject: 'Prueba desde Frontend',
        content: 'Este es un mensaje de prueba enviado desde el frontend.',
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

    console.log('📡 Respuesta del servidor:');
    console.log('   Status:', createResponse.status);
    console.log('   Success:', createResponse.data.success);
    
    if (createResponse.status === 201 && createResponse.data.success) {
      console.log('✅ Mensaje creado exitosamente');
      console.log('   ID:', createResponse.data.data._id);
    } else {
      console.error('❌ Error creando mensaje:', createResponse.data);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testFrontendInternalMessages(); 