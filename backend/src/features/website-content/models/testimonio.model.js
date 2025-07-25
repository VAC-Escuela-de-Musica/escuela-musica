"use strict";
import { Schema, model } from "mongoose";

const testimonioSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
    minlength: [2, "El nombre debe tener al menos 2 caracteres"],
    maxlength: [50, "El nombre no puede exceder 50 caracteres"],
  },
  cargo: {
    type: String,
    required: [true, "El cargo es requerido"],
    trim: true,
    minlength: [2, "El cargo debe tener al menos 2 caracteres"],
    maxlength: [100, "El cargo no puede exceder 100 caracteres"],
  },
  opinion: {
    type: String,
    required: [true, "La opinión es requerida"],
    trim: true,
    minlength: [10, "La opinión debe tener al menos 10 caracteres"],
    maxlength: [500, "La opinión no puede exceder 500 caracteres"],
  },
  foto: {
    type: String,
    required: [true, "La foto es requerida"],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: "La foto debe ser una URL válida",
    },
  },
  estrellas: {
    type: Number,
    required: [true, "Las estrellas son requeridas"],
    min: [1, "Las estrellas deben ser al menos 1"],
    max: [5, "Las estrellas no pueden exceder 5"],
    default: 5,
  },
  institucion: {
    type: String,
    trim: true,
    maxlength: [100, "La institución no puede exceder 100 caracteres"],
  },
  activo: {
    type: Boolean,
    default: true,
  },
  orden: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  versionKey: false,
});

export default model("Testimonio", testimonioSchema); 