import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from './src/core/config/configEnv.js';

// Función para verificar un token JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
    console.log('✅ Token válido');
    console.log('📋 Datos del token:', {
      email: decoded.email,
      id: decoded.id,
      roles: decoded.roles,
      rolesLength: decoded.roles?.length
    });
    return decoded;
  } catch (error) {
    console.log('❌ Token inválido:', error.message);
    return null;
  }
}

// Función para simular el middleware de autorización
function checkAdminAccess(roles) {
  console.log('🔍 Verificando acceso de administrador...');
  console.log('📋 Roles recibidos:', roles);
  
  if (!Array.isArray(roles)) {
    console.log('❌ Roles no es un array');
    return false;
  }
  
  const normalizedRoles = roles.map(role => {
    if (typeof role === 'object' && role !== null) {
      if (role.name) {
        return role.name;
      }
      if (role._id) {
        return role._id.toString();
      }
    }
    return role.toString();
  });
  
  console.log('📋 Roles normalizados:', normalizedRoles);
  
  const isAdmin = normalizedRoles.some(role => 
    role === 'administrador' || 
    role === 'admin' || 
    role === '687dbca578c6f5e67d2dca07'
  );
  
  console.log('🔐 ¿Es administrador?', isAdmin);
  return isAdmin;
}

// Función principal
function main() {
  console.log('🔍 Verificador de Estado de Autenticación');
  console.log('=====================================\n');
  
  // Obtener token del argumento de línea de comandos
  const token = process.argv[2];
  
  if (!token) {
    console.log('❌ No se proporcionó token');
    console.log('Uso: node test-auth-status.js <token>');
    return;
  }
  
  console.log('🔑 Token proporcionado:', token.substring(0, 20) + '...');
  
  // Verificar token
  const decoded = verifyToken(token);
  
  if (decoded) {
    // Verificar acceso de administrador
    checkAdminAccess(decoded.roles);
  }
}

main(); 