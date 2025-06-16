import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  emisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receptor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contenido: String,
  fecha: { type: Date, default: Date.now }
});

export default mongoose.model('mensaje', mensajeSchema);