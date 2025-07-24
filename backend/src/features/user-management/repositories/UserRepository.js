import { BaseRepository } from '../../../core/repositories/BaseRepository.js'
import { Result } from '../../../patterns/Result.js'
import User from '../../../core/models/user.model.js'
import bcrypt from 'bcryptjs'

/**
 * Repository específico para usuarios
 * Extiende BaseRepository con funcionalidades específicas de usuarios
 */
export class UserRepository extends BaseRepository {
  constructor () {
    super(User)
  }

  /**
   * Crear usuario con encriptación de contraseña
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Result>}
   */
  async create (userData) {
    try {
      // Encriptar contraseña si se proporciona
      if (userData.password) {
        const saltRounds = 10
        userData.password = await bcrypt.hash(userData.password, saltRounds)
      }

      return await super.create(userData)
    } catch (error) {
      return Result.error(`Error creating user: ${error.message}`, 400)
    }
  }

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Result>}
   */
  async findByEmail (email) {
    try {
      const user = await this.model.findOne({ email }).populate('roles')

      if (!user) {
        return Result.notFound('User not found')
      }

      return Result.success(user)
    } catch (error) {
      return Result.error(`Error finding user by email: ${error.message}`, 400)
    }
  }

  /**
   * Buscar usuario por username
   * @param {string} username - Username del usuario
   * @returns {Promise<Result>}
   */
  async findByUsername (username) {
    try {
      const user = await this.model.findOne({ username }).populate('roles')

      if (!user) {
        return Result.notFound('User not found')
      }

      return Result.success(user)
    } catch (error) {
      return Result.error(`Error finding user by username: ${error.message}`, 400)
    }
  }

  /**
   * Verificar credenciales de usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Result>}
   */
  async verifyCredentials (email, password) {
    try {
      const user = await this.model.findOne({ email }).select('+password').populate('roles')

      if (!user) {
        return Result.unauthorized('Invalid credentials')
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        return Result.unauthorized('Invalid credentials')
      }

      // Remover password del objeto retornado
      const userWithoutPassword = user.toObject()
      delete userWithoutPassword.password

      return Result.success(userWithoutPassword)
    } catch (error) {
      return Result.error(`Error verifying credentials: ${error.message}`, 400)
    }
  }

  /**
   * Actualizar contraseña del usuario
   * @param {string} userId - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Result>}
   */
  async updatePassword (userId, newPassword) {
    try {
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      const result = await this.updateById(userId, { password: hashedPassword })

      if (result.isError()) {
        return result
      }

      // Remover password del objeto retornado
      const userWithoutPassword = result.data.toObject()
      delete userWithoutPassword.password

      return Result.success(userWithoutPassword)
    } catch (error) {
      return Result.error(`Error updating password: ${error.message}`, 400)
    }
  }

  /**
   * Obtener usuarios por rol
   * @param {string} roleName - Nombre del rol
   * @returns {Promise<Result>}
   */
  async findByRole (roleName) {
    try {
      const users = await this.model.find()
        .populate({
          path: 'roles',
          match: { name: roleName }
        })

      // Filtrar usuarios que realmente tienen el rol
      const filteredUsers = users.filter(user => user.roles.length > 0)

      return Result.success(filteredUsers)
    } catch (error) {
      return Result.error(`Error finding users by role: ${error.message}`, 400)
    }
  }

  /**
   * Asignar roles a usuario
   * @param {string} userId - ID del usuario
   * @param {Array} roleIds - IDs de los roles
   * @returns {Promise<Result>}
   */
  async assignRoles (userId, roleIds) {
    try {
      const result = await this.updateById(userId, { roles: roleIds }, { populate: 'roles' })
      return result
    } catch (error) {
      return Result.error(`Error assigning roles: ${error.message}`, 400)
    }
  }

  /**
   * Activar/desactivar usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Estado activo
   * @returns {Promise<Result>}
   */
  async toggleStatus (userId, isActive) {
    try {
      const result = await this.updateById(userId, { isActive })
      return result
    } catch (error) {
      return Result.error(`Error toggling user status: ${error.message}`, 400)
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Result>}
   */
  async getStats () {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } }
          }
        },
        {
          $lookup: {
            from: 'roles',
            localField: '_id',
            foreignField: '_id',
            as: 'roles'
          }
        },
        {
          $project: {
            _id: 0,
            totalUsers: 1,
            activeUsers: 1,
            inactiveUsers: 1
          }
        }
      ]

      const [stats] = await this.model.aggregate(pipeline)

      // Obtener estadísticas por rol
      const roleStats = await this.model.aggregate([
        { $unwind: '$roles' },
        {
          $lookup: {
            from: 'roles',
            localField: 'roles',
            foreignField: '_id',
            as: 'roleInfo'
          }
        },
        { $unwind: '$roleInfo' },
        {
          $group: {
            _id: '$roleInfo.name',
            count: { $sum: 1 }
          }
        }
      ])

      return Result.success({
        ...stats,
        usersByRole: roleStats
      })
    } catch (error) {
      return Result.error(`Error getting user stats: ${error.message}`, 400)
    }
  }

  /**
   * Buscar usuarios con filtros avanzados
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Result>}
   */
  async searchUsers (filters, options = {}) {
    try {
      const {
        username,
        email,
        role,
        isActive,
        createdAfter,
        createdBefore
      } = filters

      const query = {}

      // Filtros de texto
      if (username) {
        query.username = { $regex: username, $options: 'i' }
      }

      if (email) {
        query.email = { $regex: email, $options: 'i' }
      }

      // Filtro por estado
      if (typeof isActive === 'boolean') {
        query.isActive = isActive
      }

      // Filtros de fecha
      if (createdAfter || createdBefore) {
        query.createdAt = {}
        if (createdAfter) {
          query.createdAt.$gte = new Date(createdAfter)
        }
        if (createdBefore) {
          query.createdAt.$lte = new Date(createdBefore)
        }
      }

      // Configurar opciones de paginación
      const paginationOptions = {
        ...options,
        populate: 'roles',
        select: '-password'
      }

      let result

      if (role) {
        // Búsqueda por rol requiere agregación
        const pipeline = [
          {
            $lookup: {
              from: 'roles',
              localField: 'roles',
              foreignField: '_id',
              as: 'roleInfo'
            }
          },
          {
            $match: {
              ...query,
              'roleInfo.name': role
            }
          },
          {
            $project: {
              password: 0
            }
          }
        ]

        const users = await this.model.aggregate(pipeline)
        result = Result.success(users)
      } else {
        result = await this.paginate(query, paginationOptions)
      }

      return result
    } catch (error) {
      return Result.error(`Error searching users: ${error.message}`, 400)
    }
  }

  /**
   * Obtener perfil completo del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Result>}
   */
  async getProfile (userId) {
    try {
      const user = await this.model.findById(userId)
        .populate('roles')
        .select('-password')

      if (!user) {
        return Result.notFound('User not found')
      }

      return Result.success(user)
    } catch (error) {
      return Result.error(`Error getting user profile: ${error.message}`, 400)
    }
  }

  /**
   * Verificar si el usuario existe por email o username
   * @param {string} email - Email del usuario
   * @param {string} username - Username del usuario
   * @returns {Promise<Result>}
   */
  async checkExistence (email, username) {
    try {
      const query = {
        $or: [
          { email },
          { username }
        ]
      }

      const user = await this.model.findOne(query)

      if (user) {
        const conflictField = user.email === email ? 'email' : 'username'
        return Result.conflict(`User with this ${conflictField} already exists`)
      }

      return Result.success(false)
    } catch (error) {
      return Result.error(`Error checking user existence: ${error.message}`, 400)
    }
  }
}

// Crear instancia singleton
export const userRepository = new UserRepository()
export default userRepository
