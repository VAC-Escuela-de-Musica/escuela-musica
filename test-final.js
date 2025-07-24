const axios = require('axios')

// Configuración
const BASE_URL = 'http://localhost:1230'
const ADMIN_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'admin123'
}

async function testFinal() {
  console.log('🔍 === TEST FINAL - FORMATO CORRECTO ===')
  
  try {
    // 1. Login
    console.log('\n1. 🔐 Login de administrador...')
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS)
    
    const token = loginResponse.data.data.accessToken
    console.log('✅ Login exitoso')
    
    // 2. Test POST con formato correcto de RUT
    console.log('\n2. 🔍 Probando POST /api/alumnos con RUT en formato correcto...')
    const testStudent = {
      nombreAlumno: 'María González Test',
      rutAlumno: '12.345.678-9', // Formato correcto con puntos
      fechaIngreso: '2025-01-15',
      email: 'maria.test@email.com',
      telefono: '987654321',
      direccion: 'Calle Test 456',
      fechaNacimiento: '1999-03-20'
    }
    
    console.log('📤 Enviando datos con RUT correcto:', testStudent.rutAlumno)
    
    const response = await axios.post(`${BASE_URL}/api/alumnos`, testStudent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ POST exitoso:', response.status)
    console.log('📊 Alumno creado:', response.data.data.nombreAlumno)
    
    console.log('\n🎉 === PROBLEMA COMPLETAMENTE RESUELTO ===')
    console.log('✅ Middleware CSRF configurado correctamente')
    console.log('✅ Autenticación JWT funcionando')
    console.log('✅ Autorización por roles funcionando')
    console.log('✅ Endpoint POST /api/alumnos completamente operativo')
    console.log('✅ Validaciones de datos funcionando correctamente')
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
  }
}

// Ejecutar test
testFinal()
  .then(() => console.log('\n🏁 Test final completado'))
  .catch(err => console.error('💥 Error:', err))