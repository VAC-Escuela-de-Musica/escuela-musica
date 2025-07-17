"use strict";
// Autorizacion - Comprobar el rol del usuario
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Comprueba si el usuario es administrador
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
async function isAdmin(req, res, next) {
  try {
    const user = await User.findOne({ email: req.email });
    const roles = await Role.find({ _id: { $in: user.roles } });
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        next();
        return;
      }
    }
    return respondError(
      req,
      res,
      401,
      "Se requiere un rol de administrador para realizar esta acción"
    );
  } catch (error) {
    handleError(error, "authorization.middleware -> isAdmin");
  }
}

/**
 * Middleware para comprobar si el usuario tiene alguno de los roles permitidos
 * @param {Array<string>} allowedRoles - Roles permitidos
 */
function authorizationMiddleware(allowedRoles) {
  return async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.email });
      if (!user) {
        return respondError(req, res, 401, "Usuario no encontrado");
      }
      const roles = await Role.find({ _id: { $in: user.roles } });
      const userRoles = roles.map((r) => r.name);
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));
      if (hasRole) {
        return next();
      }
      return respondError(
        req,
        res,
        403,
        "No tienes permisos para realizar esta acción"
      );
    } catch (error) {
      handleError(
        error,
        "authorization.middleware -> authorizationMiddleware"
      );
    }
  };
}

export { isAdmin, authorizationMiddleware };
