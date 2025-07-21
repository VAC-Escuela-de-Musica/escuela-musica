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
      // Aquí puedes personalizar la lógica según tus necesidades
      // Por ejemplo, si el usuario es admin por su email o username
      if (user.email === "admin@email.com" || user.username === "admin") {
        user.roles = ["administrador"];
      } else {
        user.roles = ["estudiante"];
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
