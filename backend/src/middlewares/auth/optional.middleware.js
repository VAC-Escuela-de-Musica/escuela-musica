"use strict";

import jwt from "jsonwebtoken";
import { ACCESS_JWT_SECRET } from "../../config/configEnv.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Middleware de autenticación opcional para rutas públicas de archivos
 * Permite acceso sin token para materiales públicos, pero valida el token si se proporciona
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const optionalAuth = (req, res, next) => {
  try {
    // Intentar obtener token del header Authorization
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Si no hay token en header, buscar en query params
    if (!token && req.query.token) {
      token = req.query.token;
    }

    // Si hay token, intentar validarlo
    if (token) {
      try {
        const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
        
        // Establecer datos del usuario para compatibilidad con ambos sistemas
        req.email = decoded.email;
        req.roles = decoded.roles || [];
        
        req.user = {
          email: decoded.email,
          roles: decoded.roles || [],
          id: decoded.id || decoded._id
        };
        
        console.log(`✅ Usuario autenticado para archivo: ${decoded.email}`);
      } catch (error) {
        console.warn(`⚠️ Token inválido en request de archivo: ${error.message}`);
        // No detener el request, permitir acceso a materiales públicos
      }
    }

    // Continuar siempre, incluso sin token válido (para materiales públicos)
    next();
  } catch (error) {
    handleError(error, "optional.auth -> optionalAuth");
    // En caso de error, continuar sin autenticación
    next();
  }
};

export { optionalAuth };
