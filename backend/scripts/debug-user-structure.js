/**
 * Script de debug para verificar la estructura de usuarios en MongoDB
 */
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import Role from '../src/models/role.model.js';
import { MONGODB_URI } from '../src/config/configEnv.js';

async function debugUserStructure() {
  try {
    console.log('🔍 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');
    
    console.log('\n📊 ANÁLISIS DE ROLES:');
    const roles = await Role.find();
    console.log('Roles encontrados:', roles.length);
    roles.forEach(role => {
      console.log(`  - ${role.name} (ID: ${role._id})`);
    });
    
    console.log('\n📊 ANÁLISIS DE USUARIOS:');
    const users = await User.find().populate('roles');
    console.log('Usuarios encontrados:', users.length);
    
    users.forEach(user => {
      console.log(`\n👤 Usuario: ${user.email}`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - Username: ${user.username || 'N/A'}`);
      console.log(`  - Roles (${user.roles?.length || 0}):`);
      if (user.roles && user.roles.length > 0) {
        user.roles.forEach(role => {
          console.log(`    * ${role.name} (ID: ${role._id})`);
        });
      } else {
        console.log('    ⚠️  Sin roles asignados');
      }
      console.log(`  - Status: ${user.status || 'N/A'}`);
      console.log(`  - Creado: ${user.createdAt || 'N/A'}`);
    });
    
    // Buscar usuarios específicos que podrían estar causando problemas
    console.log('\n🔍 BÚSQUEDA DE USUARIO ESPECÍFICO:');
    const testEmail = 'admin@email.com'; // Email del ejemplo en los logs
    const testUser = await User.findOne({ email: testEmail }).populate('roles');
    
    if (testUser) {
      console.log(`✅ Usuario encontrado: ${testEmail}`);
      console.log('Datos completos:', JSON.stringify({
        id: testUser._id,
        email: testUser.email,
        username: testUser.username,
        roles: testUser.roles?.map(r => ({ id: r._id, name: r.name })),
        status: testUser.status
      }, null, 2));
    } else {
      console.log(`❌ Usuario NO encontrado: ${testEmail}`);
    }
    
    console.log('\n✅ Análisis completado');
    
  } catch (error) {
    console.error('💥 Error en análisis:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  debugUserStructure().catch(console.error);
}

export default debugUserStructure;