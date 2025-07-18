import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    minlength: [3, 'El título debe tener al menos 3 caracteres'],
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    trim: true
  },
  descripcion: {
    type: String,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    trim: true
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es requerida'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'La fecha del evento debe ser futura'
    }
  },
  lugar: {
    type: String,
    required: [true, 'El lugar es requerido'],
    maxlength: [200, 'El lugar no puede exceder 200 caracteres'],
    trim: true
  },
  creadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'El creador es requerido']
  },
  visible: { 
    type: Boolean, 
    default: true 
  },
  registrados: [{
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
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'El email debe tener un formato válido'],
      trim: true
    },
    fechaRegistro: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Índices para optimizar consultas
eventoSchema.index({ fecha: 1 });
eventoSchema.index({ creadoPor: 1 });
eventoSchema.index({ visible: 1 });

export default mongoose.model('Event', eventoSchema);
