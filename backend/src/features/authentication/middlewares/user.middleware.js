"use strict";

import User from "../../../core/models/user.model.js";
import Role from "../../../core/models/role.model.js";
import { respondError } from "../../../utils/responseHandler.util.js";
import { handleError } from "../../../utils/errorHandler.util.js";

/**
 * Carga los datos completos del usuario autenticado
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const loadUserData = async (req, res, next) => {
  try {
    console.log("🔍 [LOAD-USER] Iniciando carga de datos del usuario");
    console.log("🔍 [LOAD-USER] req.user:", req.user);
    console.log("🔍 [LOAD-USER] req.user.email:", req.user?.email);
    
    if (!req.user?.email) {
      console.log("❌ [LOAD-USER] No hay email en req.user");
      return respondError(req, res, 401, "Usuario no autenticado");
    }

    console.log(`📥 [LOAD-USER] Buscando usuario en BD: ${req.user.email}`);

    const user = await User.findOne({ email: req.user.email }).populate('roles');
    console.log("🔍 [LOAD-USER] Resultado de búsqueda:", {
      encontrado: !!user,
      id: user?._id,
      email: user?.email,
      username: user?.username,
      rolesCount: user?.roles?.length,
      roles: user?.roles?.map(r => ({ id: r._id, name: r.name }))
    });

    if (!user) {
      console.error(`❌ [LOAD-USER] Usuario no encontrado en BD: ${req.user.email}`);
      return respondError(req, res, 401, "Usuario no encontrado");
    }

    // Establecer datos completos del usuario
    req.user.fullData = user;
    req.user.roleNames = user.roles.map(role => role.name);
    req.user.id = user._id;
    req.user.email = user.email;
    
    // Asegurar compatibilidad con legacy code
    req.email = req.user.email;
    req.roles = req.user.roleNames;
    
    console.log(`✅ [LOAD-USER] Datos cargados exitosamente:`);
    console.log(`  - Usuario: ${user.email}`);
    console.log(`  - ID: ${user._id}`);
    console.log(`  - Username: ${user.username}`);
    console.log(`  - Roles: ${req.user.roleNames.join(', ')}`);
    console.log(`  - req.user.fullData configurado:`, !!req.user.fullData);
    
    next();
  } catch (error) {
    console.error('💥 [LOAD-USER] Error en loadUserData:', error);
    console.error('💥 [LOAD-USER] Stack trace:', error.stack);
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
