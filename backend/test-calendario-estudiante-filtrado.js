const API_BASE_URL = 'http://localhost:1230';

// Función para hacer login como estudiante
async function loginEstudiante(email, password) {
  try {
    console.log(`🔐 Iniciando sesión como estudiante: ${email}`);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en login: ${response.status} - ${response.statusText}`);
      console.error(`📄 Respuesta: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Login exitoso para: ${data.data.user.username}`);
    console.log(`👤 Rol: ${data.data.user.roles.join(', ')}`);
    return data.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para hacer login como administrador
async function loginAdmin(email, password) {
  try {
    console.log(`🔐 Iniciando sesión como administrador: ${email}`);
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en login: ${response.status} - ${response.statusText}`);
      console.error(`📄 Respuesta: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Login exitoso para: ${data.data.user.username}`);
    console.log(`👤 Rol: ${data.data.user.roles.join(', ')}`);
    return data.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para obtener clases del estudiante
async function getStudentClasses(token, alumnoId) {
  try {
    console.log(`🔍 Obteniendo clases para estudiante: ${alumnoId}`);
    const response = await fetch(`${API_BASE_URL}/api/clases/estudiante/${alumnoId}`, {
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
        console.log(`   ${index + 1}. ${clase.titulo} - Estado: ${clase.estado}`);
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

// Función para obtener todas las clases (como admin)
async function getAllClasses(token) {
  try {
    console.log(`🔍 Obteniendo todas las clases (como admin)`);
    const response = await fetch(`${API_BASE_URL}/api/clases/programadas`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include'
    });

    console.log(`📊 Status de respuesta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error obteniendo todas las clases: ${response.status} - ${response.statusText}`);
      console.error(`📄 Respuesta del servidor: ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Se encontraron ${data.data ? data.data.length : 0} clases en total`);
    
    if (data.data && data.data.length > 0) {
      console.log('📚 Todas las clases:');
      data.data.forEach((clase, index) => {
        console.log(`   ${index + 1}. ${clase.titulo} - Estado: ${clase.estado}`);
        if (clase.horarios && clase.horarios.length > 0) {
          clase.horarios.forEach(horario => {
            console.log(`      📅 ${horario.dia} ${horario.horaInicio}-${horario.horaFin}`);
          });
        }
      });
    } else {
      console.log('ℹ️  No hay clases programadas');
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Error obteniendo todas las clases:', error.message);
    return null;
  }
}

// Función principal de prueba
async function testFiltradoClases() {
  console.log('🚀 Iniciando prueba de filtrado de clases...\n');

  // Credenciales de prueba (ajustar según tu base de datos)
  const estudianteEmail = 'estudiante@test.com';
  const estudiantePassword = '123456';
  const adminEmail = 'admin@test.com';
  const adminPassword = '123456';
  const alumnoId = '64f8b8b8b8b8b8b8b8b8b8b8'; // ID de ejemplo, ajustar

  // 1. Login como estudiante
  console.log('📋 PASO 1: Login como estudiante');
  const tokenEstudiante = await loginEstudiante(estudianteEmail, estudiantePassword);
  if (!tokenEstudiante) {
    console.error('❌ No se pudo hacer login como estudiante');
    return;
  }
  console.log('');

  // 2. Login como administrador
  console.log('📋 PASO 2: Login como administrador');
  const tokenAdmin = await loginAdmin(adminEmail, adminPassword);
  if (!tokenAdmin) {
    console.error('❌ No se pudo hacer login como administrador');
    return;
  }
  console.log('');

  // 3. Obtener clases del estudiante (vista de estudiante)
  console.log('📋 PASO 3: Clases del estudiante (vista de estudiante)');
  const clasesEstudiante = await getStudentClasses(tokenEstudiante, alumnoId);
  console.log('');

  // 4. Obtener todas las clases (vista de administrador)
  console.log('📋 PASO 4: Todas las clases (vista de administrador)');
  const todasLasClases = await getAllClasses(tokenAdmin);
  console.log('');

  // 5. Análisis de resultados
  console.log('📋 PASO 5: Análisis de resultados');
  if (clasesEstudiante && todasLasClases) {
    const clasesCanceladas = todasLasClases.filter(clase => clase.estado === 'cancelada');
    const clasesEstudianteCanceladas = clasesEstudiante.filter(clase => clase.estado === 'cancelada');
    
    console.log(`📊 Resumen:`);
    console.log(`   - Total de clases en el sistema: ${todasLasClases.length}`);
    console.log(`   - Clases canceladas en el sistema: ${clasesCanceladas.length}`);
    console.log(`   - Clases que ve el estudiante: ${clasesEstudiante.length}`);
    console.log(`   - Clases canceladas que ve el estudiante: ${clasesEstudianteCanceladas.length}`);
    
    if (clasesEstudianteCanceladas.length === 0) {
      console.log('✅ FILTRADO FUNCIONANDO: El estudiante no ve clases canceladas');
    } else {
      console.log('⚠️  ADVERTENCIA: El estudiante está viendo clases canceladas');
      console.log('   Clases canceladas que ve el estudiante:');
      clasesEstudianteCanceladas.forEach(clase => {
        console.log(`      - ${clase.titulo} (${clase.estado})`);
      });
    }
  } else {
    console.log('❌ No se pudieron obtener los datos para comparar');
  }

  console.log('\n🏁 Prueba completada');
}

// Ejecutar la prueba
testFiltradoClases().catch(console.error); 