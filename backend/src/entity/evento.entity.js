import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  fecha: Date,
  lugar: String,
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  visible: { type: Boolean, default: true },
  registrados: [
    {
      nombre: String,
      email: String
    }
  ]
});

export default mongoose.model('Evento', eventoSchema);
