"use strict";

import { respondSuccess, respondError } from "../../../core/utils/resHandler.js";
import mensajeService from "../services/mensaje.service.js";
import { handleError } from "../../../core/utils/errorHandler.js";

/**
 * Obtiene todos los mensajes
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getMensajes(req, res) {
  try {
    const [mensajes, errorMensajes] = await mensajeService.getMensajes();
    if (errorMensajes) return respondError(req, res, 404, errorMensajes);

    mensajes.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, mensajes);
  } catch (error) {
    handleError(error, "mensaje.controller -> getMensajes");
    respondError(req, res, 400, error.message);
  }
}

/**
 * Crea un nuevo mensaje
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createMensaje(req, res) {
  try {
    const { body } = req;
    const [newMensaje, mensajeError] = await mensajeService.createMensaje(body);

    if (mensajeError) return respondError(req, res, 400, mensajeError);
    if (!newMensaje) {
      return respondError(req, res, 400, "No se pudo crear el mensaje");
    }

    respondSuccess(req, res, 201, newMensaje);
  } catch (error) {
    handleError(error, "mensaje.controller -> createMensaje");
    respondError(req, res, 500, "Error al crear el mensaje");
  }
}

/**
 * Obtiene un mensaje por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getMensajeById(req, res) {
  try {
    const { params } = req;
    const [mensaje, errorMensaje] = await mensajeService.getMensajeById(params.id);

    if (errorMensaje) return respondError(req, res, 404, errorMensaje);

    respondSuccess(req, res, 200, mensaje);
  } catch (error) {
    handleError(error, "mensaje.controller -> getMensajeById");
    respondError(req, res, 500, "Error al obtener el mensaje");
  }
}

export default {
  getMensajes,
  createMensaje,
  getMensajeById,
}; 