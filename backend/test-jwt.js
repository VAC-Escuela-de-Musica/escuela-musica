// Test para verificar que el token JWT incluye el campo 'id'
import jwt from 'jsonwebtoken';

const ACCESS_JWT_SECRET = 'test-secret';

// Simular datos de usuario
const userFound = {
  _id: '6858fecb3d1d4e1153e4da0b',
  email: 'admin@email.com',
  username: 'admin',
  roles: ['admin']
};

// Generar token como en el servicio actualizado
const accessToken = jwt.sign(
  { 
    id: userFound._id,
    email: userFound.email, 
    roles: userFound.roles 
  },
  ACCESS_JWT_SECRET,
  { expiresIn: "1d" }
);

console.log('🔐 Token generado:', accessToken);

// Verificar token
const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET);
console.log('📊 Token decodificado:', decoded);
console.log('✅ Campo id presente:', decoded.id ? 'SÍ' : 'NO');
console.log('✅ Campo email presente:', decoded.email ? 'SÍ' : 'NO');
console.log('✅ Campo roles presente:', decoded.roles ? 'SÍ' : 'NO');

// Simular middleware
const req = { user: {} };
req.user = {
  email: decoded.email,
  roles: decoded.roles,
  id: decoded.id || decoded._id
};

console.log('🎯 Usuario en middleware:', req.user);
console.log('✅ ID disponible en middleware:', req.user.id ? 'SÍ' : 'NO');
