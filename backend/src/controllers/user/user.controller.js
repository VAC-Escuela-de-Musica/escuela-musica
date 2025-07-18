"use strict";

import { respondSuccess, respondError } from "../../utils/resHandler.js";
import { UserService } from '../../services/index.js';
import { userBodySchema, userIdSchema } from "../../schema/user.schema.js";
import { asyncHandler } from "../../middlewares/index.js";

/**
 * Obtiene todos los usuarios
 */
const getUsers = asyncHandler(async (req, res) => {
  const [usuarios, errorUsuarios] = await UserService.getUsers();
  
  if (errorUsuarios) {
    return respondError(req, res, 404, errorUsuarios);
  }

  return usuarios.length === 0
    ? respondSuccess(req, res, 204)
    : respondSuccess(req, res, 200, usuarios);
});

/**
 * Crea un nuevo usuario
 */
const createUser = asyncHandler(async (req, res) => {
  const { body } = req;
  const { error: bodyError } = userBodySchema.validate(body);
  if (bodyError) return respondError(req, res, 400, bodyError.message);

  const [newUser, userError] = await UserService.createUser(body);

  if (userError) return respondError(req, res, 400, userError);
  if (!newUser) {
    return respondError(req, res, 400, "No se creó el usuario");
  }

  respondSuccess(req, res, 201, newUser);
});

/**
 * Obtiene un usuario por su id
 */
const getUserById = asyncHandler(async (req, res) => {
  const { params } = req;
  const { error: paramsError } = userIdSchema.validate(params);
  if (paramsError) return respondError(req, res, 400, paramsError.message);

  const [user, errorUser] = await UserService.getUserById(params.id);

  if (errorUser) return respondError(req, res, 404, errorUser);

  respondSuccess(req, res, 200, user);
});

/**
 * Actualiza un usuario por su id
 */
const updateUser = asyncHandler(async (req, res) => {
  const { params, body } = req;
  const { error: paramsError } = userIdSchema.validate(params);
  if (paramsError) return respondError(req, res, 400, paramsError.message);

  const { error: bodyError } = userBodySchema.validate(body);
  if (bodyError) return respondError(req, res, 400, bodyError.message);

  const [user, userError] = await UserService.updateUser(params.id, body);

  if (userError) return respondError(req, res, 400, userError);

  respondSuccess(req, res, 200, user);
});

/**
 * Elimina un usuario por su id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { params } = req;
  const { error: paramsError } = userIdSchema.validate(params);
  if (paramsError) return respondError(req, res, 400, paramsError.message);

  const user = await UserService.deleteUser(params.id);
  !user
    ? respondError(
        req,
        res,
        404,
        "No se encontró el usuario solicitado",
        "Verifique el id ingresado"
      )
    : respondSuccess(req, res, 200, user);
});

export default {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
