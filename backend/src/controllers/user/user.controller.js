import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Controlador de usuarios ultra simplificado para debugging
 */
class UserController {
  constructor() {
    // Inicialización básica
  }

  /**
   * Lista todos los usuarios - versión básica
   */
  async listUsers(req, res) {
    try {
      // Importar el modelo aquí para evitar problemas de importación circular
      const User = (await import("../../models/user.model.js")).default;
      // Buscar todos los usuarios y popular los roles
      const users = await User.find({}).populate("roles");
      return respondSuccess(req, res, 200, {
        users,
        totalCount: users.length,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          pageSize: users.length,
          totalCount: users.length
        }
      });
    } catch (error) {
      console.error('❌ Error en UserController.listUsers:', error);
      handleError(error, "UserController -> listUsers");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Crea un nuevo usuario - versión básica
   */
  async createUser(req, res) {
    try {
      return respondSuccess(req, res, 201, { message: 'Usuario creado (mock)' });
    } catch (error) {
      handleError(error, "UserController -> createUser");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene un usuario por ID - versión básica
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      return respondSuccess(req, res, 200, { 
        id, 
        username: 'user', 
        email: 'user@email.com',
        message: 'Usuario encontrado (mock)'
      });
    } catch (error) {
      handleError(error, "UserController -> getUserById");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza un usuario - versión básica
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      return respondSuccess(req, res, 200, { 
        id, 
        message: 'Usuario actualizado (mock)'
      });
    } catch (error) {
      handleError(error, "UserController -> updateUser");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina un usuario - versión básica
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      return respondSuccess(req, res, 200, { 
        id, 
        message: 'Usuario eliminado (mock)'
      });
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
      const currentUser = req.user;
      return respondSuccess(req, res, 200, {
        user: currentUser,
        message: 'Perfil obtenido'
      });
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
      return respondSuccess(req, res, 200, { 
        message: 'Perfil actualizado (mock)'
      });
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
      return respondSuccess(req, res, 200, { 
        message: 'Contraseña cambiada (mock)'
      });
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
  getUsers: userController.listUsers.bind(userController), // Alias para compatibilidad
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
