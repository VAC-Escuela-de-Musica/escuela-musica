"use strict";

import Mensaje from "../models/mensaje.model.js";
import { handleError } from "../../../utils/errorHandler.js";

/**
 * Obtiene todos los mensajes
 * @returns {Promise} Promesa con el objeto de mensajes
 */
async function getMensajes() {
  try {
    const mensajes = await Mensaje.find()
      .populate("emisor")
      .lean();

    if (!mensajes) return [null, "No hay mensajes registrados"];

    return [mensajes, null];
  } catch (error) {
    handleError(error, "mensaje.service -> getMensajes");
    return [null, "Error al obtener los mensajes"];
  }
}

/**
 * Crea un nuevo mensaje
 * @param {Object} mensaje Objeto de mensaje
 * @returns {Promise} Promesa con el objeto de mensaje creado
 */
async function createMensaje(mensaje) {
  try {
    const newMensaje = new Mensaje(mensaje);
    await newMensaje.save();

    return [newMensaje, null];
  } catch (error) {
    handleError(error, "mensaje.service -> createMensaje");
    return [null, "Error al crear el mensaje"];
  }
}

/**
 * Obtiene un mensaje por su id
 * @param {string} id Id del mensaje
 * @returns {Promise} Promesa con el objeto de mensaje
 */
async function getMensajeById(id) {
  try {
    const mensaje = await Mensaje.findById(id)
      .populate("emisor")
      .lean();

    if (!mensaje) return [null, "El mensaje no existe"];

    return [mensaje, null];
  } catch (error) {
    handleError(error, "mensaje.service -> getMensajeById");
    return [null, "Error al obtener el mensaje"];
  }
}

export default {
  getMensajes,
  createMensaje,
  getMensajeById,
}; 