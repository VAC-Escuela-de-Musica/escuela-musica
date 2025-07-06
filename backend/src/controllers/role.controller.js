"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";
import Role from "../models/role.model.js";

/**
 * Obtiene todos los roles
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getRoles(req, res) {
  try {
    const roles = await Role.find();
    
    if (roles.length === 0) {
      return respondSuccess(req, res, 204);
    }
    
    respondSuccess(req, res, 200, { data: roles });
  } catch (error) {
    handleError(error, "role.controller -> getRoles");
    respondError(req, res, 500, "Error al obtener los roles");
  }
}

/**
 * Obtiene un rol por su id
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function getRoleById(req, res) {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    
    if (!role) {
      return respondError(req, res, 404, "Rol no encontrado");
    }
    
    respondSuccess(req, res, 200, { data: role });
  } catch (error) {
    handleError(error, "role.controller -> getRoleById");
    respondError(req, res, 500, "Error al obtener el rol");
  }
}

/**
 * Crea un nuevo rol
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function createRole(req, res) {
  try {
    const { name } = req.body;
    if (!name) return respondError(req, res, 400, "El nombre es obligatorio");

    // Verifica si ya existe un rol con ese nombre
    const exists = await Role.findOne({ name });
    if (exists) return respondError(req, res, 400, "El rol ya existe");

    const newRole = await Role.create({ name });
    respondSuccess(req, res, 201, { data: newRole });
  } catch (error) {
    handleError(error, "role.controller -> createRole");
    respondError(req, res, 500, "Error al crear el rol");
  }
}

export default {
  getRoles,
  getRoleById,
  createRole,
}; 
