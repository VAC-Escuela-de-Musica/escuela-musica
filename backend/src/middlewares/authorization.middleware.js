"use strict";
// Autorizacion - Comprobar el rol del usuario
// import User from "../models/user.model.js";
// import { respondError } from "../utils/resHandler.js";
// import { handleError } from "../utils/errorHandler.js";
// import ROLES from "../constants/roles.constants.js";

/**
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
export function isAdmin(req, res, next) {
  // ...existing code...
  if (req.roles && req.roles.includes("administrador")) {
    // ...existing code...
    return next();
  }
  // ...existing code...
  return res.status(403).json({ message: "No autorizado" });
}
