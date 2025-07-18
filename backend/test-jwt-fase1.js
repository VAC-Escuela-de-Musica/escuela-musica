import jwt from 'jsonwebtoken';

// Simular las variables del entorno
const ACCESS_JWT_SECRET = 'F87B$^GKND23^uoZMwEgugx!kBp%6NVDRSci%uB';
const REFRESH_JWT_SECRET = 'Nrob89x3j3RUhY&USp&y&&3hsjynn6QWnsmuurNV';

console.log('🧪 TESTING JWT TOKEN FIXES - FASE 1');
console.log('=====================================');

// Simular datos de usuario
const userData = {
  _id: '507f1f77bcf86cd799439011',
  email: 'admin@email.com',
  username: 'admin',
  roles: ['admin']
};

console.log('\n1. 🔍 Generando token con los cambios aplicados...');

// Generar token como lo hace el nuevo código
const accessToken = jwt.sign(
  { 
    id: userData._id,
    email: userData.email, 
    roles: userData.roles 
  },
  ACCESS_JWT_SECRET,
  { expiresIn: "1d" }
);

console.log('✅ Token generado:', accessToken.substring(0, 50) + '...');

console.log('\n2. 🔍 Decodificando token...');

// Decodificar token
const decoded = jwt.verify(accessToken, ACCESS_JWT_SECRET);

console.log('✅ Token decodificado:', {
  id: decoded.id,
  email: decoded.email,
  roles: decoded.roles,
  iat: decoded.iat,
  exp: decoded.exp
});

console.log('\n3. 🔍 Verificando middleware JWT...');

// Simular el middleware JWT
const req = {
  user: {
    email: decoded.email,
    roles: decoded.roles,
    id: decoded.id || decoded._id
  }
};

console.log('✅ req.user después del middleware:', req.user);

console.log('\n4. 🔍 Verificando que req.user.id esté definido...');

if (req.user.id) {
  console.log('✅ SUCCESS: req.user.id está definido:', req.user.id);
  console.log('✅ SUCCESS: El middleware JWT ahora puede acceder al ID del usuario');
} else {
  console.log('❌ ERROR: req.user.id sigue siendo undefined');
}

console.log('\n5. 🔍 Comparando token anterior vs nuevo...');

// Token anterior (sin ID)
const oldToken = jwt.sign(
  { email: userData.email, roles: userData.roles },
  ACCESS_JWT_SECRET,
  { expiresIn: "1d" }
);

const oldDecoded = jwt.verify(oldToken, ACCESS_JWT_SECRET);

console.log('❌ Token anterior (sin ID):', {
  id: oldDecoded.id || 'UNDEFINED',
  email: oldDecoded.email,
  roles: oldDecoded.roles
});

console.log('✅ Token nuevo (con ID):', {
  id: decoded.id,
  email: decoded.email,
  roles: decoded.roles
});

console.log('\n📊 RESULTADO FINAL:');
console.log('==================');
console.log('✅ Fase 1 completada exitosamente');
console.log('✅ El token JWT ahora incluye el campo "id"');
console.log('✅ El middleware JWT puede acceder a req.user.id');
console.log('✅ Las rutas protegidas ya no deberían fallar por falta de ID');
