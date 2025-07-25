"use strict";

import CardsProfesores from "../../../core/models/cardsProfesores.entity.js";
import { handleError } from "../../../core/utils/errorHandler.js";

/**
 * Obtiene todas las cards de profesores
 * @returns {Promise} Promesa con el objeto de cards
 */
async function getCardsProfesores() {
  try {
    console.log("🔍 getCardsProfesores service called");
    const cards = await CardsProfesores.find({ activo: true })
      .sort({ orden: 1 })
      .lean();

    console.log("🗃️ Database query result:", cards?.length || 0, "cards");
    if (!cards) return [null, "No hay cards de profesores registradas"];

    return [cards, null];
  } catch (error) {
    handleError(error, "cardsProfesores.service -> getCardsProfesores");
    return [null, "Error al obtener las cards de profesores"];
  }
}

/**
 * Crea una nueva card de profesor
 * @param {Object} cardData Objeto de card
 * @returns {Promise} Promesa con el objeto de card creado
 */
async function createCardProfesor(cardData) {
  try {
    const newCard = new CardsProfesores(cardData);
    await newCard.save();

    return [newCard, null];
  } catch (error) {
    handleError(error, "cardsProfesores.service -> createCardProfesor");
    return [null, "Error al crear la card del profesor"];
  }
}

/**
 * Obtiene una card de profesor por su id
 * @param {string} id Id de la card
 * @returns {Promise} Promesa con el objeto de card
 */
async function getCardProfesorById(id) {
  try {
    const card = await CardsProfesores.findById(id).lean();

    if (!card) return [null, "La card del profesor no existe"];

    return [card, null];
  } catch (error) {
    handleError(error, "cardsProfesores.service -> getCardProfesorById");
    return [null, "Error al obtener la card del profesor"];
  }
}

/**
 * Actualiza una card de profesor por su id
 * @param {string} id Id de la card
 * @param {Object} cardData Objeto de card
 * @returns {Promise} Promesa con el objeto de card actualizado
 */
async function updateCardProfesor(id, cardData) {
  try {
    const cardFound = await CardsProfesores.findById(id);
    if (!cardFound) return [null, "La card del profesor no existe"];

    const cardUpdated = await CardsProfesores.findByIdAndUpdate(
      id,
      cardData,
      { new: true },
    );

    return [cardUpdated, null];
  } catch (error) {
    handleError(error, "cardsProfesores.service -> updateCardProfesor");
    return [null, "Error al actualizar la card del profesor"];
  }
}

/**
 * Elimina una card de profesor por su id
 * @param {string} id Id de la card
 * @returns {Promise} Promesa con el objeto de card eliminado
 */
async function deleteCardProfesor(id) {
  try {
    const cardFound = await CardsProfesores.findById(id);
    if (!cardFound) return [null, "La card del profesor no existe"];

    const cardDeleted = await CardsProfesores.findByIdAndDelete(id);
    return [cardDeleted, null];
  } catch (error) {
    handleError(error, "cardsProfesores.service -> deleteCardProfesor");
    return [null, "Error al eliminar la card del profesor"];
  }
}

export default {
  getCardsProfesores,
  createCardProfesor,
  getCardProfesorById,
  updateCardProfesor,
  deleteCardProfesor,
}; 