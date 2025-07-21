"use strict";
// Importa el modulo 'mongoose' para crear la conexion a la base de datos
import { connect } from "mongoose";

// Agregamos la configuracion de las variables de entorno
import { DB_URL } from "./configEnv.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Establece la conexión con la base de datos.
 * @async
 * @function setupDB
 * @throws {Error} Si no se puede conectar a la base de datos.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se establece la conexión con la base de datos.
 */

async function setupDB() {
  try {
    console.log("[DB] Intentando conectar a la base de datos...", DB_URL);
    await connect(DB_URL);
    console.log("[DB] Conexión exitosa a la base de datos");
    // ...existing code...
  } catch (err) {
    console.error("[DB] Error al conectar a la base de datos:", err);
    handleError(err, "/configDB.js -> setupDB");
  }
}

export { setupDB };
