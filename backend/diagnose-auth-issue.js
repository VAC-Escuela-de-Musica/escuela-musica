import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from './src/core/config/configEnv.js';
import User from './src/core/models/user.model.js';
import Alumno from './src/core/models/alumnos.model.js';
import { connectDB } from './src/core/config/configDB.js';

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnóstico completo del problema de autenticación');
  console.log('================================================\n');
  
  try {
    // Conectar a la base de datos
    await connectDB();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Obtener token del argumento de línea de comandos
    const token = process.argv[2];
    
    if (!token) {
      console.log('❌ No se proporcionó token');
      console.log('Uso: node diagnose-auth-issue.js <token>');
      return;
    }
    
    console.log('🔑 Token proporcionado:', token.substring(0, 20) + '...');
    
    // 1. Verificar token JWT
    console.log('\n📋 1. Verificando token JWT...');
    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_JWT_SECRET);
      console.log('✅ Token JWT válido');
      console.log('📋 Datos del token:', {
        email: decoded.email,
        id: decoded.id,
        roles: decoded.roles,
        rolesLength: decoded.roles?.length
      });
    } catch (error) {
      console.log('❌ Token JWT inválido:', error.message);
      return;
    }
    
    // 2. Buscar usuario en la base de datos
    console.log('\n📋 2. Buscando usuario en la base de datos...');
    let user = await User.findOne({ email: decoded.email }).populate('roles');
    
    if (user) {
      console.log('✅ Usuario encontrado en colección User');
      console.log('📋 Datos del usuario:', {
        id: user._id,
        email: user.email,
        roles: user.roles,
        status: user.status
      });
    } else {
      console.log('⚠️ Usuario no encontrado en colección User, buscando en Alumnos...');
      user = await Alumno.findOne({ email: decoded.email });
      
      if (user) {
        console.log('✅ Usuario encontrado en colección Alumno');
        console.log('📋 Datos del alumno:', {
          id: user._id,
          email: user.email,
          nombreAlumno: user.nombreAlumno,
          status: user.status
        });
      } else {
        console.log('❌ Usuario no encontrado en ninguna colección');
        return;
      }
    }
    
    // 3. Verificar roles
    console.log('\n📋 3. Verificando roles...');
    let roles = [];
    
    if (user.roles) {
      if (Array.isArray(user.roles)) {
        roles = user.roles.map(role => {
          if (typeof role === 'object' && role !== null) {
            return role.name || role._id?.toString();
          }
          return role.toString();
        });
      } else {
        roles = [user.roles.toString()];
      }
    }
    
    console.log('📋 Roles del usuario:', roles);
    
    // 4. Verificar permisos de administrador
    console.log('\n📋 4. Verificando permisos de administrador...');
    const isAdmin = roles.some(role => 
      role === 'administrador' || 
      role === 'admin' || 
      role === '687dbca578c6f5e67d2dca07'
    );
    
    console.log('🔐 ¿Es administrador?', isAdmin);
    
    // 5. Simular middleware de autorización
    console.log('\n📋 5. Simulando middleware de autorización...');
    
    // Simular req.user
    const reqUser = {
      email: decoded.email,
      roles: decoded.roles,
      id: decoded.id || decoded._id
    };
    
    console.log('📋 req.user simulado:', reqUser);
    
    // Verificar si el usuario tiene permisos para la ruta
    if (!reqUser) {
      console.log('❌ req.user no está definido');
    } else if (!reqUser.roles || reqUser.roles.length === 0) {
      console.log('❌ Usuario no tiene roles asignados');
    } else {
      console.log('✅ Usuario tiene roles asignados');
      console.log('✅ Usuario autenticado correctamente');
    }
    
    // 6. Recomendaciones
    console.log('\n📋 6. Recomendaciones:');
    
    if (!isAdmin) {
      console.log('⚠️ El usuario no es administrador');
      console.log('💡 Considera agregar permisos específicos para esta ruta');
    }
    
    if (!user.status || user.status === 'inactive') {
      console.log('⚠️ El usuario está inactivo');
      console.log('💡 Verifica el estado del usuario en la base de datos');
    }
    
    console.log('✅ Diagnóstico completado');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  }
}

diagnoseAuthIssue(); 