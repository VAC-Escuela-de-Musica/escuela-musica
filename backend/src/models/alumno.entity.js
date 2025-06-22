import mongoose from 'mongoose';

const estudianteSchema = new mongoose.Schema({
  nombre: String,
  email: String,
  telefono: String,
  clasesInscritas: [
    {
      clase: { type: mongoose.Schema.Types.ObjectId, ref: 'Clase' },
      fechaInscripcion: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Estudiante', estudianteSchema);