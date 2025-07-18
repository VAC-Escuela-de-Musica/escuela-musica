"use strict";

import jwt from "jsonwebtoken";
import { ACCESS_JWT_SECRET } from "../config/configEnv.js";
import { respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Verifica el token de acceso
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const verifyJWT = (req, res, next) => {
  try {
    console.log(
      "[verifyJWT] headers.authorization:",
      req.headers.authorization,
    );
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[verifyJWT] No hay token valido en el header");
      return respondError(
        req,
        res,
        401,
        "No autorizado",
        "No hay token valido",
      );
    }

    const token = authHeader.split(" ")[1];
    console.log("[verifyJWT] Token recibido:", token);

    jwt.verify(token, ACCESS_JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("[verifyJWT] Error al verificar token:", err.message);
        return respondError(req, res, 403, "No autorizado", err.message);
      }
      console.log("[verifyJWT] Token decodificado:", decoded);
      req.email = decoded.email;
      req.roles = decoded.roles;
      next();
    });
  } catch (error) {
    handleError(error, "authentication.middleware -> verifyToken");
  }
};

export default verifyJWT;
