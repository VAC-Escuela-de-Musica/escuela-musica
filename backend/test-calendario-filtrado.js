const API_BASE_URL = 'http://localhost:1230/api';

async function testCalendarFiltering() {
  try {
    console.log('🧪 Probando filtrado de clases canceladas...\n');

    // 1. Obtener token
    console.log('1. Obteniendo token...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bairon.s@email.com',
        password: 'user123'
      }),
      credentials: 'include'
    });

    const loginData = await loginResponse.json();
    const token = loginData.data?.accessToken;
    
    if (!token) {
      console.error('❌ No se pudo obtener el token');
      return;
    }
    console.log('✅ Token obtenido\n');

    // 2. Obtener clases del estudiante
    console.log('2. Obteniendo clases del estudiante...');
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.id;
    
    const classesResponse = await fetch(`${API_BASE_URL}/clases/estudiante/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });

    const classesData = await classesResponse.json();
    const allClasses = classesData.data || [];
    
    console.log(`📊 Total de clases: ${allClasses.length}`);
    
    // 3. Contar por estado
    const clasesPorEstado = {
      programada: 0,
      cancelada: 0,
      completada: 0
    };
    
    allClasses.forEach(clase => {
      const estado = clase.estado || 'programada';
      clasesPorEstado[estado] = (clasesPorEstado[estado] || 0) + 1;
    });
    
    console.log('📈 Distribución por estado:');
    console.log(`   - Programadas: ${clasesPorEstado.programada}`);
    console.log(`   - Canceladas: ${clasesPorEstado.cancelada}`);
    console.log(`   - Completadas: ${clasesPorEstado.completada}`);
    console.log('');

    // 4. Simular filtrado del frontend
    console.log('3. Simulando filtrado del frontend...');
    const clasesFiltradas = allClasses.filter(clase => clase.estado !== 'cancelada');
    
    console.log(`✅ Clases que se mostrarán en el calendario: ${clasesFiltradas.length}`);
    console.log('📚 Clases visibles:');
    
    clasesFiltradas.forEach((clase, index) => {
      console.log(`   ${index + 1}. ${clase.titulo} - ${clase.estado}`);
      if (clase.horarios && clase.horarios.length > 0) {
        clase.horarios.forEach(horario => {
          console.log(`      📅 ${horario.dia} ${horario.horaInicio}-${horario.horaFin}`);
        });
      }
    });
    
    console.log('');
    console.log('🎉 Prueba de filtrado completada');
    console.log(`📊 Resumen: ${allClasses.length} clases totales, ${clasesFiltradas.length} visibles en calendario`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCalendarFiltering(); 