'use strict'
import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const profesoresSchema = new Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede superar los 50 caracteres'],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
      'El nombre solo puede contener letras y espacios'
    ]
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true,
    minlength: [2, 'Los apellidos deben tener al menos 2 caracteres'],
    maxlength: [100, 'Los apellidos no pueden superar los 100 caracteres'],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
      'Los apellidos solo pueden contener letras y espacios'
    ]
  },
  rut: {
    type: String,
    required: [true, 'El RUT es obligatorio'],
    unique: true,
    trim: true,
    match: [
      /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
      'El RUT debe tener el formato 12.345.678-9'
    ]
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'El email no es válido'
    ]
  },
  numero: {
    type: String,
    required: [true, 'El número de teléfono es obligatorio'],
    trim: true,
    match: [
      /^\+?\d{9,15}$/,
      'El teléfono debe contener solo números y puede iniciar con +'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No devolver por defecto
  },
  sueldo: {
    type: Number,
    required: [true, 'El sueldo es obligatorio'],
    min: [0, 'El sueldo no puede ser negativo']
  },
  fechaContrato: {
    type: Date,
    required: [true, 'La fecha de contrato es obligatoria'],
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  roles: {
    type: [String],
    default: ['profesor'],
    enum: ['profesor']
  }
}, {
  timestamps: true,
  versionKey: false
})

// Métodos para hashear y comparar contraseñas
profesoresSchema.statics.encryptPassword = async function (password) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

profesoresSchema.statics.comparePassword = async function (password, receivedPassword) {
  return await bcrypt.compare(password, receivedPassword)
}

// Método para obtener el nombre completo
profesoresSchema.virtual('nombreCompleto').get(function () {
  return `${this.nombre} ${this.apellidos}`
})

// Configurar virtuals para que se incluyan en JSON
profesoresSchema.set('toJSON', { virtuals: true })

export default model('Profesor', profesoresSchema) 