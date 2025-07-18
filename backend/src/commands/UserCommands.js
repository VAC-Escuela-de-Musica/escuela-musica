import { CommandHandler } from '../patterns/CommandHandler.js';
import { CommandValidator } from '../patterns/CommandValidator.js';
import { Result } from '../patterns/Result.js';
import { userService } from '../services/user/user.service.js';
import Joi from 'joi';

/**
 * Esquemas de validación para comandos de usuario
 */
const userSchemas = {
  create: Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    roles: Joi.array().items(Joi.string()).optional()
  }),
  
  update: Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    roles: Joi.array().items(Joi.string()).optional()
  }),
  
  query: Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().optional(),
    role: Joi.string().optional(),
    active: Joi.boolean().optional()
  })
};

/**
 * Comando para crear usuario
 */
export class CreateUserCommand extends CommandHandler {
  constructor() {
    super(
      'CreateUser',
      CommandValidator.createValidator({ body: userSchemas.create }),
      userService.createUser.bind(userService)
    );
  }
}

/**
 * Comando para obtener usuario por ID
 */
export class GetUserByIdCommand extends CommandHandler {
  constructor() {
    super(
      'GetUserById',
      CommandValidator.createCRUDValidator(),
      async (data) => {
        const { id } = data.params;
        return await userService.getUserById(id);
      }
    );
  }
}

/**
 * Comando para actualizar usuario
 */
export class UpdateUserCommand extends CommandHandler {
  constructor() {
    super(
      'UpdateUser',
      CommandValidator.createCRUDValidator(userSchemas.update),
      async (data) => {
        const { id } = data.params;
        const updateData = data.body;
        return await userService.updateUser(id, updateData);
      }
    );
  }
}

/**
 * Comando para eliminar usuario
 */
export class DeleteUserCommand extends CommandHandler {
  constructor() {
    super(
      'DeleteUser',
      CommandValidator.createCRUDValidator(),
      async (data) => {
        const { id } = data.params;
        return await userService.deleteUser(id);
      }
    );
  }
}

/**
 * Comando para listar usuarios con paginación
 */
export class ListUsersCommand extends CommandHandler {
  constructor() {
    super(
      'ListUsers',
      CommandValidator.createQueryValidator(userSchemas.query),
      async (data) => {
        const { page, limit, sort, order, ...filters } = data.query;
        return await userService.getUsersWithPagination({ 
          page, 
          limit, 
          sort, 
          order, 
          filters 
        });
      }
    );
  }
}

/**
 * Comando para obtener perfil del usuario actual
 */
export class GetUserProfileCommand extends CommandHandler {
  constructor() {
    super(
      'GetUserProfile',
      CommandValidator.createAuthValidator({}),
      async (data, req) => {
        const userId = req.user.id;
        return await userService.getUserProfile(userId);
      }
    );
  }
}

/**
 * Comando para actualizar perfil del usuario actual
 */
export class UpdateUserProfileCommand extends CommandHandler {
  constructor() {
    super(
      'UpdateUserProfile',
      CommandValidator.createAuthValidator({ 
        body: Joi.object({
          username: Joi.string().min(3).max(30).optional(),
          email: Joi.string().email().optional(),
          currentPassword: Joi.string().when('password', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.optional()
          }),
          password: Joi.string().min(6).optional()
        })
      }),
      async (data, req) => {
        const userId = req.user.id;
        const updateData = data.body;
        return await userService.updateUserProfile(userId, updateData);
      }
    );
  }
}

/**
 * Comando para cambiar contraseña del usuario
 */
export class ChangePasswordCommand extends CommandHandler {
  constructor() {
    super(
      'ChangePassword',
      CommandValidator.createAuthValidator({
        body: Joi.object({
          currentPassword: Joi.string().required(),
          newPassword: Joi.string().min(6).required(),
          confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        })
      }),
      async (data, req) => {
        const userId = req.user.id;
        const { currentPassword, newPassword } = data.body;
        return await userService.changePassword(userId, currentPassword, newPassword);
      }
    );
  }
}

/**
 * Comando para obtener usuarios por rol
 */
export class GetUsersByRoleCommand extends CommandHandler {
  constructor() {
    super(
      'GetUsersByRole',
      CommandValidator.createValidator({
        params: Joi.object({
          role: Joi.string().required()
        })
      }),
      async (data) => {
        const { role } = data.params;
        return await userService.getUsersByRole(role);
      }
    );
  }
}

/**
 * Comando para activar/desactivar usuario
 */
export class ToggleUserStatusCommand extends CommandHandler {
  constructor() {
    super(
      'ToggleUserStatus',
      CommandValidator.createAuthValidator({
        params: Joi.object({
          id: Joi.string().required()
        }),
        body: Joi.object({
          active: Joi.boolean().required()
        })
      }, ['admin']),
      async (data) => {
        const { id } = data.params;
        const { active } = data.body;
        return await userService.toggleUserStatus(id, active);
      }
    );
  }
}

/**
 * Comando para asignar roles a usuario
 */
export class AssignRolesCommand extends CommandHandler {
  constructor() {
    super(
      'AssignRoles',
      CommandValidator.createAuthValidator({
        params: Joi.object({
          id: Joi.string().required()
        }),
        body: Joi.object({
          roles: Joi.array().items(Joi.string()).required()
        })
      }, ['admin']),
      async (data) => {
        const { id } = data.params;
        const { roles } = data.body;
        return await userService.assignRoles(id, roles);
      }
    );
  }
}

/**
 * Comando para obtener estadísticas de usuarios
 */
export class GetUserStatsCommand extends CommandHandler {
  constructor() {
    super(
      'GetUserStats',
      CommandValidator.createAuthValidator({}, ['admin']),
      async () => {
        return await userService.getUserStats();
      }
    );
  }
}

export default {
  CreateUserCommand,
  GetUserByIdCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ListUsersCommand,
  GetUserProfileCommand,
  UpdateUserProfileCommand,
  ChangePasswordCommand,
  GetUsersByRoleCommand,
  ToggleUserStatusCommand,
  AssignRolesCommand,
  GetUserStatsCommand
};
