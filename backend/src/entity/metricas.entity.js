import mongoose from 'mongoose';

const metricaSchema = new mongoose.Schema({
  nombre: String, 
  valor: Number,
  clase: { type: mongoose.Schema.Types.ObjectId, ref: 'Clase' },
  fecha: { type: Date, default: Date.now },
  generadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
export default mongoose.model('Metrica', metricaSchema);