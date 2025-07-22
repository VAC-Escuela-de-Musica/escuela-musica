import User from './src/models/user.model.js';
import Role from './src/models/role.model.js';
import mongoose from 'mongoose';
import { DB_URL } from './src/config/configEnv.js';

mongoose.connect(DB_URL).then(async () => {
  console.log('🔧 Asignando roles a usuarios...');
  
  // Buscar roles
  const adminRole = await Role.findOne({ name: 'administrador' });
  const profesorRole = await Role.findOne({ name: 'profesor' });
  
  if (!adminRole || !profesorRole) {
    console.error('❌ No se encontraron los roles necesarios');
    process.exit(1);
  }
  
  // Asignar rol de administrador al usuario admin@email.com
  const adminUser = await User.findOne({ email: 'admin@email.com' });
  if (adminUser) {
    adminUser.roles = [adminRole._id];
    await adminUser.save();
    console.log('✅ Rol administrador asignado a admin@email.com');
  }
  
  // Asignar rol de profesor al usuario user@email.com
  const userUser = await User.findOne({ email: 'user@email.com' });
  if (userUser) {
    userUser.roles = [profesorRole._id];
    await userUser.save();
    console.log('✅ Rol profesor asignado a user@email.com');
  }
  
  // Verificar cambios
  console.log('\n📊 Usuarios actualizados:');
  const users = await User.find({}).populate('roles');
  users.forEach(user => {
    console.log(`- ${user.email} | Roles: ${user.roles.map(r => r.name).join(', ')}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});