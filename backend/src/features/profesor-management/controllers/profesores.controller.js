'use strict'
import {
  respondSuccess,
  respondError,
  respondInternalError
} from '../../../core/utils/responseHandler.util.js'
import ProfesoresService from '../services/profesores.service.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

// Controlador para obtener todos los profesores
async function getAllProfesores (req, res) {
  console.log('[GET] /api/profesores - Obtener todos los profesores')
  try {
    const [profesores, errorProfesores] = await ProfesoresService.getAllProfesores()
    console.log('[GET] /api/profesores - Resultado consulta:', profesores)
    if (profesores) {
      console.log(`[GET] /api/profesores - Cantidad de profesores recuperados: ${profesores.length}`)
    }
    if (errorProfesores) return respondError(req, res, 404, errorProfesores)
    profesores.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, profesores)
  } catch (error) {
    console.error('[GET] /api/profesores - Error:', error)
    handleError(error, 'profesores.controller -> getAllProfesores')
    respondError(req, res, 400, error.message)
  }
}

// Controlador para crear un nuevo profesor
async function createProfesores (req, res) {
  console.log('[POST] /api/profesores - Crear profesor', req.body)
  try {
    const { body } = req
    const [profesor, errorProfesor] = await ProfesoresService.createProfesores(body)

    if (errorProfesor) {
      return respondError(req, res, 400, errorProfesor)
    }
    if (!profesor) {
      return respondError(req, res, 404, 'No se pudo crear el profesor')
    }
    respondSuccess(req, res, 201, profesor)
  } catch (error) {
    handleError(error, 'profesores.controller -> createProfesores')
    respondError(req, res, 500, 'Error al crear el profesor')
  }
}

// Controlador para obtener un profesor por su ID
async function getProfesoresById (req, res) {
  console.log(`[GET] /api/profesores/${req.params.id} - Obtener profesor por ID`)
  try {
    const { params } = req
    const [profesor, errorProfesor] = await ProfesoresService.getProfesoresById(params.id)

    if (errorProfesor) return respondError(req, res, 404, errorProfesor)
    respondSuccess(req, res, 200, profesor)
  } catch (error) {
    handleError(error, 'profesores.controller -> getProfesoresById')
    respondError(req, res, 500, 'Error al obtener el profesor')
  }
}

// Controlador para actualizar un profesor por su ID
async function updateProfesores (req, res) {
  console.log('[PUT] /api/profesores/%s - Actualizar profesor', req.params.id, req.body)
  try {
    const { id } = req.params
    // Lista de campos permitidos según el esquema real
    const allowedFields = [
      'nombre',
      'apellidos',
      'rut',
      'email',
      'numero',
      'password',
      'sueldo',
      'fechaContrato',
      'activo'
    ]
    const updateData = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key]
        return obj
      }, {})
    const [profesor, error] = await ProfesoresService.updateProfesores(id, updateData)

    if (error) {
      return res.status(404).json({ message: error })
    }
    return res.status(200).json(profesor)
  } catch (error) {
    handleError(error, 'profesores.controller -> updateProfesores')
    return res.status(500).json({ message: 'Error al actualizar el profesor' })
  }
}

// Controlador para eliminar un profesor por su ID
async function deleteProfesores (req, res) {
  console.log(`[DELETE] /api/profesores/${req.params.id} - Eliminar profesor`)
  try {
    const { params } = req
    const [profesor, errorProfesor] = await ProfesoresService.deleteProfesores(params.id)

    if (errorProfesor) return respondError(req, res, 404, errorProfesor)
    respondSuccess(req, res, 200, { message: 'Profesor eliminado exitosamente', profesor })
  } catch (error) {
    handleError(error, 'profesores.controller -> deleteProfesores')
    respondError(req, res, 500, 'Error al eliminar el profesor')
  }
}

// Controlador para obtener un profesor por email
async function getProfesorByEmail (req, res) {
  console.log(`[GET] /api/profesores/email/${req.params.email} - Obtener profesor por email`)
  try {
    const { params } = req
    const [profesor, errorProfesor] = await ProfesoresService.getProfesorByEmail(params.email)

    if (errorProfesor) return respondError(req, res, 404, errorProfesor)
    respondSuccess(req, res, 200, profesor)
  } catch (error) {
    handleError(error, 'profesores.controller -> getProfesorByEmail')
    respondError(req, res, 500, 'Error al obtener el profesor por email')
  }
}

// Controlador para obtener profesores activos
async function getProfesoresActivos (req, res) {
  console.log('[GET] /api/profesores/activos - Obtener profesores activos')
  try {
    const [profesores, errorProfesores] = await ProfesoresService.getProfesoresActivos()
    if (errorProfesores) return respondError(req, res, 404, errorProfesores)
    profesores.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, profesores)
  } catch (error) {
    handleError(error, 'profesores.controller -> getProfesoresActivos')
    respondError(req, res, 500, 'Error al obtener profesores activos')
  }
}

// Controlador para cambiar el estado activo/inactivo de un profesor
async function toggleProfesorStatus (req, res) {
  console.log(`[PUT] /api/profesores/${req.params.id}/toggle-status - Cambiar estado del profesor`)
  try {
    const { params } = req
    const [profesor, errorProfesor] = await ProfesoresService.toggleProfesorStatus(params.id)

    if (errorProfesor) return respondError(req, res, 404, errorProfesor)
    respondSuccess(req, res, 200, { 
      message: `Profesor ${profesor.activo ? 'activado' : 'desactivado'} exitosamente`, 
      profesor 
    })
  } catch (error) {
    handleError(error, 'profesores.controller -> toggleProfesorStatus')
    respondError(req, res, 500, 'Error al cambiar el estado del profesor')
  }
}

// Exportar las funciones individualmente
export {
  getAllProfesores,
  createProfesores,
  getProfesoresById,
  updateProfesores,
  deleteProfesores,
  getProfesorByEmail,
  getProfesoresActivos,
  toggleProfesorStatus
}

// Exportar los controladores como default también
export default {
  getAllProfesores,
  createProfesores,
  getProfesoresById,
  updateProfesores,
  deleteProfesores,
  getProfesorByEmail,
  getProfesoresActivos,
  toggleProfesorStatus
} 