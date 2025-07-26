const axios = require('axios');

const API_BASE_URL = 'http://146.83.198.35:1230/api';

// Datos de prueba para un profesor
const profesorTest = {
  nombre: "Juan Carlos",
  apellidos: "González Pérez",
  rut: "12.345.678-9",
  email: "juan.gonzalez@escuelamusica.com",
  numero: "+56912345678",
  password: "profesor123",
  sueldo: 850000,
  fechaContrato: new Date().toISOString(),
  activo: true
};

// Función para obtener token de administrador
async function getAdminToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    });
    return response.data.accessToken;
  } catch (error) {
    console.error('Error obteniendo token de admin:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear un profesor
async function crearProfesor(token) {
  try {
    console.log('🔄 Creando profesor...');
    const response = await axios.post(`${API_BASE_URL}/profesores`, profesorTest, {
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

// Función para obtener todos los profesores
async function obtenerProfesores(token) {
  try {
    console.log('🔄 Obteniendo profesores...');
    const response = await axios.get(`${API_BASE_URL}/profesores`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profesores obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo profesores:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener un profesor por ID
async function obtenerProfesorPorId(token, profesorId) {
  try {
    console.log(`🔄 Obteniendo profesor con ID: ${profesorId}...`);
    const response = await axios.get(`${API_BASE_URL}/profesores/${profesorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profesor obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo profesor por ID:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar un profesor
async function actualizarProfesor(token, profesorId) {
  try {
    console.log(`🔄 Actualizando profesor con ID: ${profesorId}...`);
    const datosActualizados = {
      ...profesorTest,
      nombre: "Juan Carlos Actualizado",
      sueldo: 900000
    };
    
    const response = await axios.put(`${API_BASE_URL}/profesores/${profesorId}`, datosActualizados, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Profesor actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando profesor:', error.response?.data || error.message);
    throw error;
  }
}

// Función para cambiar estado de un profesor
async function cambiarEstadoProfesor(token, profesorId) {
  try {
    console.log(`🔄 Cambiando estado del profesor con ID: ${profesorId}...`);
    const response = await axios.put(`${API_BASE_URL}/profesores/${profesorId}/toggle-status`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Estado del profesor cambiado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error cambiando estado del profesor:', error.response?.data || error.message);
    throw error;
  }
}

// Función para eliminar un profesor
async function eliminarProfesor(token, profesorId) {
  try {
    console.log(`🔄 Eliminando profesor con ID: ${profesorId}...`);
    const response = await axios.delete(`${API_BASE_URL}/profesores/${profesorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profesor eliminado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando profesor:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal para ejecutar todas las pruebas
async function ejecutarPruebas() {
  let token;
  let profesorCreado;

  try {
    console.log('🚀 Iniciando pruebas del CRUD de profesores...\n');

    // 1. Obtener token de administrador
    console.log('=== 1. OBTENIENDO TOKEN DE ADMINISTRADOR ===');
    token = await getAdminToken();
    console.log('✅ Token obtenido exitosamente\n');

    // 2. Crear profesor
    console.log('=== 2. CREANDO PROFESOR ===');
    profesorCreado = await crearProfesor(token);
    console.log('✅ Profesor creado exitosamente\n');

    // 3. Obtener todos los profesores
    console.log('=== 3. OBTENIENDO TODOS LOS PROFESORES ===');
    await obtenerProfesores(token);
    console.log('✅ Lista de profesores obtenida exitosamente\n');

    // 4. Obtener profesor por ID
    console.log('=== 4. OBTENIENDO PROFESOR POR ID ===');
    await obtenerProfesorPorId(token, profesorCreado._id);
    console.log('✅ Profesor por ID obtenido exitosamente\n');

    // 5. Actualizar profesor
    console.log('=== 5. ACTUALIZANDO PROFESOR ===');
    await actualizarProfesor(token, profesorCreado._id);
    console.log('✅ Profesor actualizado exitosamente\n');

    // 6. Cambiar estado del profesor
    console.log('=== 6. CAMBIANDO ESTADO DEL PROFESOR ===');
    await cambiarEstadoProfesor(token, profesorCreado._id);
    console.log('✅ Estado del profesor cambiado exitosamente\n');

    // 7. Obtener profesores activos
    console.log('=== 7. OBTENIENDO PROFESORES ACTIVOS ===');
    try {
      const response = await axios.get(`${API_BASE_URL}/profesores/activos/lista`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Profesores activos obtenidos:', response.data);
    } catch (error) {
      console.error('❌ Error obteniendo profesores activos:', error.response?.data || error.message);
    }
    console.log('');

    // 8. Eliminar profesor
    console.log('=== 8. ELIMINANDO PROFESOR ===');
    await eliminarProfesor(token, profesorCreado._id);
    console.log('✅ Profesor eliminado exitosamente\n');

    console.log('🎉 ¡Todas las pruebas del CRUD de profesores se ejecutaron exitosamente!');

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
  crearProfesor,
  obtenerProfesores,
  obtenerProfesorPorId,
  actualizarProfesor,
  cambiarEstadoProfesor,
  eliminarProfesor
}; 