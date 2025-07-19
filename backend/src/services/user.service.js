"use strict";
// Importa el modelo de datos 'User'
import User from "../models/user.model.js";
// import Role from "../models/role.model.js";
import ROLES from "../constants/roles.constants.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todos los usuarios de la base de datos
 * @returns {Promise} Promesa con el objeto de los usuarios
 */
async function getUsers() {
  try {
    const users = await User.find()
      .select("-password")
      .exec();
    if (!users) return [null, "No hay usuarios"];

    return [users, null];
  } catch (error) {
    handleError(error, "user.service -> getUsers");
  }
}

/**
 * Crea un nuevo usuario en la base de datos
 * @param {Object} user Objeto de usuario
 * @returns {Promise} Promesa con el objeto de usuario creado
 */
async function createUser(user) {
  try {
    const { username, rut, email, password, roles } = user;

    const userFound = await User.findOne({ email: email });
    if (userFound) return [null, "El usuario ya existe"];

    // Validar que todos los roles existan en ROLES
    const validRoles = roles.every((role) => ROLES.includes(role));
    if (!validRoles) return [null, "El rol no existe"];

    const newUser = new User({
      username,
      rut,
      email,
      password: await User.encryptPassword(password),
      roles, // array de strings
    });
    await newUser.save();

    return [newUser, null];
  } catch (error) {
    handleError(error, "user.service -> createUser");
  }
}

/**
 * Obtiene un usuario por su id de la base de datos
 * @param {string} Id del usuario
 * @returns {Promise} Promesa con el objeto de usuario
 */
async function getUserById(id) {
  try {
    const user = await User.findById({ _id: id })
      .select("-password")
      .exec();

    if (!user) return [null, "El usuario no existe"];

    return [user, null];
  } catch (error) {
    handleError(error, "user.service -> getUserById");
  }
}

/**
 * Actualiza un usuario por su id en la base de datos
 * @param {string} id Id del usuario
 * @param {Object} user Objeto de usuario
 * @returns {Promise} Promesa con el objeto de usuario actualizado
 */
async function updateUser(id, user) {
  try {
    const userFound = await User.findById(id);
    if (!userFound) return [null, "El usuario no existe"];

    const { username, email, rut, password, newPassword, roles } = user;

    // Solo verificar contraseña si se proporciona una nueva
    if (newPassword && newPassword.trim() !== "") {
      const matchPassword = await User.comparePassword(
        password,
        userFound.password,
      );

      if (!matchPassword) {
        return [null, "La contraseña actual no coincide"];
      }
    }

    // Validar que todos los roles existan en ROLES
    const validRoles = roles.every((role) => ROLES.includes(role));
    if (!validRoles) return [null, "El rol no existe"];

    // Preparar los datos de actualización
    const updateData = {
      username,
      email,
      rut,
      roles,
    };

    // Solo actualizar contraseña si se proporciona una nueva
    if (newPassword && newPassword.trim() !== "") {
      updateData.password = await User.encryptPassword(newPassword);
    }

    const userUpdated = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return [userUpdated, null];
  } catch (error) {
    handleError(error, "user.service -> updateUser");
  }
}

/**
 * Elimina un usuario por su id de la base de datos
 * @param {string} Id del usuario
 * @returns {Promise} Promesa con el objeto de usuario eliminado
 */
async function deleteUser(id) {
  try {
    return await User.findByIdAndDelete(id);
  } catch (error) {
    handleError(error, "user.service -> deleteUser");
  }
}

export default {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
