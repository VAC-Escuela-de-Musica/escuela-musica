'use strict'

import mongoose from 'mongoose'

const cardsProfesoresSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [25, 'El nombre no puede exceder 25 caracteres']
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad es requerida'],
    trim: true,
    minlength: [2, 'La especialidad debe tener al menos 2 caracteres'],
    maxlength: [50, 'La especialidad no puede exceder 50 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  imagen: {
    type: String,
    required: [true, 'La imagen es requerida'],
    trim: true,
    validate: {
      validator: function (v) {
        return /^https?:\/\/.+/.test(v)
      },
      message: 'La imagen debe ser una URL válida'
    }
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
})

export default mongoose.model('CardsProfesores', cardsProfesoresSchema)
