import axios from 'axios'

const API_BASE = 'http://localhost:1230/api'

async function debugDeleteMaterial () {
  try {
    console.log('🔍 Iniciando debug de eliminación de material...')

    // 1. Login como admin
    console.log('\n1. 🔐 Intentando login como admin...')
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@email.com',
      password: 'admin123'
    })

    if (!loginResponse.data.success) {
      console.error('❌ Login falló:', loginResponse.data)
      return
    }

    const token = loginResponse.data.data.accessToken
    console.log('✅ Login exitoso, token obtenido')

    // 2. Verificar token con endpoint verify
    console.log('\n2. 🔍 Verificando token...')
    const verifyResponse = await axios.get(`${API_BASE}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    console.log('✅ Token verificado:', {
      user: verifyResponse.data.data.user.email,
      roles: verifyResponse.data.data.user.roles.map(r => r.name || r)
    })

    // 3. Listar materiales para obtener un ID válido
    console.log('\n3. 📋 Obteniendo lista de materiales...')
    const materialsResponse = await axios.get(`${API_BASE}/materials`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const materials = materialsResponse.data.data.documents
    console.log(`✅ ${materials.length} materiales encontrados`)

    if (materials.length === 0) {
      console.log('⚠️ No hay materiales para eliminar')
      return
    }

    const materialToDelete = materials[0]
    console.log('🎯 Material seleccionado para eliminar:', {
      id: materialToDelete._id,
      nombre: materialToDelete.nombre,
      usuario: materialToDelete.usuario,
      bucketTipo: materialToDelete.bucketTipo
    })

    // 4. Intentar eliminar material
    console.log('\n4. 🗑️ Intentando eliminar material...')
    console.log('URL:', `${API_BASE}/materials/${materialToDelete._id}`)
    console.log('Headers:', { Authorization: `Bearer ${token}` })

    try {
      const deleteResponse = await axios.delete(`${API_BASE}/materials/${materialToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('✅ Material eliminado exitosamente:', deleteResponse.data)
    } catch (deleteError) {
      console.error('❌ Error eliminando material:')
      console.error('Status:', deleteError.response?.status)
      console.error('Status Text:', deleteError.response?.statusText)
      console.error('Data:', deleteError.response?.data)

      if (deleteError.response?.status === 403) {
        console.log('\n🔍 Error 403 - Permisos insuficientes')
        console.log('Esto indica que el usuario admin no tiene permisos para eliminar el material')
        console.log('Revisa los logs del servidor para más detalles')
      }
    }
  } catch (error) {
    console.error('💥 Error general:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
  }
}

// Ejecutar el debug
debugDeleteMaterial().then(() => {
  console.log('\n🏁 Debug completado')
  process.exit(0)
}).catch(error => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})
