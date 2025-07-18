import mongoose from "mongoose";

const carouselImageSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
  },
  nombreArchivo: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  orden: {
    type: Number,
    default: 0,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  subidoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Índices para optimizar consultas
carouselImageSchema.index({ activo: 1, orden: 1 });
carouselImageSchema.index({ subidoPor: 1 });

export default mongoose.model("CarouselImage", carouselImageSchema);
