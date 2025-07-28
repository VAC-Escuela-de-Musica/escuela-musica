const API_BASE_URL = 'http://localhost:1230/api';

// Función para obtener token de autenticación de un estudiante
async function getStudentToken() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'bairon.s@email.com',
        password: 'user123'
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error de login: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Token obtenido:', data.data?.accessToken ? 'SÍ' : 'NO');
    return data.data?.accessToken;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    return null;
  }
}

// Función para obtener datos del estudiante
async function getStudentData(token) {
  try {
    // Primero obtener el ID del usuario del token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.id;
    
    console.log('🔍 ID del usuario del token:', userId);
    
    const response = await fetch(`${API_BASE_URL}/alumnos/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo datos del estudiante: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Datos del estudiante obtenidos:', {
      id: data.data._id,
      nombre: data.data.nombreAlumno,
      email: data.data.email
    });
    return data.data;
  } catch (error) {
    console.error('❌ Error obteniendo datos del estudiante:', error.message);
    return null;
  }
}

// Función para obtener clases del estudiante
async function getStudentClasses(token, alumnoId) {
  try {
    console.log(`🔍 Obteniendo clases para estudiante: ${alumnoId}`);
    const response = await fetch(`${API_BASE_URL}/clases/estudiante/${alumnoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    console.log(`📊 Status de respuesta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error obteniendo clases del estudiante: ${response.status} - ${response.statusText}`);
      console.error(`📄 Respuesta del servidor: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Se encontraron ${data.data ? data.data.length : 0} clases para el estudiante`);
    
    if (data.data && data.data.length > 0) {
      console.log('📚 Clases encontradas:');
      data.data.forEach((clase, index) => {
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
    
    return data.data;
  } catch (error) {
    console.error('❌ Error obteniendo clases del estudiante:', error.message);
    return null;
  }
}

// Función para verificar autorización
async function testAuthorization(token) {
  try {
    console.log('🔍 Probando autorización...');
    
    // Probar endpoint que requiere rol de estudiante
    const response = await fetch(`${API_BASE_URL}/clases/estudiante/test`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    console.log(`📊 Status de autorización: ${response.status} ${response.statusText}`);
    
    if (response.status === 403) {
      console.log('❌ Acceso denegado - Problema de autorización');
    } else if (response.status === 200 || response.status === 204) {
      console.log('✅ Autorización correcta');
    } else {
      console.log('⚠️  Respuesta inesperada');
    }
  } catch (error) {
    console.error('❌ Error probando autorización:', error.message);
  }
}

// Función principal de prueba
async function testStudentCalendar() {
  console.log('🧪 Iniciando pruebas del calendario de estudiantes...\n');

  // 1. Obtener token de autenticación
  console.log('1. Obteniendo token de autenticación...');
  const token = await getStudentToken();
  if (!token) {
    console.error('❌ No se pudo obtener el token de autenticación');
    return;
  }
  console.log('');

  // 2. Probar autorización
  console.log('2. Probando autorización...');
  await testAuthorization(token);
  console.log('');

  // 3. Obtener datos del estudiante
  console.log('3. Obteniendo datos del estudiante...');
  const studentData = await getStudentData(token);
  if (!studentData) {
    console.error('❌ No se pudieron obtener los datos del estudiante');
    return;
  }
  console.log('');

  // 4. Obtener clases del estudiante
  console.log('4. Obteniendo clases del estudiante...');
  const classes = await getStudentClasses(token, studentData._id);
  if (!classes) {
    console.error('❌ No se pudieron obtener las clases del estudiante');
    return;
  }
  console.log('');

  // 5. Verificar estructura de datos
  console.log('5. Verificando estructura de datos...');
  if (classes.length > 0) {
    const clase = classes[0];
    const requiredFields = ['_id', 'titulo', 'descripcion', 'profesor', 'sala', 'horarios', 'estado'];
    const missingFields = requiredFields.filter(field => !clase[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ Estructura de datos correcta');
    } else {
      console.log('⚠️  Campos faltantes:', missingFields);
    }
  } else {
    console.log('ℹ️  No hay clases para verificar estructura');
  }
  console.log('');

  console.log('🎉 Pruebas del calendario de estudiantes completadas');
}

// Ejecutar pruebas
testStudentCalendar().catch(console.error); 