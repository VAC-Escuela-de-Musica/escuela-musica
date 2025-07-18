"use strict";

import { respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Verifica si el usuario tiene alguno de los roles especificados
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Intentar obtener roles de diferentes fuentes
      let userRoles = [];

      // 1. Roles cargados por loadUserData (preferido)
      if (req.user?.roleNames) {
        userRoles = req.user.roleNames;
      }
      // 2. Roles del token JWT directo
      else if (req.user?.roles) {
        // Si es array de objetos (populate), extraer nombres
        if (Array.isArray(req.user.roles) && req.user.roles.length > 0) {
          if (typeof req.user.roles[0] === 'object' && req.user.roles[0].name) {
            userRoles = req.user.roles.map(role => role.name);
          } else if (typeof req.user.roles[0] === 'string') {
            userRoles = req.user.roles;
          }
        }
      }
      // 3. Compatibilidad con sistema legacy
      else if (req.email && req.roles) {
        userRoles = Array.isArray(req.roles) ? req.roles : [req.roles];
      }

      console.log(`🔐 Verificando roles para ${req.user?.email || req.email}:`, {
        userRoles,
        allowedRoles,
        hasRoleNames: !!req.user?.roleNames,
        hasTokenRoles: !!req.user?.roles,
        tokenRolesType: req.user?.roles ? typeof req.user.roles[0] : 'none'
      });

      if (!userRoles.length) {
        return respondError(req, res, 401, "Información de roles no disponible");
      }

      const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return respondError(
          req,
          res,
          403,
          `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}. Tus roles: ${userRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      console.error('Error en requireRole:', error);
      handleError(error, "role.middleware -> requireRole");
      return respondError(req, res, 500, "Error verificando permisos");
    }
  };
};

/**
 * Verifica si el usuario es administrador
 */
const requireAdmin = requireRole(['admin']);

/**
 * Verifica si el usuario es administrador o profesor
 */
const requireAdminOrProfesor = requireRole(['admin', 'profesor']);

/**
 * Verifica si el usuario es administrador, profesor o alumno
 */
const requireAuthenticated = requireRole(['admin', 'profesor', 'alumno']);

/**
 * Middleware más específico para verificar si es propietario del recurso o admin
 * @param {Function} getResourceOwnerId - Función que extrae el ID del propietario del recurso
 */
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.fullData) {
        return respondError(req, res, 401, "Usuario no autenticado");
      }

      const user = req.user.fullData;
      const userRoles = req.user.roleNames;

      // Si es admin, permitir acceso
      if (userRoles.includes('admin')) {
        return next();
      }

      // Verificar propiedad del recurso
      const resourceOwnerId = await getResourceOwnerId(req);
      if (user._id.toString() === resourceOwnerId?.toString()) {
        return next();
      }

      return respondError(
        req,
        res,
        403,
        "Solo puedes acceder a tus propios recursos o ser administrador"
      );
    } catch (error) {
      handleError(error, "role.middleware -> requireOwnershipOrAdmin");
    }
  };
};

export { 
  requireRole, 
  requireAdmin, 
  requireAdminOrProfesor, 
  requireAuthenticated,
  requireOwnershipOrAdmin 
};
