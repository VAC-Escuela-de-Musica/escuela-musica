"use strict";
// Autorizacion - Comprobar el rol del usuario
// import User from "../models/user.model.js";
// import { respondError } from "../utils/resHandler.js";
// import { handleError } from "../utils/errorHandler.js";
// import ROLES from "../constants/roles.constants.js";

/**
 * Comprueba si el usuario es administrador
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
export function isAdmin(req, res, next) {
  if (req.user && req.user.roles && req.user.roles.includes("administrador")) {
    return next();
  }
  return res.status(403).json({ message: "No autorizado" });
}

// Puedes agregar otros middlewares para otros roles si lo necesitas
