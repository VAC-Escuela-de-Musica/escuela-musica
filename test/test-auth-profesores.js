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
    return response.data.accessToken;
  } catch (error) {
    console.error('❌ Error obteniendo token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para verificar el perfil del usuario
async function verifyUserProfile(token) {
  try {
    console.log('🔄 Verificando perfil de usuario...');
    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Perfil de usuario:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error verificando perfil:', error.response?.data || error.message);
    throw error;
  }
}

// Función para verificar acceso a profesores
async function testProfesoresAccess(token) {
  try {
    console.log('🔄 Probando acceso a profesores...');
    const response = await axios.get(`${API_BASE_URL}/profesores`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Acceso a profesores exitoso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error accediendo a profesores:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un profesor de prueba
async function createTestProfesor(token) {
  try {
    console.log('🔄 Creando profesor de prueba...');
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

    const response = await axios.post(`${API_BASE_URL}/profesores`, profesorData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Profesor creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando profesor:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal para ejecutar todas las pruebas
async function ejecutarPruebas() {
  let token;
  let userProfile;

  try {
    console.log('🚀 Iniciando pruebas de autenticación y permisos...\n');

    // 1. Obtener token de administrador
    console.log('=== 1. OBTENIENDO TOKEN DE ADMINISTRADOR ===');
    token = await getAdminToken();
    console.log('✅ Token obtenido exitosamente\n');

    // 2. Verificar perfil de usuario
    console.log('=== 2. VERIFICANDO PERFIL DE USUARIO ===');
    userProfile = await verifyUserProfile(token);
    console.log('✅ Perfil verificado exitosamente\n');

    // 3. Verificar roles del usuario
    console.log('=== 3. VERIFICANDO ROLES DEL USUARIO ===');
    if (userProfile.user && userProfile.user.roles) {
      console.log('Roles del usuario:', userProfile.user.roles);
      const isAdmin = userProfile.user.roles.some(role => 
        role === 'administrador' || (role.name && role.name === 'administrador')
      );
      console.log('¿Es administrador?', isAdmin);
    } else {
      console.log('⚠️ No se encontraron roles en el perfil del usuario');
    }
    console.log('');

    // 4. Probar acceso a profesores
    console.log('=== 4. PROBANDO ACCESO A PROFESORES ===');
    await testProfesoresAccess(token);
    console.log('✅ Acceso a profesores verificado exitosamente\n');

    // 5. Crear profesor de prueba
    console.log('=== 5. CREANDO PROFESOR DE PRUEBA ===');
    await createTestProfesor(token);
    console.log('✅ Profesor de prueba creado exitosamente\n');

    console.log('🎉 ¡Todas las pruebas de autenticación y permisos se ejecutaron exitosamente!');

  } catch (error) {
    console.error('💥 Error en las pruebas:', error.message);
    process.exit(1);
  }
}

// Ejecutar las pruebas si el script se ejecuta directamente
if (require.main === module) {
  ejecutarPruebas();
}

module.exports = {
  ejecutarPruebas,
  getAdminToken,
  verifyUserProfile,
  testProfesoresAccess,
  createTestProfesor
}; 