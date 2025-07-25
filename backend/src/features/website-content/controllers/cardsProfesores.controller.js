'use strict'

import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import cardsProfesoresService from '../services/cardsProfesores.service.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Obtiene todas las cards de profesores
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getCardsProfesores (req, res) {
  try {
    console.log('🎯 getCardsProfesores controller called')
    const [cards, errorCards] = await cardsProfesoresService.getCardsProfesores()
    if (errorCards) return respondError(req, res, 404, errorCards)

    console.log('📊 Cards found:', cards?.length || 0)
    cards.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, cards)
  } catch (error) {
    handleError(error, 'cardsProfesores.controller -> getCardsProfesores')
    respondError(req, res, 400, error.message)
  }
}

/**
 * Crea una nueva card de profesor
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createCardProfesor (req, res) {
  try {
    const { body } = req
    const [newCard, cardError] = await cardsProfesoresService.createCardProfesor(body)

    if (cardError) return respondError(req, res, 400, cardError)
    if (!newCard) {
      return respondError(req, res, 400, 'No se pudo crear la card del profesor')
    }

    respondSuccess(req, res, 201, newCard)
  } catch (error) {
    handleError(error, 'cardsProfesores.controller -> createCardProfesor')
    respondError(req, res, 500, 'Error al crear la card del profesor')
  }
}

/**
 * Obtiene una card de profesor por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getCardProfesorById (req, res) {
  try {
    const { params } = req
    const [card, errorCard] = await cardsProfesoresService.getCardProfesorById(params.id)

    if (errorCard) return respondError(req, res, 404, errorCard)

    respondSuccess(req, res, 200, card)
  } catch (error) {
    handleError(error, 'cardsProfesores.controller -> getCardProfesorById')
    respondError(req, res, 500, 'Error al obtener la card del profesor')
  }
}

/**
 * Actualiza una card de profesor por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function updateCardProfesor (req, res) {
  try {
    const { params, body } = req
    const [card, cardError] = await cardsProfesoresService.updateCardProfesor(params.id, body)

    if (cardError) return respondError(req, res, 400, cardError)

    respondSuccess(req, res, 200, card)
  } catch (error) {
    handleError(error, 'cardsProfesores.controller -> updateCardProfesor')
    respondError(req, res, 500, 'Error al actualizar la card del profesor')
  }
}

/**
 * Elimina una card de profesor por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function deleteCardProfesor (req, res) {
  try {
    const { params } = req
    const [card, cardError] = await cardsProfesoresService.deleteCardProfesor(params.id)

    if (cardError) return respondError(req, res, 400, cardError)
    !card
      ? respondError(req, res, 404, 'La card del profesor no existe')
      : respondSuccess(req, res, 200, card)
  } catch (error) {
    handleError(error, 'cardsProfesores.controller -> deleteCardProfesor')
    respondError(req, res, 500, 'Error al eliminar la card del profesor')
  }
}

export default {
  getCardsProfesores,
  createCardProfesor,
  getCardProfesorById,
  updateCardProfesor,
  deleteCardProfesor
}
