import mongoose from 'mongoose';

const claseSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Solo "profesor"
  sala: String,
  horarios: [
    {
      dia: String,
      horaInicio: String,
      horaFin: String
    }
  ],
  materiales: [
    {
      tipo: { type: String, enum: ['video', 'audio', 'pdf', 'imagen'] },
      url: String,
      descripcion: String
    }
  ],
  visible: { type: Boolean, default: true }
});


export default mongoose.model('Clase', claseSchema);
