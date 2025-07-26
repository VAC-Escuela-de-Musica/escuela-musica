'use strict'

import mongoose from 'mongoose'

const archivoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['imagen', 'audio', 'video'],
    required: [true, 'El tipo de archivo es requerido']
  },
  url: {
    type: String,
    required: [true, 'La URL del archivo es requerida'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  clase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clase'
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
})

export default mongoose.model('Archivo', archivoSchema)
