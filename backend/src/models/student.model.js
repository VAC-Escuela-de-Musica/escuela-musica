import mongoose from 'mongoose';

const estudianteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'El email debe tener un formato válido'],
    trim: true
  },
  telefono: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'El teléfono debe tener un formato válido'],
    trim: true
  },
  clasesInscritas: [{
    clase: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Class',
      required: [true, 'La clase es requerida']
    },
    fechaInscripcion: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
estudianteSchema.index({ email: 1 });
estudianteSchema.index({ 'clasesInscritas.clase': 1 });

export default mongoose.model('Student', estudianteSchema);