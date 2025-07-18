import mongoose from 'mongoose';

const archivoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['imagen', 'audio', 'video'], required: true },
  url: { type: String, required: true },
  descripcion: String,
  clase: { type: mongoose.Schema.Types.ObjectId, ref: 'Clase' },
  fechaSubida: { type: Date, default: Date.now }
});

export default mongoose.model('File', archivoSchema);
