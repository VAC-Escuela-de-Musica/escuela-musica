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
    console.log("[isAdmin] req.email:", req.email);
    const user = await User.findOne({ email: req.email });
    console.log("[isAdmin] Usuario encontrado:", user);
    if (!user) {
      return respondError(req, res, 401, "Usuario no encontrado");
    }
    const roles = await Role.find({ _id: { $in: user.roles } });
    console.log("[isAdmin] Roles encontrados:", roles);
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].name === "admin") {
        console.log("[isAdmin] Usuario es admin, acceso permitido.");
        next();
        return;
      }
    }
    console.log("[isAdmin] Usuario NO es admin, acceso denegado.");
    return respondError(
      req,
      res,
      401,
      "Se requiere un rol de administrador para realizar esta acción",
    );
  } catch (error) {
    handleError(error, "authorization.middleware -> isAdmin");
  }
}

export { isAdmin };
