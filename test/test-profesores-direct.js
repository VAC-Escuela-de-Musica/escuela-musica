const axios = require('axios');

const API_BASE_URL = 'http://146.83.198.35:1230/api';

// Función para obtener token de administrador
async function getAdminToken() {
  try {
    console.log('🔄 Obteniendo token de administrador...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    });
    console.log('✅ Token obtenido exitosamente');
    console.log('Token:', response.data.accessToken);
    return response.data.accessToken;
  } catch (error) {
    console.error('❌ Error obteniendo token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para probar acceso directo a profesores
async function testProfesoresDirect(token) {
  try {
    console.log('🔄 Probando acceso directo a profesores...');
    console.log('URL:', `${API_BASE_URL}/profesores`);
    console.log('Headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const response = await axios.get(`${API_BASE_URL}/profesores`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Acceso a profesores exitoso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error accediendo a profesores:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Función para crear profesor directamente
async function createProfesorDirect(token) {
  try {
    console.log('🔄 Creando profesor directamente...');
    const profesorData = {
      nombre: "Profesor",
      apellidos: "Prueba",
      rut: "12.345.678-9",
      email: "profesor@email.com",
      numero: "+56962774850",
      password: "profesor123",
      sueldo: 850000,
      fechaContrato: new Date().toISOString(),
      activo: true
    };

    console.log('Datos a enviar:', profesorData);

    const response = await axios.post(`${API_BASE_URL}/profesores`, profesorData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Profesor creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando profesor:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Función principal
async function ejecutarPruebas() {
  let token;

  try {
    console.log('🚀 Iniciando pruebas directas...\n');

    // 1. Obtener token
    console.log('=== 1. OBTENIENDO TOKEN ===');
    token = await getAdminToken();
    console.log('');

    // 2. Probar acceso a profesores
    console.log('=== 2. PROBANDO ACCESO A PROFESORES ===');
    await testProfesoresDirect(token);
    console.log('');

    // 3. Crear profesor
    console.log('=== 3. CREANDO PROFESOR ===');
    await createProfesorDirect(token);
    console.log('');

    console.log('🎉 ¡Todas las pruebas se ejecutaron exitosamente!');

  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  ejecutarPruebas();
}

module.exports = {
  ejecutarPruebas,
  getAdminToken,
  testProfesoresDirect,
  createProfesorDirect
}; 