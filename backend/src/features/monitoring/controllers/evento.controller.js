'use strict'

import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import eventoService from '../services/evento.service.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

async function getEventos (req, res) {
  try {
    const [eventos, errorEventos] = await eventoService.getEventos()
    if (errorEventos) return respondError(req, res, 404, errorEventos)

    eventos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, eventos)
  } catch (error) {
    handleError(error, 'evento.controller -> getEventos')
    respondError(req, res, 400, error.message)
  }
}

async function createEvento (req, res) {
  try {
    const { body } = req
    const [newEvento, eventoError] = await eventoService.createEvento(body)

    if (eventoError) return respondError(req, res, 400, eventoError)
    if (!newEvento) {
      return respondError(req, res, 400, 'No se pudo crear el evento')
    }

    respondSuccess(req, res, 201, newEvento)
  } catch (error) {
    handleError(error, 'evento.controller -> createEvento')
    respondError(req, res, 500, 'Error al crear el evento')
  }
}

export default {
  getEventos,
  createEvento
}
