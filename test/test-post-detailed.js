const axios = require('axios')

// Configuración
const BASE_URL = 'http://localhost:1230'
const ADMIN_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'admin123'
}

async function testPostDetailed() {
  console.log('🔍 === TEST POST DETALLADO ===')
  
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
    
    // 2. Test POST con datos mínimos
    console.log('\n2. 🔍 Probando POST /api/alumnos...')
    const testStudent = {
      nombre: 'Test Student Detailed',
      email: 'test.detailed@student.com',
      telefono: '123456789'
    }
    
    console.log('📤 Enviando datos:', testStudent)
    console.log('🎫 Con token:', token.substring(0, 20) + '...')
    
    try {
      const response = await axios.post(`${BASE_URL}/api/alumnos`, testStudent, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      
      console.log('✅ POST exitoso:', response.status)
      console.log('📊 Respuesta:', response.data)
      
    } catch (postError) {
      console.log('❌ POST falló:', postError.response?.status || 'Sin status')
      console.log('📝 Error message:', postError.message)
      
      if (postError.response) {
        console.log('📋 Response headers:', postError.response.headers)
        console.log('📋 Response data:', postError.response.data)
        
        // Analizar el tipo de error
        if (postError.response.status === 403) {
          console.log('\n🔍 === ANÁLISIS ERROR 403 ===')
          console.log('El error 403 indica que:')
          console.log('- ✅ authenticateJWT funcionó (token válido)')
          console.log('- ❌ requireAdmin rechazó la petición')
          console.log('\nPosibles causas:')
          console.log('1. loadUserData no se ejecutó correctamente')
          console.log('2. loadUserData no estableció req.user.roleNames')
          console.log('3. requireRole no encontró el rol "administrador"')
          console.log('\nRevisa los logs del servidor para más detalles.')
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar test
testPostDetailed()
  .then(() => console.log('\n🏁 Test completado'))
  .catch(err => console.error('💥 Error en test:', err))