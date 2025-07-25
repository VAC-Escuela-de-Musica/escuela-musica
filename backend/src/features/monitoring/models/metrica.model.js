"use strict";

import mongoose from "mongoose";

const metricaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre de la métrica es requerido"],
    trim: true,
  },
  valor: {
    type: Number,
    required: [true, "El valor de la métrica es requerido"],
  },
  clase: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Clase",
    required: true,
  },
  fecha: { 
    type: Date, 
    default: Date.now,
  },
  generadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("Metrica", metricaSchema); 