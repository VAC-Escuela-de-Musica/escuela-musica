const axios = require('axios')

// Configuración
const BASE_URL = 'http://localhost:1230'
const ADMIN_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'admin123'
}

async function debugMiddlewareFlow() {
  console.log('🔍 === DIAGNÓSTICO DEL FLUJO DE MIDDLEWARES ===')
  
  try {
    // 1. Verificar conectividad
    console.log('\n1. 🌐 Verificando conectividad del backend...')
    const healthResponse = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 5000
    })
    console.log('✅ Backend conectado:', healthResponse.status)
    
    // 2. Login de administrador
    console.log('\n2. 🔐 Intentando login de administrador...')
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, ADMIN_CREDENTIALS, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.accessToken
      const userEmail = loginResponse.data.data.user.email
      console.log('✅ Login exitoso')
      console.log('📧 Email:', userEmail)
      console.log('🎫 Token obtenido:', token ? 'Sí' : 'No')
      
      // 3. Verificar endpoint que requiere autenticación básica
      console.log('\n3. 🔍 Probando endpoint con autenticación básica (GET /api/users)...')
      try {
        const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ GET /api/users exitoso:', usersResponse.status)
        console.log('📊 Usuarios encontrados:', usersResponse.data.data?.length || 0)
      } catch (usersError) {
        console.log('❌ GET /api/users falló:', usersError.response?.status)
        console.log('📝 Error:', usersError.response?.data?.error || usersError.message)
        console.log('🔍 Detalles:', usersError.response?.data?.details || 'Sin detalles')
      }
      
      // 4. Verificar endpoint que requiere rol admin (GET /api/alumnos)
      console.log('\n4. 🔍 Probando endpoint que requiere rol admin (GET /api/alumnos)...')
      try {
        const alumnosGetResponse = await axios.get(`${BASE_URL}/api/alumnos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ GET /api/alumnos exitoso:', alumnosGetResponse.status)
        console.log('📊 Alumnos encontrados:', alumnosGetResponse.data.data?.length || 0)
      } catch (alumnosGetError) {
        console.log('❌ GET /api/alumnos falló:', alumnosGetError.response?.status)
        console.log('📝 Error:', alumnosGetError.response?.data?.error || alumnosGetError.message)
        console.log('🔍 Detalles:', alumnosGetError.response?.data?.details || 'Sin detalles')
      }
      
      // 5. Verificar endpoint que requiere rol admin (POST /api/alumnos)
      console.log('\n5. 🔍 Probando endpoint que requiere rol admin (POST /api/alumnos)...')
      const testStudent = {
        nombre: 'Test Student',
        email: 'test@student.com',
        telefono: '123456789',
        fechaNacimiento: '2000-01-01',
        instrumento: 'Piano'
      }
      
      try {
        const alumnosPostResponse = await axios.post(`${BASE_URL}/api/alumnos`, testStudent, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('✅ POST /api/alumnos exitoso:', alumnosPostResponse.status)
        console.log('📊 Alumno creado:', alumnosPostResponse.data.data?.nombre || 'Sin nombre')
      } catch (alumnosPostError) {
        console.log('❌ POST /api/alumnos falló:', alumnosPostError.response?.status)
        console.log('📝 Error:', alumnosPostError.response?.data?.error || alumnosPostError.message)
        console.log('🔍 Detalles:', alumnosPostError.response?.data?.details || 'Sin detalles')
        
        // Información adicional para debugging
        if (alumnosPostError.response?.status === 403) {
          console.log('\n🔍 === ANÁLISIS DEL ERROR 403 ===')
          console.log('Este error indica que:')
          console.log('- ✅ El token JWT es válido (pasó authenticateJWT)')
          console.log('- ❌ El middleware requireAdmin rechazó la petición')
          console.log('- 🔍 Posibles causas:')
          console.log('  • loadUserData no está cargando req.user.roleNames correctamente')
          console.log('  • El usuario no tiene el rol "administrador"')
          console.log('  • Hay un problema en la lógica de requireRole')
        }
      }
      
      // 6. Verificar información del token decodificado
      console.log('\n6. 🔍 Información del token JWT...')
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.decode(token)
        console.log('📋 Token decodificado:')
        console.log('  - Email:', decoded.email)
        console.log('  - ID:', decoded.id)
        console.log('  - Roles en token:', decoded.roles)
        console.log('  - Expiración:', new Date(decoded.exp * 1000).toISOString())
      } catch (decodeError) {
        console.log('❌ Error decodificando token:', decodeError.message)
      }
      
    } else {
      console.log('❌ Login falló')
      console.log('📝 Respuesta:', loginResponse.data)
    }
    
  } catch (error) {
    console.error('💥 Error general:', error.message)
    if (error.response) {
      console.log('📝 Status:', error.response.status)
      console.log('📝 Data:', error.response.data)
    }
  }
}

// Ejecutar diagnóstico
debugMiddlewareFlow()
  .then(() => console.log('\n🏁 Diagnóstico completado'))
  .catch(err => console.error('💥 Error en diagnóstico:', err))