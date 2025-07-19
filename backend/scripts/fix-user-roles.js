"use strict";

import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import { DB_URL } from "../src/config/configEnv.js";

/**
 * Script para verificar y corregir los roles de usuarios
 */
async function fixUserRoles() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(DB_URL);
    console.log("✅ Conectado a la base de datos");

    // Obtener todos los usuarios
    const users = await User.find({});
    console.log(`📊 Encontrados ${users.length} usuarios`);

    for (const user of users) {
      console.log(`\n👤 Usuario: ${user.email}`);
      console.log("   Roles actuales:", user.roles);
      console.log("   Tipo de roles:", typeof user.roles);
      console.log("   Es array:", Array.isArray(user.roles));

      // Verificar si los roles son IDs de MongoDB (24 caracteres hexadecimales)
      const hasMongoIds = user.roles.some((role) => 
        typeof role === "string" && role.length === 24 && /^[0-9a-fA-F]{24}$/.test(role),
      );

      if (hasMongoIds) {
        console.log("   ⚠️  Usuario tiene roles como IDs de MongoDB");
        
        // Corregir roles para el usuario admin
        if (user.email === "admin@email.com") {
          console.log("   🔧 Corrigiendo roles para admin...");
          user.roles = ["administrador"];
          await user.save();
          console.log("   ✅ Roles corregidos:", user.roles);
        } else if (user.email === "user@email.com") {
          // Corregir roles para el usuario normal
          console.log("   🔧 Corrigiendo roles para user...");
          user.roles = ["estudiante"];
          await user.save();
          console.log("   ✅ Roles corregidos:", user.roles);
        }
      } else {
        console.log("   ✅ Roles ya están como strings");
      }
    }

    console.log("\n🎉 Proceso completado");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de la base de datos");
  }
}

// Ejecutar el script
fixUserRoles(); 