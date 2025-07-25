"use strict";

import { respondSuccess, respondError } from "../../../utils/resHandler.js";
import metricaService from "../services/metrica.service.js";
import { handleError } from "../../../utils/errorHandler.js";

/**
 * Obtiene todas las métricas
 */
async function getMetricas(req, res) {
  try {
    const [metricas, errorMetricas] = await metricaService.getMetricas();
    if (errorMetricas) return respondError(req, res, 404, errorMetricas);

    metricas.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, metricas);
  } catch (error) {
    handleError(error, "metrica.controller -> getMetricas");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea una nueva métrica
 */
async function createMetrica(req, res) {
  try {
    const { body } = req;
    const [newMetrica, metricaError] = await metricaService.createMetrica(body);

    if (metricaError) return respondError(req, res, 400, metricaError);
    if (!newMetrica) {
      return respondError(req, res, 400, "No se pudo crear la métrica");
    }

    respondSuccess(req, res, 201, newMetrica);
  } catch (error) {
    handleError(error, "metrica.controller -> createMetrica");
    respondError(req, res, 500, "Error al crear la métrica");
  }
}

export default {
  getMetricas,
  createMetrica,
}; 