import { userRepository } from '../../repositories/index.js';
import { Result } from '../../patterns/Result.js';
import { handleError } from '../../utils/errorHandler.util.js';

/**
 * Servicio refactorizado para manejo de usuarios
 * Usa Repository Pattern para abstracción de datos
 */
class UserService {
  constructor() {
    this.repository = userRepository;
  }

  /**
   * Obtiene todos los usuarios con paginación
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async getUsers(options = {}) {
    try {
      const defaultOptions = {
        page: 1,
        limit: 10,
        sort: { createdAt: -1 },
        populate: 'roles',
        select: '-password'
      };

      const mergedOptions = { ...defaultOptions, ...options };
      return await this.repository.paginate({}, mergedOptions);
    } catch (error) {
      handleError(error, 'UserService -> getUsers');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Obtiene usuarios con paginación y filtros
   * @param {Object} params - Parámetros de paginación y filtros
   * @returns {Promise<Result>}
   */
  async getUsersWithPagination(params) {
    try {
      const { page, limit, sort, order, filters } = params;
      
      const options = {
        page,
        limit,
        sort: { [sort]: order === 'desc' ? -1 : 1 },
        populate: 'roles',
        select: '-password'
      };

      return await this.repository.searchUsers(filters, options);
    } catch (error) {
      handleError(error, 'UserService -> getUsersWithPagination');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Result>}
   */
  async createUser(userData) {
    try {
      // Verificar si el usuario ya existe
      const existsResult = await this.repository.checkExistence(userData.email, userData.username);
      if (existsResult.isError()) {
        return existsResult;
      }

      return await this.repository.create(userData);
    } catch (error) {
      handleError(error, 'UserService -> createUser');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Result>}
   */
  async getUserById(userId) {
    try {
      const options = {
        populate: 'roles',
        select: '-password'
      };

      return await this.repository.findById(userId, options);
    } catch (error) {
      handleError(error, 'UserService -> getUserById');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Actualiza un usuario por ID
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Result>}
   */
  async updateUser(userId, updateData) {
    try {
      const options = {
        populate: 'roles',
        select: '-password'
      };

      // Si se actualiza email o username, verificar que no existan
      if (updateData.email || updateData.username) {
        const existsResult = await this.repository.checkExistence(
          updateData.email || '',
          updateData.username || ''
        );
        
        if (existsResult.isError()) {
          return existsResult;
        }
      }

      return await this.repository.updateById(userId, updateData, options);
    } catch (error) {
      handleError(error, 'UserService -> updateUser');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Elimina un usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<Result>}
   */
  async deleteUser(userId) {
    try {
      return await this.repository.deleteById(userId);
    } catch (error) {
      handleError(error, 'UserService -> deleteUser');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Obtiene el perfil del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Result>}
   */
  async getUserProfile(userId) {
    try {
      return await this.repository.getProfile(userId);
    } catch (error) {
      handleError(error, 'UserService -> getUserProfile');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Actualiza el perfil del usuario
   * @param {string} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Result>}
   */
  async updateUserProfile(userId, updateData) {
    try {
      // Verificar contraseña actual si se proporciona nueva contraseña
      if (updateData.password && updateData.currentPassword) {
        const user = await this.repository.findById(userId);
        if (user.isError()) {
          return user;
        }

        const verifyResult = await this.repository.verifyCredentials(
          user.data.email,
          updateData.currentPassword
        );

        if (verifyResult.isError()) {
          return Result.unauthorized('Current password is incorrect');
        }

        // Actualizar contraseña
        const passwordResult = await this.repository.updatePassword(userId, updateData.password);
        if (passwordResult.isError()) {
          return passwordResult;
        }

        // Remover campos de contraseña del objeto de actualización
        const { password, currentPassword, ...restData } = updateData;
        updateData = restData;
      }

      if (Object.keys(updateData).length > 0) {
        const options = {
          populate: 'roles',
          select: '-password'
        };

        return await this.repository.updateById(userId, updateData, options);
      }

      return await this.repository.getProfile(userId);
    } catch (error) {
      handleError(error, 'UserService -> updateUserProfile');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Cambia la contraseña del usuario
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Result>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.repository.findById(userId);
      if (user.isError()) {
        return user;
      }

      const verifyResult = await this.repository.verifyCredentials(
        user.data.email,
        currentPassword
      );

      if (verifyResult.isError()) {
        return Result.unauthorized('Current password is incorrect');
      }

      return await this.repository.updatePassword(userId, newPassword);
    } catch (error) {
      handleError(error, 'UserService -> changePassword');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Obtiene usuarios por rol
   * @param {string} roleName - Nombre del rol
   * @returns {Promise<Result>}
   */
  async getUsersByRole(roleName) {
    try {
      return await this.repository.findByRole(roleName);
    } catch (error) {
      handleError(error, 'UserService -> getUsersByRole');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Activa/desactiva un usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Estado activo
   * @returns {Promise<Result>}
   */
  async toggleUserStatus(userId, isActive) {
    try {
      return await this.repository.toggleStatus(userId, isActive);
    } catch (error) {
      handleError(error, 'UserService -> toggleUserStatus');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Asigna roles a un usuario
   * @param {string} userId - ID del usuario
   * @param {Array} roleIds - IDs de los roles
   * @returns {Promise<Result>}
   */
  async assignRoles(userId, roleIds) {
    try {
      return await this.repository.assignRoles(userId, roleIds);
    } catch (error) {
      handleError(error, 'UserService -> assignRoles');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Promise<Result>}
   */
  async getUserStats() {
    try {
      return await this.repository.getStats();
    } catch (error) {
      handleError(error, 'UserService -> getUserStats');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Verifica las credenciales del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Result>}
   */
  async verifyCredentials(email, password) {
    try {
      return await this.repository.verifyCredentials(email, password);
    } catch (error) {
      handleError(error, 'UserService -> verifyCredentials');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Busca usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Result>}
   */
  async findByEmail(email) {
    try {
      return await this.repository.findByEmail(email);
    } catch (error) {
      handleError(error, 'UserService -> findByEmail');
      return Result.error(error.message, 500);
    }
  }

  /**
   * Busca usuario por username
   * @param {string} username - Username del usuario
   * @returns {Promise<Result>}
   */
  async findByUsername(username) {
    try {
      return await this.repository.findByUsername(username);
    } catch (error) {
      handleError(error, 'UserService -> findByUsername');
      return Result.error(error.message, 500);
    }
  }
}

// Crear instancia singleton
export const userService = new UserService();
export default userService;
