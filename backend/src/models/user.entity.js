import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: String,
  email: { type: String, unique: true },
  password: String,
  rol: { type: String, enum: ['asistente', 'profesor'], required: true }
});

export default mongoose.model('User', userSchema);
