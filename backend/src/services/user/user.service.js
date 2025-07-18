"use strict";
// Importa el modelo de datos 'User'
import User from "../../models/user.model.js";
import Role from "../../models/role.model.js";
import BaseService from "../base.service.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Servicio para manejo de usuarios
 * Extiende BaseService para operaciones CRUD estándar
 */
class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Obtiene todos los usuarios de la base de datos
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async getUsers() {
    try {
      const users = await User.find()
        .select("-password")
        .populate("roles")
        .exec();
      
      if (!users) {
        return {
          success: false,
          error: "No hay usuarios",
          data: null
        };
      }

      return {
        success: true,
        data: users,
        error: null
      };
    } catch (error) {
      handleError(error, "UserService -> getUsers");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} user Objeto de usuario
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async createUser(user) {
    try {
      const { username, rut, email, password, roles } = user;

      const userFound = await User.findOne({ email: user.email });
      if (userFound) {
        return {
          success: false,
          error: "El usuario ya existe",
          data: null
        };
      }

      const rolesFound = await Role.find({ name: { $in: roles } });
      if (rolesFound.length === 0) {
        return {
          success: false,
          error: "El rol no existe",
          data: null
        };
      }
      
      const myRole = rolesFound.map((role) => role._id);

      const newUser = new User({
        username,
        rut,
        email,
        password: await User.encryptPassword(password),
        roles: myRole,
      });
      
      await newUser.save();

      return {
        success: true,
        data: newUser,
        error: null
      };
    } catch (error) {
      handleError(error, "UserService -> createUser");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene un usuario por su id de la base de datos
   * @param {string} id Id del usuario
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async getUserById(id) {
    try {
      const user = await User.findById({ _id: id })
        .select("-password")
        .populate("roles")
        .exec();

      if (!user) {
        return {
          success: false,
          error: "El usuario no existe",
          data: null
        };
      }

      return {
        success: true,
        data: user,
        error: null
      };
    } catch (error) {
      handleError(error, "UserService -> getUserById");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Actualiza un usuario por su id en la base de datos
   * @param {string} id Id del usuario
   * @param {Object} user Objeto de usuario
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async updateUser(id, user) {
    try {
      const userFound = await User.findById(id);
      if (!userFound) {
        return {
          success: false,
          error: "El usuario no existe",
          data: null
        };
      }

      const { username, email, rut, password, newPassword, roles } = user;

      const matchPassword = await User.comparePassword(
        password,
        userFound.password
      );

      if (!matchPassword) {
        return {
          success: false,
          error: "La contraseña no coincide",
          data: null
        };
      }

      const rolesFound = await Role.find({ name: { $in: roles } });
      if (rolesFound.length === 0) {
        return {
          success: false,
          error: "El rol no existe",
          data: null
        };
      }

      const myRole = rolesFound.map((role) => role._id);

      const userUpdated = await User.findByIdAndUpdate(
        id,
        {
          username,
          email,
          rut,
          password: await User.encryptPassword(newPassword || password),
          roles: myRole,
        },
        { new: true }
      );

      return {
        success: true,
        data: userUpdated,
        error: null
      };
    } catch (error) {
      handleError(error, "UserService -> updateUser");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Elimina un usuario por su id de la base de datos
   * @param {string} id Id del usuario
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async deleteUser(id) {
    try {
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return {
          success: false,
          error: "El usuario no existe",
          data: null
        };
      }

      return {
        success: true,
        data: deletedUser,
        error: null
      };
    } catch (error) {
      handleError(error, "UserService -> deleteUser");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Exportar instancia del servicio
const userService = new UserService();
export default userService;
