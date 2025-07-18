import mongoose from 'mongoose';

const claseSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es requerido'],
    minlength: [3, 'El título debe tener al menos 3 caracteres'],
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    trim: true
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    trim: true
  },
  profesor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'El profesor es requerido']
  },
  sala: {
    type: String,
    required: [true, 'La sala es requerida'],
    maxlength: [50, 'El nombre de la sala no puede exceder 50 caracteres'],
    trim: true
  },
  horarios: [{
    dia: {
      type: String,
      required: [true, 'El día es requerido'],
      enum: {
        values: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        message: 'El día debe ser un día válido de la semana'
      }
    },
    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM']
    },
    horaFin: {
      type: String,
      required: [true, 'La hora de fin es requerida'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'La hora debe estar en formato HH:MM']
    }
  }],
  materiales: [{
    tipo: { 
      type: String, 
      enum: {
        values: ['video', 'audio', 'pdf', 'imagen'],
        message: 'El tipo debe ser: video, audio, pdf o imagen'
      },
      required: [true, 'El tipo de material es requerido']
    },
    url: {
      type: String,
      required: [true, 'La URL del material es requerida']
    },
    descripcion: {
      type: String,
      maxlength: [200, 'La descripción del material no puede exceder 200 caracteres'],
      trim: true
    }
  }],
  visible: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  versionKey: false
});

// Validación personalizada para horarios
claseSchema.pre('save', function(next) {
  for (let horario of this.horarios) {
    const inicio = new Date(`1970-01-01T${horario.horaInicio}:00`);
    const fin = new Date(`1970-01-01T${horario.horaFin}:00`);
    
    if (inicio >= fin) {
      return next(new Error('La hora de inicio debe ser anterior a la hora de fin'));
    }
  }
  next();
});

export default mongoose.model('Class', claseSchema);
