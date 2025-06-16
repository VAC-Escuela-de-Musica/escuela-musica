import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  receptorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receptorTipo: { type: String, enum: ['User', 'Estudiante'], required: true },

  contenido: String,
  enviadoPorCorreo: { type: Boolean, default: false },
  enviadoPorWhatsapp: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model('mensaje', mensajeSchema);