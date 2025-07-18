"use strict";

import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { UserService } from '../../services/index.js';
import { asyncHandler } from "../../middlewares/index.js";

/**
 * Obtiene todos los usuarios
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await UserService.getUsers();
  
  if (!result.success) {
    return respondError(req, res, 404, result.error);
  }

  return result.data.length === 0
    ? respondSuccess(req, res, 204)
    : respondSuccess(req, res, 200, result.data);
});

/**
 * Crea un nuevo usuario
 */
const createUser = asyncHandler(async (req, res) => {
  const { body } = req;
  // La validación del body ya se maneja en el middleware
  
  const result = await UserService.createUser(body);

  if (!result.success) {
    return respondError(req, res, 400, result.error);
  }

  respondSuccess(req, res, 201, result.data);
});

/**
 * Obtiene un usuario por su id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { params } = req;
  // La validación de params ya se maneja en el middleware

  const result = await UserService.getUserById(params.id);

  if (!result.success) {
    return respondError(req, res, 404, result.error);
  }

  respondSuccess(req, res, 200, result.data);
});

/**
 * Actualiza un usuario por su id
 */
const updateUser = asyncHandler(async (req, res) => {
  const { params, body } = req;
  // Las validaciones ya se manejan en el middleware

  const result = await UserService.updateUser(params.id, body);

  if (!result.success) {
    return respondError(req, res, 400, result.error);
  }

  respondSuccess(req, res, 200, result.data);
});

/**
 * Elimina un usuario por su id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { params } = req;
  // La validación de params ya se maneja en el middleware

  const result = await UserService.deleteUser(params.id);
  
  if (!result.success) {
    return respondError(req, res, 404, result.error);
  }

  respondSuccess(req, res, 200, result.data);
});

export default {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
