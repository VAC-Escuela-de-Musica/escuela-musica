'use strict'
import { model } from 'mongoose'
import alumnoSchema from '../schemas/alumnos.schema.js'
import bcrypt from 'bcryptjs'

// Métodos para hashear y comparar contraseñas
alumnoSchema.statics.encryptPassword = async function(password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

alumnoSchema.statics.comparePassword = async function(password, receivedPassword) {
  return await bcrypt.compare(password, receivedPassword)
}

// Exportar el modelo de datos 'Alumno'
export default model('Alumno', alumnoSchema)
