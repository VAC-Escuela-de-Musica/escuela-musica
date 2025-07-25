"use strict";

import mongoose from "mongoose";

const galeriaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, "El título no puede tener más de 100 caracteres"],
    default: "",
  },
  descripcion: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, "La descripción no puede tener más de 500 caracteres"],
  },
  imagen: {
    type: String,
    required: [true, "La URL de la imagen es requerida"],
    trim: true,
  },
  bucket: {
    type: String,
    required: false,
    default: "imagenes-publicas",
  },
  bucketTipo: {
    type: String,
    enum: ["publico", "privado"],
    default: "publico",
  },
  orden: {
    type: Number,
    default: 0,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  usuario: {
    type: String,
    required: [true, "El usuario es requerido"],
  },
  categoria: {
    type: String,
    enum: ["eventos", "instalaciones", "actividades", "profesores", "estudiantes", "otros"],
    default: "otros",
  },
  tags: [{
    type: String,
    trim: true,
  }],
  fechaCreacion: {
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
galeriaSchema.index({ activo: 1, orden: 1 });
galeriaSchema.index({ categoria: 1, activo: 1 });
galeriaSchema.index({ usuario: 1 });
galeriaSchema.index({ bucketTipo: 1 });

// Middleware para actualizar fechaActualizacion
galeriaSchema.pre("save", function(next) {
  this.fechaActualizacion = new Date();
  next();
});

// Método estático para obtener galería activa
galeriaSchema.statics.getActiveGallery = function() {
  return this.find({ activo: true })
    .sort({ orden: 1, fechaCreacion: -1 })
    .select("titulo descripcion imagen categoria tags fechaCreacion");
};

// Método estático para obtener galería por categoría
galeriaSchema.statics.getGalleryByCategory = function(categoria) {
  return this.find({ activo: true, categoria })
    .sort({ orden: 1, fechaCreacion: -1 })
    .select("titulo descripcion imagen categoria tags fechaCreacion");
};

export default mongoose.model("Galeria", galeriaSchema); 