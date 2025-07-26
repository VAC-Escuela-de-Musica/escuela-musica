'use strict'

import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import AlumnoService from '../services/alumno.service.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Obtiene todos los alumnos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getAlumnos (req, res) {
  try {
    const [alumnos, errorAlumnos] = await AlumnoService.getAlumnos()
    if (errorAlumnos) return respondError(req, res, 404, errorAlumnos)

    alumnos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, alumnos)
  } catch (error) {
    handleError(error, 'alumno.controller -> getAlumnos')
    respondError(req, res, 400, error.message)
  }
}

/**
 * Crea un nuevo alumno
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createAlumno (req, res) {
  try {
    const { body } = req
    const [newAlumno, alumnoError] = await AlumnoService.createAlumno(body)

    if (alumnoError) return respondError(req, res, 400, alumnoError)
    if (!newAlumno) {
      return respondError(req, res, 400, 'No se pudo crear el alumno')
    }

    respondSuccess(req, res, 201, newAlumno)
  } catch (error) {
    handleError(error, 'alumno.controller -> createAlumno')
    respondError(req, res, 500, 'Error al crear el alumno')
  }
}

/**
 * Obtiene un alumno por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getAlumnoById (req, res) {
  try {
    const { params } = req
    const [alumno, errorAlumno] = await AlumnoService.getAlumnoById(params.id)

    if (errorAlumno) return respondError(req, res, 404, errorAlumno)

    respondSuccess(req, res, 200, alumno)
  } catch (error) {
    handleError(error, 'alumno.controller -> getAlumnoById')
    respondError(req, res, 500, 'Error al obtener el alumno')
  }
}

/**
 * Actualiza un alumno por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function updateAlumno (req, res) {
  try {
    const { params, body } = req
    const [alumno, alumnoError] = await AlumnoService.updateAlumno(params.id, body)

    if (alumnoError) return respondError(req, res, 400, alumnoError)

    respondSuccess(req, res, 200, alumno)
  } catch (error) {
    handleError(error, 'alumno.controller -> updateAlumno')
    respondError(req, res, 500, 'Error al actualizar el alumno')
  }
}

/**
 * Elimina un alumno por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function deleteAlumno (req, res) {
  try {
    const { params } = req
    const [alumno, alumnoError] = await AlumnoService.deleteAlumno(params.id)

    if (alumnoError) return respondError(req, res, 400, alumnoError)
    !alumno
      ? respondError(req, res, 404, 'El alumno no existe')
      : respondSuccess(req, res, 200, alumno)
  } catch (error) {
    handleError(error, 'alumno.controller -> deleteAlumno')
    respondError(req, res, 500, 'Error al eliminar el alumno')
  }
}

export default {
  getAlumnos,
  createAlumno,
  getAlumnoById,
  updateAlumno,
  deleteAlumno
}
