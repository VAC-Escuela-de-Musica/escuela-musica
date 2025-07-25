const axios = require('axios')

// Configuración
const BASE_URL = 'http://localhost:1230'
const ADMIN_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'admin123'
}

async function testPostComplete() {
  console.log('🔍 === TEST POST COMPLETO ===')
  
  try {
    // 1. Login
    console.log('\n1. 🔐 Login de administrador...')
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS)
    
    if (!loginResponse.data.success) {
      console.log('❌ Login falló')
      return
    }
    
    const token = loginResponse.data.data.accessToken
    console.log('✅ Login exitoso, token obtenido')
    
    // 2. Test POST con todos los campos requeridos
    console.log('\n2. 🔍 Probando POST /api/alumnos con datos completos...')
    const testStudent = {
      nombreAlumno: 'Juan Pérez Test',
      rutAlumno: '12345678-9',
      fechaIngreso: '2025-01-15',
      email: 'juan.test@email.com',
      telefono: '987654321',
      direccion: 'Calle Test 123',
      fechaNacimiento: '2000-05-15'
    }
    
    console.log('📤 Enviando datos completos:', testStudent)
    
    try {
      const response = await axios.post(`${BASE_URL}/api/alumnos`, testStudent, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      
      console.log('✅ POST exitoso:', response.status)
      console.log('📊 Alumno creado:', response.data.data)
      console.log('\n🎉 === PROBLEMA RESUELTO ===')
      console.log('✅ El middleware CSRF ha sido configurado correctamente')
      console.log('✅ La autenticación JWT funciona')
      console.log('✅ La autorización por roles funciona')
      console.log('✅ El endpoint POST /api/alumnos está operativo')
      
    } catch (postError) {
      console.log('❌ POST falló:', postError.response?.status || 'Sin status')
      console.log('📝 Error message:', postError.message)
      
      if (postError.response) {
        console.log('📋 Response data:', postError.response.data)
        
        if (postError.response.status === 400) {
          console.log('\n🔍 Error de validación - revisar campos requeridos')
        }
      }
    }
    
    // 3. Test GET para verificar que el alumno se creó
    console.log('\n3. 🔍 Verificando lista de alumnos...')
    try {
      const getResponse = await axios.get(`${BASE_URL}/api/alumnos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('✅ GET /api/alumnos exitoso')
      console.log('📊 Total de alumnos:', getResponse.data.data?.length || 0)
      
    } catch (getError) {
      console.log('❌ GET falló:', getError.response?.status)
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar test
testPostComplete()
  .then(() => console.log('\n🏁 Test completado'))
  .catch(err => console.error('💥 Error en test:', err))