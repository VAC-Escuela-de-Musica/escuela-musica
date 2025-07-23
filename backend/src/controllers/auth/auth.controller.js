"use strict";

import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/** Servicios de autenticación */
import { AuthenticationService } from '../../services/index.js';
import { authLoginBodySchema } from "../../core/schemas/auth.schema.js";

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

/**
 * @name verify
 * @description Verifica el token de acceso
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function verify(req, res) {
  try {
    console.log("🔍 [AUTH-VERIFY] Iniciando verificación");
    console.log("🔍 [AUTH-VERIFY] req.user existe:", !!req.user);
    console.log("🔍 [AUTH-VERIFY] req.user.email:", req.user?.email);
    console.log("🔍 [AUTH-VERIFY] req.user.fullData existe:", !!req.user?.fullData);
    
    // El middleware loadUserData ya ha cargado los datos completos del usuario
    if (!req.user || !req.user.fullData) {
      console.log("❌ [AUTH-VERIFY] Usuario no autenticado - req.user:", req.user);
      return respondError(req, res, 401, "Usuario no autenticado");
    }

    const user = req.user.fullData;
    console.log("🔍 [AUTH-VERIFY] Usuario encontrado:");
    console.log("  - ID:", user._id);
    console.log("  - Email:", user.email);
    console.log("  - Username:", user.username);
    console.log("  - Roles:", user.roles);
    console.log("  - Roles length:", user.roles?.length);

    const responseData = {
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles || []
      }
    };

    console.log("✅ [AUTH-VERIFY] Enviando respuesta exitosa:", responseData);
    respondSuccess(req, res, 200, responseData);
  } catch (error) {
    console.error("💥 [AUTH-VERIFY] Error en verify:", error);
    handleError(error, "auth.controller -> verify");
    respondError(req, res, 500, "Error interno del servidor");
  }
}

export default {
  login,
  logout,
  refresh,
  verify,
};
