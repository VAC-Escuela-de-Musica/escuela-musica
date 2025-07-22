#!/usr/bin/env node
/**
 * Script de migración: Convierte roles de String a ObjectId references
 * 
 * Este script:
 * 1. Crea documentos Role si no existen
 * 2. Convierte los roles string en el modelo User a ObjectId references
 * 3. Mantiene la integridad de los datos
 */

import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Role from './src/models/role.model.js';
import ROLES from './src/constants/roles.constants.js';
import { DB_URL } from './src/config/configEnv.js';

console.log('🚀 Iniciando migración de roles...');

async function connectDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function createRoleDocuments() {
  console.log('📝 Creando documentos Role...');
  
  const roleMap = new Map();
  
  for (const roleName of ROLES) {
    let role = await Role.findOne({ name: roleName });
    
    if (!role) {
      role = new Role({ name: roleName });
      await role.save();
      console.log(`✨ Creado rol: ${roleName}`);
    } else {
      console.log(`✓ Rol ya existe: ${roleName}`);
    }
    
    roleMap.set(roleName, role._id);
  }
  
  return roleMap;
}

async function migrateUsers(roleMap) {
  console.log('👥 Migrando usuarios...');
  
  // Buscar usuarios que tengan roles como strings
  const users = await User.find().lean();
  
  console.log(`📊 Encontrados ${users.length} usuarios para revisar`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    try {
      // Verificar si ya tiene ObjectIds (migration ya ejecutada)
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        
        // Si es ObjectId, skip
        if (mongoose.Types.ObjectId.isValid(firstRole) && typeof firstRole === 'object') {
          console.log(`⏭️  Usuario ${user.email} ya migrado`);
          skippedCount++;
          continue;
        }
        
        // Si son strings, migrar
        if (typeof firstRole === 'string') {
          const newRoleIds = [];
          
          for (const roleString of user.roles) {
            const roleId = roleMap.get(roleString);
            if (roleId) {
              newRoleIds.push(roleId);
            } else {
              console.warn(`⚠️  Rol desconocido para usuario ${user.email}: ${roleString}`);
            }
          }
          
          if (newRoleIds.length > 0) {
            await User.updateOne(
              { _id: user._id },
              { roles: newRoleIds }
            );
            
            console.log(`✅ Migrado usuario ${user.email}: ${user.roles.join(', ')} → ObjectIds`);
            migratedCount++;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error migrando usuario ${user.email}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📈 Resumen de migración:`);
  console.log(`  ✅ Migrados: ${migratedCount}`);
  console.log(`  ⏭️  Ya migrados: ${skippedCount}`);
  console.log(`  ❌ Errores: ${errorCount}`);
}

async function verifyMigration(roleMap) {
  console.log('\n🔍 Verificando migración...');
  
  // Verificar que todos los usuarios tengan ObjectIds
  const users = await User.find().populate('roles');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    try {
      if (user.roles && user.roles.length > 0) {
        // Verificar que roles sean objetos con name property
        const hasValidRoles = user.roles.every(role => 
          role && typeof role === 'object' && role.name
        );
        
        if (hasValidRoles) {
          console.log(`✅ Usuario ${user.email}: roles = [${user.roles.map(r => r.name).join(', ')}]`);
          successCount++;
        } else {
          console.error(`❌ Usuario ${user.email}: roles inválidos`);
          errorCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error verificando usuario ${user.email}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Verificación completa:`);
  console.log(`  ✅ Usuarios correctos: ${successCount}`);
  console.log(`  ❌ Usuarios con errores: ${errorCount}`);
  
  return errorCount === 0;
}

async function main() {
  try {
    await connectDB();
    
    // Paso 1: Crear documentos Role
    const roleMap = await createRoleDocuments();
    
    // Paso 2: Migrar usuarios
    await migrateUsers(roleMap);
    
    // Paso 3: Verificar migración
    const success = await verifyMigration(roleMap);
    
    if (success) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
      console.log('   Los roles ahora son referencias ObjectId al modelo Role');
      console.log('   El populate funcionará correctamente');
    } else {
      console.log('\n⚠️  Migración completada con algunos errores');
      console.log('   Revisa los errores anteriores');
    }
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar migración
main().catch(console.error);