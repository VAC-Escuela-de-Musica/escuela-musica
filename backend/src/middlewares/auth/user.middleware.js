"use strict";

import User from "../../models/user.model.js";
import Role from "../../models/role.model.js";
import { respondError } from "../../utils/resHandler.js";
import { handleError } from "../../utils/errorHandler.js";

/**
 * Carga los datos completos del usuario autenticado
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const loadUserData = async (req, res, next) => {
  try {
    if (!req.user?.email) {
      return respondError(req, res, 401, "Usuario no autenticado");
    }

    console.log(`📥 Cargando datos del usuario: ${req.user.email}`);

    const user = await User.findOne({ email: req.user.email }).populate('roles');
    if (!user) {
      console.error(`❌ Usuario no encontrado en BD: ${req.user.email}`);
      return respondError(req, res, 401, "Usuario no encontrado");
    }

    // Establecer datos completos del usuario
    req.user.fullData = user;
    req.user.roleNames = user.roles.map(role => role.name);
    
    // Asegurar compatibilidad con legacy code
    req.email = req.user.email;
    req.roles = req.user.roleNames;
    
    console.log(`✅ Datos de usuario cargados: ${user.email}, roles: ${req.user.roleNames.join(', ')}`);
    
    next();
  } catch (error) {
    console.error('Error en loadUserData:', error);
    handleError(error, "user.middleware -> loadUserData");
    return respondError(req, res, 500, "Error cargando datos de usuario");
  }
};

/**
 * Verifica que el usuario esté activo
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const checkUserStatus = async (req, res, next) => {
  try {
    if (!req.user?.fullData) {
      return respondError(req, res, 401, "Datos de usuario no cargados");
    }

    const user = req.user.fullData;
    
    if (user.status === 'inactive') {
      return respondError(req, res, 403, "Cuenta de usuario inactiva");
    }

    if (user.status === 'suspended') {
      return respondError(req, res, 403, "Cuenta de usuario suspendida");
    }

    next();
  } catch (error) {
    handleError(error, "user.middleware -> checkUserStatus");
  }
};

export { loadUserData, checkUserStatus };
