"use strict";

import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/** Servicios de autenticación */
import { AuthenticationService } from '../../services/index.js';
import { authLoginBodySchema } from "../../schema/auth.schema.js";

/**
 * Inicia sesión con un usuario.
 * @async
 * @function login
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function login(req, res) {
  try {
    const { body } = req;
    const { error: bodyError } = authLoginBodySchema.validate(body);
    if (bodyError) return respondError(req, res, 400, bodyError.message);

    const loginResult = await AuthenticationService.login(body);

    if (!loginResult.success) {
      return respondError(req, res, 400, loginResult.error);
    }

    const { accessToken, refreshToken } = loginResult.data;

    // Configurar cookie con refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    respondSuccess(req, res, 200, { 
      accessToken,
      user: loginResult.data.user
    });
  } catch (error) {
    handleError(error, "auth.controller -> login");
    respondError(req, res, 500, "Error interno del servidor");
  }
}

/**
 * @name logout
 * @description Cierra la sesión del usuario
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns
 */
async function logout(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return respondError(req, res, 400, "No hay token");
    res.clearCookie("jwt", { httpOnly: true });
    respondSuccess(req, res, 200, { message: "Sesión cerrada correctamente" });
  } catch (error) {
    handleError(error, "auth.controller -> logout");
    respondError(req, res, 400, error.message);
  }
}

/**
 * @name refresh
 * @description Refresca el token de acceso
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function refresh(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return respondError(req, res, 401, "No hay token de autorización");

    const refreshResult = await AuthenticationService.refresh(cookies);

    if (!refreshResult.success) {
      return respondError(req, res, 401, refreshResult.error);
    }

    respondSuccess(req, res, 200, { 
      accessToken: refreshResult.data.accessToken,
      user: refreshResult.data.user
    });
  } catch (error) {
    handleError(error, "auth.controller -> refresh");
    respondError(req, res, 500, "Error interno del servidor");
  }
}

export default {
  login,
  logout,
  refresh,
};
