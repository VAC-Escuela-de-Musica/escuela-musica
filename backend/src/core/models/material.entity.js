'use strict'

import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['imagen', 'audio', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  descripcion: String,
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

export default mongoose.model('Material', materialSchema)
