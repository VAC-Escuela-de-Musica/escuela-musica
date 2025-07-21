"use strict";
// Importa el modelo de datos 'User'
import User from "../models/user.model.js";

/**
 * Crea los usuarios por defecto en la base de datos.
 * @async
 * @function createUsers
 * @returns {Promise<void>}
 */
async function createUsers() {
  try {
    const count = await User.estimatedDocumentCount();
    if (count > 0) return;

    await Promise.all([
      new User({
        username: "user",
        email: "user@email.com",
        rut: "12345678-9",
        password: await User.encryptPassword("user123"),
        roles: ["estudiante"], //ver si se implementa
      }).save(),
      new User({
        username: "admin",
        email: "admin@email.com",
        rut: "12345678-0",
        password: await User.encryptPassword("admin123"),
        roles: ["administrador"],
      }).save(),
    ]);
    // ...existing code...
  } catch (error) {
    // ...existing code...
  }
}

export { createUsers };
