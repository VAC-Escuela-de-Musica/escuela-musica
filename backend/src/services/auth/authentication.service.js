"use strict";

/** Modelo de datos 'User' */
import User from "../../models/user.model.js";
/** Modulo 'jsonwebtoken' para crear tokens */
import jwt from "jsonwebtoken";

import { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } from "../../config/configEnv.js";

import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Inicia sesión con un usuario.
 * @async
 * @function login
 * @param {Object} user - Objeto de usuario
 * @returns {Object} Respuesta estandarizada
 */
async function login(user) {
  try {
    const { email, password } = user;
    console.log("Intentando login con:", email);
    
    const userFound = await User.findOne({ email: email })
      .populate("roles")
      .exec();
    
    console.log("Usuario encontrado:", userFound ? userFound.email : null);
    
    if (!userFound) {
      return {
        success: false,
        error: "El usuario y/o contraseña son incorrectos",
        data: null
      };
    }

    const matchPassword = await User.comparePassword(password, userFound.password);
    console.log("¿Contraseña coincide?", matchPassword);

    if (!matchPassword) {
      return {
        success: false,
        error: "El usuario y/o contraseña son incorrectos",
        data: null
      };
    }

    const accessToken = jwt.sign(
      { email: userFound.email, roles: userFound.roles },
      ACCESS_JWT_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
      { email: userFound.email },
      REFRESH_JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userFound._id,
          email: userFound.email,
          username: userFound.username,
          roles: userFound.roles
        }
      },
      error: null
    };
  } catch (error) {
    handleError(error, "authentication.service -> login");
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

/**
 * Refresca el token de acceso
 * @async
 * @function refresh
 * @param {Object} cookies - Objeto de cookies
 * @returns {Object} Respuesta estandarizada
 */
async function refresh(cookies) {
  try {
    if (!cookies.jwt) {
      return {
        success: false,
        error: "No hay autorización",
        data: null
      };
    }

    const refreshToken = cookies.jwt;

    return new Promise((resolve) => {
      jwt.verify(refreshToken, REFRESH_JWT_SECRET, async (err, user) => {
        if (err) {
          return resolve({
            success: false,
            error: "La sesión ha caducado, vuelva a iniciar sesión",
            data: null
          });
        }

        const userFound = await User.findOne({ email: user.email })
          .populate("roles")
          .exec();

        if (!userFound) {
          return resolve({
            success: false,
            error: "Usuario no autorizado",
            data: null
          });
        }

        const accessToken = jwt.sign(
          { email: userFound.email, roles: userFound.roles },
          ACCESS_JWT_SECRET,
          { expiresIn: "1d" }
        );

        resolve({
          success: true,
          data: {
            accessToken,
            user: {
              id: userFound._id,
              email: userFound.email,
              username: userFound.username,
              roles: userFound.roles
            }
          },
          error: null
        });
      });
    });
  } catch (error) {
    handleError(error, "authentication.service -> refresh");
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

export default { login, refresh };
