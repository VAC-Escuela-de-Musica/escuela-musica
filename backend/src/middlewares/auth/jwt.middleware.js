"use strict";

import jwt from "jsonwebtoken";
import { ACCESS_JWT_SECRET } from "../../config/configEnv.js";
import { respondError } from "../../utils/resHandler.js";
import { handleError } from "../../utils/errorHandler.js";

/**
 * Extrae y valida el token JWT del header Authorization
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const extractJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return respondError(
        req,
        res,
        401,
        "No autorizado",
        "Token no proporcionado o formato inválido"
      );
    }

    const token = authHeader.split(" ")[1];
    req.token = token;
    next();
  } catch (error) {
    handleError(error, "jwt.middleware -> extractJWT");
  }
};

/**
 * Verifica y decodifica el token JWT
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const verifyJWT = (req, res, next) => {
  try {
    if (!req.token) {
      return respondError(
        req,
        res,
        401,
        "No autorizado",
        "Token no encontrado"
      );
    }

    jwt.verify(req.token, ACCESS_JWT_SECRET, (err, decoded) => {
      if (err) {
        return respondError(req, res, 403, "No autorizado", "Token inválido o expirado");
      }
      req.user = {
        email: decoded.email,
        roles: decoded.roles,
        id: decoded.id || decoded._id
      };
      next();
    });
  } catch (error) {
    handleError(error, "jwt.middleware -> verifyJWT");
  }
};

/**
 * Middleware combinado para extraer y verificar JWT
 */
const authenticateJWT = [extractJWT, verifyJWT];

export { extractJWT, verifyJWT, authenticateJWT };
