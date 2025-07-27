'use strict'

import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'
// import Role from "../../../core/models/role.model.js";
import ROLES from '../../../core/constants/roles.constants.js'

/**
 * Devuelve los roles predefinidos
 */
async function getRoles (req, res) {
  try {
    respondSuccess(req, res, 200, ROLES)
  } catch (error) {
    console.error('[ROLES] Error getting roles:', error)
    handleError(error, 'role.controller -> getRoles')
    respondError(req, res, 500, 'Error al obtener roles')
  }
}

/**
 * Obtiene un rol por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getRoleById (req, res) {
  try {
    const { id } = req.params
    const role = await Role.findById(id)

    if (!role) {
      return respondError(req, res, 404, 'Rol no encontrado')
    }

    respondSuccess(req, res, 200, { data: role })
  } catch (error) {
    handleError(error, 'role.controller -> getRoleById')
    respondError(req, res, 500, 'Error al obtener el rol')
  }
}

/**
 * Crea un nuevo rol
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createRole (req, res) {
  try {
    const { name } = req.body
    if (!name) return respondError(req, res, 400, 'El nombre es obligatorio')

    // Verifica si ya existe un rol con ese nombre
    const exists = await Role.findOne({ name })
    if (exists) return respondError(req, res, 400, 'El rol ya existe')

    const newRole = await Role.create({ name })
    respondSuccess(req, res, 201, { data: newRole })
  } catch (error) {
    handleError(error, 'role.controller -> createRole')
    respondError(req, res, 500, 'Error al crear el rol')
  }
}

export default {
  getRoles,
  getRoleById,
  createRole
}
