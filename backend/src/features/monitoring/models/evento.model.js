'use strict'

import mongoose from 'mongoose'

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título del evento es requerido'],
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del evento es requerida'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha del evento es requerida']
  },
  lugar: {
    type: String,
    required: [true, 'El lugar del evento es requerido'],
    trim: true
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  registrados: [{
    nombre: {
      type: String,
      required: [true, 'El nombre del registrado es requerido'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email del registrado es requerido'],
      trim: true
    }
  }]
}, {
  timestamps: true,
  versionKey: false
})

export default mongoose.model('Evento', eventoSchema)
