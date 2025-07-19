import mongoose from 'mongoose';
import Role from './src/models/role.model.js';
import User from './src/models/user.model.js';
import { createRoles, createUsers } from './src/config/initialSetup.js';

// Conectar a la base de datos
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/escuela-musica';

async function checkAndCreateTestUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar roles existentes
    const roleCount = await Role.estimatedDocumentCount();
    console.log(`📊 Roles en la base de datos: ${roleCount}`);
    
    if (roleCount === 0) {
      await createRoles();
      console.log('✅ Roles creados');
    }

    // Verificar usuarios existentes
    const userCount = await User.estimatedDocumentCount();
    console.log(`👥 Usuarios en la base de datos: ${userCount}`);

    if (userCount === 0) {
      await createUsers();
      console.log('✅ Usuarios de prueba creados');
    } else {
      console.log('\n👤 Usuarios existentes:');
      const users = await User.find().populate('roles');
      users.forEach(user => {
        const roleNames = user.roles.map(role => role.name).join(', ');
        console.log(`  - ${user.email} (${roleNames})`);
      });
      
      // Verificar si existe el profesor
      const profesor = await User.findOne({ email: 'profesor@email.com' });
      if (!profesor) {
        console.log('\n⚠️  Usuario profesor no encontrado. Creando...');
        const profesorRole = await Role.findOne({ name: 'profesor' });
        
        const newProfesor = new User({
          username: 'profesor',
          email: 'profesor@email.com',
          rut: '87654321-0',
          password: await User.encryptPassword('profesor123'),
          roles: [profesorRole._id],
        });
        
        await newProfesor.save();
        console.log('✅ Usuario profesor creado');
      }
    }

    console.log('\n🎯 Usuarios de prueba disponibles:');
    console.log('  👤 user@email.com / user123 (rol: user)');
    console.log('  👨‍🏫 profesor@email.com / profesor123 (rol: profesor)');
    console.log('  👨‍💼 admin@email.com / admin123 (rol: admin)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

checkAndCreateTestUsers();
