'use strict'

import mongoose from 'mongoose'

const alumnoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  clasesInscritas: [
    {
      clase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clase',
        required: true
      },
      fechaInscripcion: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true,
  versionKey: false
})

export default mongoose.model('Alumno', alumnoSchema)
