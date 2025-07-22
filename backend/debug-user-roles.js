// debug-user-roles.js
// Script para verificar los roles de todos los usuarios en la base de datos MongoDB



import mongoose from "mongoose";
import User from "./src/models/user.model.js";
import Role from "./src/models/role.model.js";
import dotenv from "dotenv";
import path from "path";

// Cargar variables de entorno desde /backend/.env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI = process.env.DB_URL || process.env.MONGO_URI || "mongodb://localhost:27017/escuela-musica";

async function main() {
  try {
    // Timeout de conexión (10 segundos)
    const timeout = setTimeout(() => {
      console.error("⏰ Timeout de conexión a MongoDB");
      process.exit(1);
    }, 10000);

    await mongoose.connect(MONGO_URI);
    clearTimeout(timeout);
    console.log("Conectado a MongoDB");

    const users = await User.find({}).populate("roles");
    console.log(`Usuarios encontrados: ${users.length}`);

    users.forEach(user => {
      let roles;
      if (Array.isArray(user.roles) && user.roles.length > 0) {
        roles = user.roles.map(r => r.name || r._id || r).join(", ");
      } else {
        roles = "Sin roles";
      }
      console.log(`- ${user.username || user.email} [ID: ${user._id}]: ${roles}`);
    });

    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  } catch (err) {
    console.error("Error ejecutando el script:", err);
    process.exit(1);
  }
}

main();
