// Script para crear un usuario estudiante de prueba
import mongoose from 'mongoose'
import User from '../src/core/models/user.model.js'
import Role from '../src/core/models/role.model.js'
import { DB_URL } from '../src/core/config/configEnv.js'

async function createStudentUser() {
  try {
    console.log('🔌 Conectando a la base de datos...')
    await mongoose.connect(DB_URL)
    console.log('✅ Conectado a la base de datos')

    // Buscar el rol de estudiante
    const studentRole = await Role.findOne({ name: 'estudiante' })
    if (!studentRole) {
      console.log('❌ No se encontró el rol "estudiante"')
      return
    }
    console.log('✅ Rol estudiante encontrado:', studentRole._id)

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: 'testudiante@email.com' })
    if (existingUser) {
      console.log('⚠️ El usuario testudiante@email.com ya existe')
      return
    }

    // Crear el usuario estudiante
    const studentUser = {
      username: 'testudiante',
      email: 'testudiante@email.com',
      rut: '11111111-1',
      password: await User.encryptPassword('user123'),
      roles: [studentRole._id]
    }

    const newUser = await User.create(studentUser)
    console.log('✅ Usuario estudiante creado exitosamente:')
    console.log('   📧 Email:', newUser.email)
    console.log('   👤 Username:', newUser.username)
    console.log('   🆔 RUT:', newUser.rut)
    console.log('   🔑 Password: user123')
    console.log('   👥 Rol: estudiante')

  } catch (error) {
    console.error('❌ Error creando usuario estudiante:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Desconectado de la base de datos')
  }
}

// Ejecutar el script
createStudentUser()