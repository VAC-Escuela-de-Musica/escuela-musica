import mongoose from 'mongoose'
import { DB_URL } from '../src/config/configEnv.js'

async function checkRoles () {
  try {
    // Conectar a la base de datos
    await mongoose.connect(DB_URL)
    console.log('✅ Conectado a MongoDB')

    // Verificar si existe una colección de roles
    const collections = await mongoose.connection.db.listCollections().toArray()
    const roleCollection = collections.find((col) => col.name === 'roles')

    if (roleCollection) {
      console.log("📋 Colección 'roles' encontrada")
      const roles = await mongoose.connection.db.collection('roles').find({}).toArray()
      console.log('Roles en la base de datos:')
      roles.forEach((role) => {
        console.log(`  - ID: ${role._id}, Nombre: ${role.name}`)
      })
    } else {
      console.log("❌ No se encontró colección 'roles'")
    }

    // Verificar usuarios y sus roles
    console.log('\n👥 Usuarios y sus roles:')
    const users = await mongoose.connection.db.collection('users').find({}).toArray()
    users.forEach((user) => {
      console.log(`  - Usuario: ${user.username} (${user.email})`)
      console.log(`    Roles: ${JSON.stringify(user.roles)}`)
    })
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Desconectado de MongoDB')
  }
}

// Ejecutar el script
checkRoles()
