import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  emisor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'El emisor es requerido']
  },
  receptor: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'receptorTipo',
    required: [true, 'El receptor es requerido']
  },
  receptorTipo: { 
    type: String, 
    enum: {
      values: ['User', 'Student'],
      message: 'El tipo de receptor debe ser User o Student'
    },
    required: [true, 'El tipo de receptor es requerido']
  },
  contenido: {
    type: String,
    required: [true, 'El contenido es requerido'],
    minlength: [1, 'El contenido no puede estar vacío'],
    maxlength: [1000, 'El contenido no puede exceder 1000 caracteres'],
    trim: true
  },
  enviadoPorCorreo: { 
    type: Boolean, 
    default: false 
  },
  enviadoPorWhatsapp: { 
    type: Boolean, 
    default: false 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  leido: {
    type: Boolean,
    default: false
  },
  fechaLectura: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
mensajeSchema.index({ emisor: 1 });
mensajeSchema.index({ receptor: 1, receptorTipo: 1 });
mensajeSchema.index({ fecha: -1 });
mensajeSchema.index({ leido: 1 });

// Middleware para actualizar fechaLectura cuando se marca como leído
mensajeSchema.pre('save', function(next) {
  if (this.isModified('leido') && this.leido && !this.fechaLectura) {
    this.fechaLectura = new Date();
  }
  next();
});

export default mongoose.model('Message', mensajeSchema);