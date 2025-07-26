'use strict'

import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import ArchivoService from '../services/archivo.service.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Obtiene todos los archivos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getArchivos (req, res) {
  try {
    const [archivos, errorArchivos] = await ArchivoService.getArchivos()
    if (errorArchivos) return respondError(req, res, 404, errorArchivos)

    archivos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, archivos)
  } catch (error) {
    handleError(error, 'archivo.controller -> getArchivos')
    respondError(req, res, 400, error.message)
  }
}

/**
 * Crea un nuevo archivo
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createArchivo (req, res) {
  try {
    const { body } = req
    const [newArchivo, archivoError] = await ArchivoService.createArchivo(body)

    if (archivoError) return respondError(req, res, 400, archivoError)
    if (!newArchivo) {
      return respondError(req, res, 400, 'No se pudo crear el archivo')
    }

    respondSuccess(req, res, 201, newArchivo)
  } catch (error) {
    handleError(error, 'archivo.controller -> createArchivo')
    respondError(req, res, 500, 'Error al crear el archivo')
  }
}

/**
 * Obtiene un archivo por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getArchivoById (req, res) {
  try {
    const { params } = req
    const [archivo, errorArchivo] = await ArchivoService.getArchivoById(params.id)

    if (errorArchivo) return respondError(req, res, 404, errorArchivo)

    respondSuccess(req, res, 200, archivo)
  } catch (error) {
    handleError(error, 'archivo.controller -> getArchivoById')
    respondError(req, res, 500, 'Error al obtener el archivo')
  }
}

/**
 * Actualiza un archivo por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function updateArchivo (req, res) {
  try {
    const { params, body } = req
    const [archivo, archivoError] = await ArchivoService.updateArchivo(params.id, body)

    if (archivoError) return respondError(req, res, 400, archivoError)

    respondSuccess(req, res, 200, archivo)
  } catch (error) {
    handleError(error, 'archivo.controller -> updateArchivo')
    respondError(req, res, 500, 'Error al actualizar el archivo')
  }
}

/**
 * Elimina un archivo por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function deleteArchivo (req, res) {
  try {
    const { params } = req
    const [archivo, archivoError] = await ArchivoService.deleteArchivo(params.id)

    if (archivoError) return respondError(req, res, 400, archivoError)
    !archivo
      ? respondError(req, res, 404, 'El archivo no existe')
      : respondSuccess(req, res, 200, archivo)
  } catch (error) {
    handleError(error, 'archivo.controller -> deleteArchivo')
    respondError(req, res, 500, 'Error al eliminar el archivo')
  }
}

export default {
  getArchivos,
  createArchivo,
  getArchivoById,
  updateArchivo,
  deleteArchivo
}
