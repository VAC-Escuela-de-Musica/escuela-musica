// Script avanzado para migrar los roles de los usuarios a strings (nombres de roles) usando la colección de roles si existe
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { DB_URL } from "../src/config/configEnv.js";

// Si tienes una colección de roles, descomenta e importa el modelo
// import Role from "../src/models/role.model.js";

// Mapea manualmente los ObjectId de roles conocidos a sus nombres
const roleIdToName = {
  // Reemplaza estos valores por los reales de tu colección de roles
  "6858fce230c92ff1dd970fea": "administrador",
  // Agrega aquí otros IDs y nombres si es necesario
};

async function fixUserRolesAdvanced() {
  await mongoose.connect(DB_URL);
  const users = await User.find();
  let updated = 0;
  for (const user of users) {
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      // Si el rol es un ObjectId, intenta mapearlo al nombre
      const newRoles = user.roles.map(r => {
        if (typeof r === "string" && roleIdToName[r]) return roleIdToName[r];
        if (typeof r === "string" && Object.values(roleIdToName).includes(r)) return r;
        // Si ya es un nombre válido, lo deja igual
        return r;
      });
      user.roles = newRoles;
      await user.save();
      updated++;
      console.log(`Usuario ${user.email} actualizado a roles:`, user.roles);
    }
  }
  console.log(`Usuarios actualizados: ${updated}`);
  await mongoose.disconnect();
}

fixUserRolesAdvanced().catch(err => {
  console.error("Error al migrar roles de usuarios:", err);
  process.exit(1);
});
