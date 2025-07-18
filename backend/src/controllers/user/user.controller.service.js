import { userService } from '../../services/user/user.service.js';
import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Controlador de usuarios simplificado usando Repository Pattern
 * Elimina la complejidad del Command Pattern para mejor debugging
 */
class UserController {
  constructor() {
    this.userService = userService;
  }

  /**
   * Lista todos los usuarios
   */
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.getUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        currentUserId
      });
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> listUsers");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(req, res) {
    try {
      const userData = req.body;
      const createdBy = req.user?.id;
      
      const result = await this.userService.createUser({
        ...userData,
        createdBy
      });
      
      if (result.success) {
        return respondSuccess(req, res, 201, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> createUser");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.getUserById(id, currentUserId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 404, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> getUserById");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.updateUser(id, updateData, currentUserId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> updateUser");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.deleteUser(id, currentUserId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 404, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> deleteUser");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile(req, res) {
    try {
      const currentUserId = req.user?.id;
      
      const result = await this.userService.getUserById(currentUserId, currentUserId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 404, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> getProfile");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateProfile(req, res) {
    try {
      const updateData = req.body;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.updateUser(currentUserId, updateData, currentUserId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> updateProfile");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const currentUserId = req.user?.id;
      
      const result = await this.userService.changePassword(currentUserId, currentPassword, newPassword);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "UserController -> changePassword");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }
}

// Crear instancia singleton del controlador
const userController = new UserController();

export default {
  listUsers: userController.listUsers.bind(userController),
  createUser: userController.createUser.bind(userController),
  getUserById: userController.getUserById.bind(userController),
  updateUser: userController.updateUser.bind(userController),
  deleteUser: userController.deleteUser.bind(userController),
  getProfile: userController.getProfile.bind(userController),
  updateProfile: userController.updateProfile.bind(userController),
  changePassword: userController.changePassword.bind(userController),
  
  // Métodos adicionales que pueden ser necesarios
  getUsersByRole: userController.listUsers.bind(userController),
  toggleUserStatus: userController.updateUser.bind(userController),
  assignRoles: userController.updateUser.bind(userController),
  getUserStats: userController.listUsers.bind(userController)
};

export const listUsers = userController.listUsers.bind(userController);
export const createUser = userController.createUser.bind(userController);
export const getUserById = userController.getUserById.bind(userController);
export const updateUser = userController.updateUser.bind(userController);
export const deleteUser = userController.deleteUser.bind(userController);
export const getProfile = userController.getProfile.bind(userController);
export const updateProfile = userController.updateProfile.bind(userController);
export const changePassword = userController.changePassword.bind(userController);
