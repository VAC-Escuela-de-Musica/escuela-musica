"use strict";

import { respondSuccess, respondError } from "../../../core/utils/resHandler.js";
import testimonioService from "../services/testimonio.service.js";
import { handleError } from "../../../core/utils/errorHandler.js";

/**
 * Obtiene todos los testimonios activos (para el frontend)
 */
async function getActiveTestimonios(req, res) {
  try {
    const [testimonios, errorTestimonios] = await testimonioService.getActiveTestimonios();
    if (errorTestimonios) return respondError(req, res, 404, errorTestimonios);

    testimonios.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, testimonios);
  } catch (error) {
    handleError(error, "testimonio.controller -> getActiveTestimonios");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Obtiene todos los testimonios (para administración)
 */
async function getAllTestimonios(req, res) {
  try {
    const [testimonios, errorTestimonios] = await testimonioService.getAllTestimonios();
    if (errorTestimonios) return respondError(req, res, 404, errorTestimonios);

    testimonios.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, testimonios);
  } catch (error) {
    handleError(error, "testimonio.controller -> getAllTestimonios");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Obtiene un testimonio por ID
 */
async function getTestimonioById(req, res) {
  try {
    const { params } = req;
    const [testimonio, errorTestimonio] = await testimonioService.getTestimonioById(params.id);

    if (errorTestimonio) return respondError(req, res, 404, errorTestimonio);

    respondSuccess(req, res, 200, testimonio);
  } catch (error) {
    handleError(error, "testimonio.controller -> getTestimonioById");
    respondError(req, res, 500, "Error al obtener el testimonio");
  }
}

/**
 * Crea un nuevo testimonio
 */
async function createTestimonio(req, res) {
  try {
    const { body } = req;
    const [newTestimonio, testimonioError] = await testimonioService.createTestimonio(body);

    if (testimonioError) return respondError(req, res, 400, testimonioError);
    if (!newTestimonio) {
      return respondError(req, res, 400, "No se pudo crear el testimonio");
    }

    respondSuccess(req, res, 201, newTestimonio);
  } catch (error) {
    handleError(error, "testimonio.controller -> createTestimonio");
    respondError(req, res, 500, "Error al crear el testimonio");
  }
}

export default {
  getActiveTestimonios,
  getAllTestimonios,
  getTestimonioById,
  createTestimonio,
}; 