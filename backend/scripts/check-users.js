'use strict'

import mongoose from 'mongoose'
import User from '../src/core/models/user.model.js'
import Role from '../src/core/models/role.model.js'
import bcrypt from 'bcryptjs'

// Configuración de la base de datos
const DB_URL = 'mongodb://gcadin:gcadin1230@146.83.198.35:1232/admin'

async function checkUsers () {
  try {
    console.log('🔌 Conectando a la base de datos...')
    await mongoose.connect(DB_URL)
    console.log('✅ Conectado a la base de datos')

    console.log('\n📋 Verificando usuarios en la base de datos:')
    const users = await User.find({}).populate('roles')

    if (users.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos')
    } else {
      console.log(`✅ Se encontraron ${users.length} usuarios:`)

      for (const user of users) {
        console.log(`\n👤 Usuario: ${user.username}`)
        console.log(`   📧 Email: ${user.email}`)
        console.log(`   🆔 RUT: ${user.rut}`)
        console.log(`   🔑 Password hash: ${user.password.substring(0, 20)}...`)
        console.log(`   👥 Roles: ${user.roles.map(r => r.name).join(', ')}`)

        // Verificar contraseñas conocidas
        const passwords = ['admin123', 'profesor123', '123456', 'password', 'user123', 'user', 'profesor']
        let foundPassword = false
        for (const pwd of passwords) {
          const isMatch = await bcrypt.compare(pwd, user.password)
          if (isMatch) {
            console.log(`   ✅ Contraseña correcta: ${pwd}`)
            foundPassword = true
            break
          }
        }
        if (!foundPassword) {
          console.log('   ❌ Contraseña no encontrada entre las probadas')
        }
      }
    }

    console.log('\n📋 Verificando roles en la base de datos:')
    const roles = await Role.find({})

    if (roles.length === 0) {
      console.log('❌ No se encontraron roles en la base de datos')
    } else {
      console.log(`✅ Se encontraron ${roles.length} roles:`)
      roles.forEach(role => {
        console.log(`   🏷️ ${role.name} (ID: ${role._id})`)
      })
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 Desconectado de la base de datos')
  }
}

checkUsers()
