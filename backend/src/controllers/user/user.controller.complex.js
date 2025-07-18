import { CommandRegistry } from '../../patterns/CommandRegistry.js';
import UserCommands from '../../commands/UserCommands.js';

/**
 * Controlador de usuarios refactorizado usando Command Pattern
 * Elimina toda la duplicación de código y maneja respuestas de forma consistente
 */
class UserController {
  constructor() {
    this.registry = new CommandRegistry();
    this.initializeCommands();
  }

  /**
   * Inicializa todos los comandos de usuario
   */
  initializeCommands() {
    // Registrar comandos CRUD básicos
    this.registry.register('users.list', new UserCommands.ListUsersCommand());
    this.registry.register('users.create', new UserCommands.CreateUserCommand());
    this.registry.register('users.getById', new UserCommands.GetUserByIdCommand());
    this.registry.register('users.update', new UserCommands.UpdateUserCommand());
    this.registry.register('users.delete', new UserCommands.DeleteUserCommand());
    
    // Registrar comandos específicos de usuario
    this.registry.register('users.profile', new UserCommands.GetUserProfileCommand());
    this.registry.register('users.updateProfile', new UserCommands.UpdateUserProfileCommand());
    this.registry.register('users.changePassword', new UserCommands.ChangePasswordCommand());
    this.registry.register('users.byRole', new UserCommands.GetUsersByRoleCommand());
    this.registry.register('users.toggleStatus', new UserCommands.ToggleUserStatusCommand());
    this.registry.register('users.assignRoles', new UserCommands.AssignRolesCommand());
    this.registry.register('users.stats', new UserCommands.GetUserStatsCommand());
  }

  /**
   * Obtiene todos los usuarios con paginación
   */
  async getUsers(req, res) {
    await this.registry.execute('users.list', req, res);
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(req, res) {
    await this.registry.execute('users.create', req, res);
  }

  /**
   * Obtiene un usuario por su id
   */
  async getUserById(req, res) {
    await this.registry.execute('users.getById', req, res);
  }

  /**
   * Actualiza un usuario por su id
   */
  async updateUser(req, res) {
    await this.registry.execute('users.update', req, res);
  }

  /**
   * Elimina un usuario por su id
   */
  async deleteUser(req, res) {
    await this.registry.execute('users.delete', req, res);
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getUserProfile(req, res) {
    await this.registry.execute('users.profile', req, res);
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateUserProfile(req, res) {
    await this.registry.execute('users.updateProfile', req, res);
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(req, res) {
    await this.registry.execute('users.changePassword', req, res);
  }

  /**
   * Obtiene usuarios por rol
   */
  async getUsersByRole(req, res) {
    await this.registry.execute('users.byRole', req, res);
  }

  /**
   * Activa/desactiva un usuario
   */
  async toggleUserStatus(req, res) {
    await this.registry.execute('users.toggleStatus', req, res);
  }

  /**
   * Asigna roles a un usuario
   */
  async assignRoles(req, res) {
    await this.registry.execute('users.assignRoles', req, res);
  }

  /**
   * Obtiene estadísticas de usuarios
   */
  async getUserStats(req, res) {
    await this.registry.execute('users.stats', req, res);
  }
}

// Crear instancia singleton del controlador
const userController = new UserController();

export default {
  getUsers: userController.getUsers.bind(userController),
  createUser: userController.createUser.bind(userController),
  getUserById: userController.getUserById.bind(userController),
  updateUser: userController.updateUser.bind(userController),
  deleteUser: userController.deleteUser.bind(userController),
  getUserProfile: userController.getUserProfile.bind(userController),
  updateUserProfile: userController.updateUserProfile.bind(userController),
  changePassword: userController.changePassword.bind(userController),
  getUsersByRole: userController.getUsersByRole.bind(userController),
  toggleUserStatus: userController.toggleUserStatus.bind(userController),
  assignRoles: userController.assignRoles.bind(userController),
  getUserStats: userController.getUserStats.bind(userController)
};
