"use strict";

import Metrica from "../models/metrica.model.js";
import { handleError } from "../../../utils/errorHandler.js";

async function getMetricas() {
  try {
    const metricas = await Metrica.find()
      .populate("clase")
      .populate("generadoPor")
      .lean();

    if (!metricas) return [null, "No hay métricas registradas"];

    return [metricas, null];
  } catch (error) {
    handleError(error, "metrica.service -> getMetricas");
    return [null, "Error al obtener las métricas"];
  }
}

async function createMetrica(metrica) {
  try {
    const newMetrica = new Metrica(metrica);
    await newMetrica.save();

    return [newMetrica, null];
  } catch (error) {
    handleError(error, "metrica.service -> createMetrica");
    return [null, "Error al crear la métrica"];
  }
}

export default {
  getMetricas,
  createMetrica,
}; 