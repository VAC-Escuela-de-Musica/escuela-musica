// Script para crear los roles por defecto en la colección 'roles'
import mongoose from "mongoose";
import Role from "../src/models/role.model.js";
import { DB_URL } from "../src/config/configEnv.js";
import ROLES from "../src/constants/roles.constants.js";

async function createDefaultRoles() {
  await mongoose.connect(DB_URL);
  for (const name of ROLES) {
    const exists = await Role.findOne({ name });
    if (!exists) {
      await Role.create({ name });
      console.log(`Rol creado: ${name}`);
    } else {
      console.log(`Rol ya existe: ${name}`);
    }
  }
  await mongoose.disconnect();
  console.log("Roles por defecto verificados/creados.");
}

createDefaultRoles().catch(err => {
  console.error("Error al crear roles por defecto:", err);
  process.exit(1);
});
