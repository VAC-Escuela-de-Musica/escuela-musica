'use strict'
// Importa el modelo de datos 'User'
import User from '../models/user.model.js'
// Importa el modelo de datos 'Role'
import Role from '../models/role.model.js'

/**
 * Crea los roles por defecto en la base de datos.
 * @async
 * @function createRoles
 * @returns {Promise<void>}
 */
async function createRoles () {
  try {
    // Busca todos los roles en la base de datos
    const count = await Role.estimatedDocumentCount()
    // Si no hay roles en la base de datos los crea
    if (count > 0) return

    await Promise.all([
      new Role({ name: 'administrador' }).save(),
      new Role({ name: 'profesor' }).save()
    ])
    console.log('* => Roles creados exitosamente')
  } catch (error) {
    console.error(error)
  }
}

/**
 * Crea los usuarios por defecto en la base de datos.
 * @async
 * @function createUsers
 * @returns {Promise<void>}
 */
async function createUsers () {
  try {
    const count = await User.estimatedDocumentCount()
    if (count > 0) return

    const admin = await Role.findOne({ name: 'administrador' })
    const profesor = await Role.findOne({ name: 'profesor' })

    await Promise.all([
      new User({
        username: 'administrador',
        email: 'administrador@email.com',
        rut: '12345678-0',
        password: await User.encryptPassword('admin123'),
        roles: [admin._id]
      }).save(),
      new User({
        username: 'profesor',
        email: 'profesor@email.com',
        rut: '87654321-0',
        password: await User.encryptPassword('profesor123'),
        roles: [profesor._id]
      }).save()
    ])
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
}

export { createRoles, createUsers }
