import fetch from 'node-fetch';

const API_BASE = 'http://localhost:1230/api';

// Datos de prueba
const adminCredentials = {
  username: 'admin',
  password: 'admin123'
};

const testMessage = {
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
};

async function testInternalMessages() {
  console.log('🧪 Iniciando pruebas del sistema de mensajes internos...\n');

  try {
    // 1. Login como administrador
    console.log('1️⃣ Iniciando sesión como administrador...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminCredentials)
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Login exitoso\n');

    // 2. Crear un mensaje interno
    console.log('2️⃣ Creando mensaje interno...');
    const createResponse = await fetch(`${API_BASE}/internal-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testMessage)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Error creando mensaje: ${errorData.message || createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const messageId = createData.data._id;
    console.log('✅ Mensaje creado exitosamente');
    console.log(`   ID: ${messageId}`);
    console.log(`   Asunto: ${createData.data.subject}\n`);

    // 3. Enviar el mensaje
    console.log('3️⃣ Enviando mensaje...');
    const sendResponse = await fetch(`${API_BASE}/internal-messages/${messageId}/send`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(`Error enviando mensaje: ${errorData.message || sendResponse.statusText}`);
    }

    console.log('✅ Mensaje enviado exitosamente\n');

    // 4. Obtener todos los mensajes
    console.log('4️⃣ Obteniendo lista de mensajes...');
    const listResponse = await fetch(`${API_BASE}/internal-messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Error obteniendo mensajes: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    console.log(`✅ Lista obtenida: ${listData.data.length} mensajes\n`);

    // 5. Obtener estadísticas
    console.log('5️⃣ Obteniendo estadísticas...');
    const statsResponse = await fetch(`${API_BASE}/internal-messages/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Error obteniendo estadísticas: ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Estadísticas obtenidas:');
    console.log(`   Total de mensajes: ${statsData.data.totalMessages}`);
    console.log(`   Mensajes enviados: ${statsData.data.sentMessages}`);
    console.log(`   Mensajes leídos: ${statsData.data.readMessages}\n`);

    // 6. Obtener mensaje específico
    console.log('6️⃣ Obteniendo mensaje específico...');
    const getResponse = await fetch(`${API_BASE}/internal-messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Error obteniendo mensaje: ${getResponse.statusText}`);
    }

    const getData = await getResponse.json();
    console.log('✅ Mensaje obtenido:');
    console.log(`   Asunto: ${getData.data.subject}`);
    console.log(`   Contenido: ${getData.data.content}`);
    console.log(`   Estado: ${getData.data.status}`);
    console.log(`   Tipo: ${getData.data.type}`);
    console.log(`   Prioridad: ${getData.data.priority}\n`);

    console.log('🎉 ¡Todas las pruebas del sistema de mensajes internos fueron exitosas!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Login de administrador');
    console.log('   ✅ Creación de mensaje interno');
    console.log('   ✅ Envío de mensaje');
    console.log('   ✅ Listado de mensajes');
    console.log('   ✅ Estadísticas');
    console.log('   ✅ Obtención de mensaje específico');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
testInternalMessages(); 