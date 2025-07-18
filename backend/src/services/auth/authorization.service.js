"use strict";

import User from "../../models/user.model.js";
import Role from "../../models/role.model.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Servicio centralizado para manejar la autorización de usuarios
 */
class AuthorizationService {
  /**
   * Verifica si un usuario tiene rol de admin
   * @param {Object} req - Objeto de petición
   * @returns {boolean} - True si es admin
   */
  static isUserAdmin(req) {
    return req.roles?.some(role => role.name === 'admin' || role === 'admin');
  }

  /**
   * Verifica si un usuario tiene rol de profesor
   * @param {Object} req - Objeto de petición
   * @returns {boolean} - True si es profesor
   */
  static isUserProfesor(req) {
    return req.roles?.some(role => role.name === 'profesor' || role === 'profesor');
  }

  /**
   * Verifica si un usuario puede acceder a un material
   * @param {Object} req - Objeto de petición
   * @param {Object} material - Material a verificar
   * @returns {boolean} - True si puede acceder
   */
  static canUserAccessMaterial(req, material) {
    // Admin puede acceder a todo
    if (this.isUserAdmin(req)) return true;
    
    // Material público es accesible para todos
    if (material.bucketTipo === 'publico') return true;
    
    // El propietario puede acceder a su material
    if (material.usuario === req.email) return true;
    
    // Profesores pueden acceder a materiales
    if (this.isUserProfesor(req)) return true;
    
    return false;
  }

  /**
   * Verifica si un usuario tiene alguno de los roles especificados
   * @param {Object} req - Objeto de petición
   * @param {Array<string>} roles - Roles a verificar
   * @returns {boolean} - True si tiene algún rol
   */
  static hasAnyRole(req, roles) {
    if (!req.roles || !Array.isArray(req.roles)) return false;
    
    return roles.some(role => 
      req.roles.some(userRole => 
        userRole.name === role || userRole === role
      )
    );
  }

  /**
   * Obtiene los roles de un usuario desde la base de datos
   * @param {string} email - Email del usuario
   * @returns {Promise<Array>} - Array de roles
   */
  static async getUserRoles(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) return [];
      
      const roles = await Role.find({ _id: { $in: user.roles } });
      return roles;
    } catch (error) {
      handleError(error, "AuthorizationService -> getUserRoles");
      return [];
    }
  }

  /**
   * Verifica si un usuario tiene permisos para una acción específica
   * @param {Object} req - Objeto de petición
   * @param {string} action - Acción a verificar
   * @param {Object} resource - Recurso sobre el que se ejecuta la acción
   * @returns {boolean} - True si tiene permisos
   */
  static hasPermission(req, action, resource = null) {
    switch (action) {
      case 'read':
        return resource ? this.canUserAccessMaterial(req, resource) : true;
      
      case 'create':
      case 'update':
      case 'delete':
        return this.isUserAdmin(req) || this.isUserProfesor(req);
      
      case 'admin':
        return this.isUserAdmin(req);
      
      default:
        return false;
    }
  }
}

// Exportar usando named export
export { AuthorizationService };

