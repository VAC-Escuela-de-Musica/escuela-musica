import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './src/models/role.model.js';
import User from './src/models/user.model.js';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
const MONGODB_URI = process.env.DB_URL || 'mongodb://localhost:27017/escuela-musica';

async function addProfesorUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si el profesor ya existe
    const existingProfesor = await User.findOne({ email: 'profesor@email.com' });
    if (existingProfesor) {
      console.log('⚠️  El usuario profesor ya existe');
      return;
    }

    // Buscar o crear el rol profesor
    let profesorRole = await Role.findOne({ name: 'profesor' });
    if (!profesorRole) {
      profesorRole = new Role({ name: 'profesor' });
      await profesorRole.save();
      console.log('✅ Rol profesor creado');
    }

    // Crear el usuario profesor
    const profesor = new User({
      username: 'profesor',
      email: 'profesor@email.com',
      rut: '87654321-0',
      password: await User.encryptPassword('profesor123'),
      roles: [profesorRole._id],
    });

    await profesor.save();
    console.log('✅ Usuario profesor creado exitosamente');
    console.log('📧 Email: profesor@email.com');
    console.log('🔐 Contraseña: profesor123');

    // Verificar todos los usuarios
    console.log('\n👥 Usuarios en la base de datos:');
    const users = await User.find().populate('roles');
    users.forEach(user => {
      const roleNames = user.roles.map(role => role.name).join(', ');
      console.log(`  - ${user.email} (${roleNames})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

addProfesorUser();
