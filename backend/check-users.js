import User from './src/models/user.model.js';
import Role from './src/models/role.model.js';
import mongoose from 'mongoose';
import { DB_URL } from './src/config/configEnv.js';

mongoose.connect(DB_URL).then(async () => {
  console.log('🔍 Buscando usuarios y roles...');
  
  const roles = await Role.find({});
  console.log('Roles disponibles:', roles.map(r => ({ id: r._id, name: r.name })));
  
  const users = await User.find({}).populate('roles');
  console.log('Usuarios disponibles:');
  users.forEach(user => {
    console.log(`- ${user.email} | Roles: ${user.roles.map(r => r.name).join(', ')}`);
  });
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});