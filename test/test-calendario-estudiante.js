const API_BASE_URL = 'http://localhost:1230/api';

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'estudiante@test.com', // Cambiar por un email de estudiante real
        password: 'password123'
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error de login: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
}

// Función para obtener datos del estudiante
async function getStudentData(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/alumnos/user/1`, { // Cambiar por un ID real
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo datos del estudiante: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error obteniendo datos del estudiante:', error);
    return null;
  }
}

// Función para obtener clases del estudiante
async function getStudentClasses(token, alumnoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/clases/estudiante/${alumnoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo clases del estudiante: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error obteniendo clases del estudiante:', error);
    return null;
  }
}

// Función principal de prueba
async function testStudentCalendar() {
  console.log('🧪 Iniciando pruebas del calendario de estudiantes...\n');

  // 1. Obtener token de autenticación
  console.log('1. Obteniendo token de autenticación...');
  const token = await getAuthToken();
  if (!token) {
    console.error('❌ No se pudo obtener el token de autenticación');
    return;
  }
  console.log('✅ Token obtenido correctamente\n');

  // 2. Obtener datos del estudiante
  console.log('2. Obteniendo datos del estudiante...');
  const studentData = await getStudentData(token);
  if (!studentData) {
    console.error('❌ No se pudieron obtener los datos del estudiante');
    return;
  }
  console.log('✅ Datos del estudiante obtenidos:', {
    id: studentData._id,
    nombre: studentData.nombreAlumno,
    email: studentData.email
  });
  console.log('');

  // 3. Obtener clases del estudiante
  console.log('3. Obteniendo clases del estudiante...');
  const classes = await getStudentClasses(token, studentData._id);
  if (!classes) {
    console.error('❌ No se pudieron obtener las clases del estudiante');
    return;
  }
  console.log(`✅ Se encontraron ${classes.length} clases para el estudiante`);
  
  if (classes.length > 0) {
    console.log('📚 Clases encontradas:');
    classes.forEach((clase, index) => {
      console.log(`   ${index + 1}. ${clase.titulo} - ${clase.estado}`);
      if (clase.horarios && clase.horarios.length > 0) {
        clase.horarios.forEach(horario => {
          console.log(`      📅 ${horario.dia} ${horario.horaInicio}-${horario.horaFin}`);
        });
      }
    });
  } else {
    console.log('ℹ️  El estudiante no tiene clases asignadas');
  }
  console.log('');

  // 4. Verificar estructura de datos
  console.log('4. Verificando estructura de datos...');
  if (classes.length > 0) {
    const clase = classes[0];
    const requiredFields = ['_id', 'titulo', 'descripcion', 'profesor', 'sala', 'horarios', 'estado'];
    const missingFields = requiredFields.filter(field => !clase[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Estructura de datos correcta');
    } else {
      console.log('⚠️  Campos faltantes:', missingFields);
    }
  }
  console.log('');

  console.log('🎉 Pruebas del calendario de estudiantes completadas');
}

// Ejecutar pruebas
testStudentCalendar().catch(console.error); 