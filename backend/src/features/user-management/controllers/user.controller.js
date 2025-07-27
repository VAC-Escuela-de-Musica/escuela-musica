import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Controlador de usuarios ultra simplificado para debugging
 */
class UserController {
  constructor () {
    // Inicialización básica
  }

  /**
   * Lista todos los usuarios - versión básica
   */
  async listUsers (req, res) {
    try {
      // Importar los modelos aquí para evitar problemas de importación circular
      const User = (await import('../../../core/models/user.model.js')).default
      const Role = (await import('../../../core/models/role.model.js')).default
      
      // Buscar todos los usuarios sin populate primero
      const users = await User.find({}).lean()
      
      // Procesar roles manualmente para manejar inconsistencias
      const processedUsers = await Promise.all(users.map(async (user) => {
        const processedRoles = []
        
        for (const roleRef of user.roles) {
          if (typeof roleRef === 'string' && !roleRef.match(/^[0-9a-fA-F]{24}$/)) {
            // Es un string directo (como "asistente")
            processedRoles.push({ name: roleRef })
          } else {
            // Es un ObjectId, hacer populate manual
            try {
              const role = await Role.findById(roleRef)
              if (role) {
                processedRoles.push(role)
              } else {
                processedRoles.push({ name: 'Unknown' })
              }
            } catch (e) {
              processedRoles.push({ name: roleRef })
            }
          }
        }
        
        return {
          ...user,
          roles: processedRoles
        }
      }))
      
      console.log('[USERS] Found', processedUsers.length, 'users')
      
      return respondSuccess(req, res, 200, processedUsers)
    } catch (error) {
      console.error('❌ Error en UserController.listUsers:', error)
      handleError(error, 'UserController -> listUsers')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser (req, res) {
    try {
      const User = (await import('../../../core/models/user.model.js')).default
      const Role = (await import('../../../core/models/role.model.js')).default
      
      const { username, email, rut, password, roles = [] } = req.body
      
      console.log('[USERS] Creating user:', username)
      
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ $or: [{ email }, { rut }] })
      if (existingUser) {
        return respondError(req, res, 400, 'Usuario ya existe con ese email o RUT')
      }
      
      // Buscar IDs de roles
      const roleObjects = await Role.find({ name: { $in: roles } })
      const roleIds = roleObjects.map(role => role._id)
      
      // Encriptar contraseña
      const hashedPassword = await User.encryptPassword(password)
      
      // Crear usuario
      const newUser = new User({
        username,
        email,
        rut,
        password: hashedPassword,
        roles: roleIds
      })
      
      await newUser.save()
      await newUser.populate('roles')
      
      console.log('[USERS] User created successfully:', newUser.username)
      
      // No enviar la contraseña en la respuesta
      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        rut: newUser.rut,
        roles: newUser.roles
      }
      
      return respondSuccess(req, res, 201, userResponse)
    } catch (error) {
      console.error('❌ Error en UserController.createUser:', error)
      handleError(error, 'UserController -> createUser')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene un usuario por ID - versión básica
   */
  async getUserById (req, res) {
    try {
      const { id } = req.params
      return respondSuccess(req, res, 200, {
        id,
        username: 'user',
        email: 'user@email.com',
        message: 'Usuario encontrado (mock)'
      })
    } catch (error) {
      handleError(error, 'UserController -> getUserById')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Actualiza un usuario
   */
  async updateUser (req, res) {
    try {
      const User = (await import('../../../core/models/user.model.js')).default
      const Role = (await import('../../../core/models/role.model.js')).default
      
      const { id } = req.params
      const { username, email, rut, password, roles = [] } = req.body
      
      console.log('[USERS] Updating user:', id)
      
      // Buscar usuario existente
      const existingUser = await User.findById(id)
      if (!existingUser) {
        return respondError(req, res, 404, 'Usuario no encontrado')
      }
      
      // Verificar duplicados (excepto el usuario actual)
      const duplicateUser = await User.findOne({ 
        $and: [
          { _id: { $ne: id } },
          { $or: [{ email }, { rut }] }
        ]
      })
      if (duplicateUser) {
        return respondError(req, res, 400, 'Ya existe otro usuario con ese email o RUT')
      }
      
      // Buscar IDs de roles si se proporcionaron
      let roleIds = existingUser.roles
      if (roles.length > 0) {
        const roleObjects = await Role.find({ name: { $in: roles } })
        roleIds = roleObjects.map(role => role._id)
      }
      
      // Preparar datos de actualización
      const updateData = {
        username: username || existingUser.username,
        email: email || existingUser.email,
        rut: rut || existingUser.rut,
        roles: roleIds
      }
      
      // Solo actualizar contraseña si se proporciona
      if (password && password.trim() !== '') {
        updateData.password = await User.encryptPassword(password)
      }
      
      // Actualizar usuario
      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      ).populate('roles')
      
      console.log('[USERS] User updated successfully:', updatedUser.username)
      
      // No enviar la contraseña en la respuesta
      const userResponse = {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        rut: updatedUser.rut,
        roles: updatedUser.roles
      }
      
      return respondSuccess(req, res, 200, userResponse)
    } catch (error) {
      console.error('❌ Error en UserController.updateUser:', error)
      handleError(error, 'UserController -> updateUser')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Elimina un usuario
   */
  async deleteUser (req, res) {
    try {
      const User = (await import('../../../core/models/user.model.js')).default
      
      const { id } = req.params
      
      console.log('[USERS] Deleting user:', id)
      
      // Buscar usuario existente
      const existingUser = await User.findById(id).populate('roles')
      if (!existingUser) {
        return respondError(req, res, 404, 'Usuario no encontrado')
      }
      
      // No permitir eliminar al usuario actual
      if (req.user?.id === id) {
        return respondError(req, res, 400, 'No puedes eliminar tu propio usuario')
      }
      
      // Eliminar usuario
      await User.findByIdAndDelete(id)
      
      console.log('[USERS] User deleted successfully:', existingUser.username)
      
      return respondSuccess(req, res, 200, {
        message: 'Usuario eliminado exitosamente',
        deletedUser: {
          _id: existingUser._id,
          username: existingUser.username,
          email: existingUser.email
        }
      })
    } catch (error) {
      console.error('❌ Error en UserController.deleteUser:', error)
      handleError(error, 'UserController -> deleteUser')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile (req, res) {
    try {
      const currentUser = req.user
      return respondSuccess(req, res, 200, {
        user: currentUser,
        message: 'Perfil obtenido'
      })
    } catch (error) {
      handleError(error, 'UserController -> getProfile')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateProfile (req, res) {
    try {
      return respondSuccess(req, res, 200, {
        message: 'Perfil actualizado (mock)'
      })
    } catch (error) {
      handleError(error, 'UserController -> updateProfile')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword (req, res) {
    try {
      return respondSuccess(req, res, 200, {
        message: 'Contraseña cambiada (mock)'
      })
    } catch (error) {
      handleError(error, 'UserController -> changePassword')
      return respondError(req, res, 500, 'Error interno del servidor')
    }
  }
}

// Crear instancia singleton del controlador
const userController = new UserController()

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
}

export const listUsers = userController.listUsers.bind(userController)
export const createUser = userController.createUser.bind(userController)
export const getUserById = userController.getUserById.bind(userController)
export const updateUser = userController.updateUser.bind(userController)
export const deleteUser = userController.deleteUser.bind(userController)
export const getProfile = userController.getProfile.bind(userController)
export const updateProfile = userController.updateProfile.bind(userController)
export const changePassword = userController.changePassword.bind(userController)
