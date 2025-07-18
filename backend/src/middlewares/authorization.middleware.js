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
  console.log("Middleware isAdmin - req.roles:", req.roles);
  console.log("Middleware isAdmin - req.email:", req.email);
  if (req.roles && req.roles.includes("administrador")) {
    console.log("Usuario autorizado como administrador");
    return next();
  }
  console.log("Usuario NO autorizado como administrador");
  return res.status(403).json({ message: "No autorizado" });
}
