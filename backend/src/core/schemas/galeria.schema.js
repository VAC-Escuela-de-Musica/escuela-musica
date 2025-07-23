import { Schema } from "mongoose";

const galeriaSchema = new Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede superar los 100 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede superar los 500 caracteres"],
    },
    imagen: {
      type: String,
      required: [true, "La URL de la imagen es obligatoria"],
      trim: true,
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: ["eventos", "instalaciones", "actividades", "profesores", "estudiantes", "otros"],
      default: "otros",
    },
    tags: {
      type: [String],
      default: [],
    },
    activo: {
      type: Boolean,
      default: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
    cols: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    rows: {
      type: Number,
      default: 1,
      min: 1,
      max: 4,
    },
    usuario: {
      type: String,
      required: [true, "El usuario que subió la imagen es obligatorio"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices para optimizar consultas
galeriaSchema.index({ categoria: 1 });
galeriaSchema.index({ activo: 1 });
galeriaSchema.index({ orden: 1 });
galeriaSchema.index({ createdAt: -1 });

export default galeriaSchema;