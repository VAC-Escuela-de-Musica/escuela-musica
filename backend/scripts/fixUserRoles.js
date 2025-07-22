// Script para migrar los roles de los usuarios a strings (nombres de roles)
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { DB_URL } from "../src/config/configEnv.js";

async function fixUserRoles() {
  await mongoose.connect(DB_URL);
  const users = await User.find();
  let updated = 0;
  for (const user of users) {
    // Si el rol es un array de strings con IDs, reemplazar por "administrador" si es admin
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      // Solo permitir roles 'administrador' y 'profesor'
      if (user.roles.includes("admin") || user.email === "admin@email.com" || user.username === "admin") {
        user.roles = ["administrador"];
      } else if (user.roles.includes("profesor") || user.username?.toLowerCase().includes("profesor")) {
        user.roles = ["profesor"];
      } else {
        // Si no coincide, asignar 'profesor' por defecto o dejar vacío
        user.roles = ["profesor"];
      }
      await user.save();
      updated++;
      console.log(`Usuario ${user.email} actualizado a roles:`, user.roles);
    }
  }
  console.log(`Usuarios actualizados: ${updated}`);
  await mongoose.disconnect();
}

fixUserRoles().catch(err => {
  console.error("Error al migrar roles de usuarios:", err);
  process.exit(1);
});
