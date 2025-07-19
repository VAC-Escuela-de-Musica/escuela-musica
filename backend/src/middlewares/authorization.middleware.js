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
  // Verificar si el usuario tiene el rol "administrador"
  if (req.roles && req.roles.includes("administrador")) {
    return next();
  }
  
  return res.status(403).json({ message: "No autorizado" });
}

/**
 * Middleware para autorizar roles específicos
 * @param {Array} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.roles || !Array.isArray(req.roles)) {
      return res.status(403).json({ message: "No autorizado - Roles no encontrados" });
    }

    const hasPermission = req.roles.some((role) => allowedRoles.includes(role));
    
    if (hasPermission) {
      return next();
    }
    
    return res.status(403).json({ message: "No autorizado - Rol insuficiente" });
  };
}
