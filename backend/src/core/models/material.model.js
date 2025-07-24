import { Schema, model } from 'mongoose'

const materialSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  // Cambio: Almacenar nombre del archivo en lugar de URL completa
  filename: { type: String, required: true }, // Solo el nombre del archivo en MinIO
  usuario: { type: String, required: true }, // email o id del usuario que subió
  fechaSubida: { type: Date, default: Date.now },
  tamaño: { type: Number }, // Tamaño en bytes
  tipoContenido: { type: String }, // MIME type
  nombreArchivo: { type: String }, // Nombre original del archivo
  // Nuevos campos para URLs prefirmadas
  bucketTipo: { type: String, enum: ['publico', 'privado'], default: 'privado' },
  expiracionCache: { type: Date }, // Para cache de URLs temporales
  accesos: [{ // Auditoria de accesos
    usuario: String,
    fecha: { type: Date, default: Date.now },
    ip: String
  }]
})

const Material = model('Material', materialSchema)

export default Material
