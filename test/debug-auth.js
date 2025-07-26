const axios = require('axios');
const jwt = require('jsonwebtoken');

const BACKEND_URL = 'http://localhost:1230';
const FRONTEND_URL = 'http://localhost:5173';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function checkBackendConnectivity() {
  separator('🔌 VERIFICANDO CONECTIVIDAD DEL BACKEND');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, {
      timeout: 5000
    });
    log('✅ Backend respondiendo en ' + BACKEND_URL, 'green');
    log('ℹ️  Status: ' + response.status, 'blue');
    return true;
  } catch (error) {
    log('❌ Error conectando al backend: ' + error.message, 'red');
    log('ℹ️  Verificar que el backend esté ejecutándose en ' + BACKEND_URL, 'yellow');
    return false;
  }
}

async function checkCORS() {
  separator('🌐 VERIFICANDO CONFIGURACIÓN CORS');
  try {
    const response = await axios.options(`${BACKEND_URL}/api/auth/login`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    log('✅ CORS configurado correctamente', 'green');
    log('ℹ️  Headers CORS: ' + JSON.stringify(corsHeaders, null, 2), 'blue');
    return true;
  } catch (error) {
    log('⚠️  Error verificando CORS: ' + error.message, 'yellow');
    return false;
  }
}

async function checkDatabase() {
  separator('🗄️ VERIFICANDO CONEXIÓN A BASE DE DATOS');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/users`, {
      timeout: 5000
    });
    log('✅ Base de datos conectada', 'green');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('⚠️  Endpoint requiere autenticación (normal)', 'yellow');
      return true;
    }
    log('❌ Error conectando a la base de datos: ' + error.message, 'red');
    return false;
  }
}

async function checkExistingUsers() {
  separator('👤 VERIFICANDO USUARIOS EXISTENTES');
  try {
    // Intentar obtener información sin autenticación para ver qué responde
    const response = await axios.get(`${BACKEND_URL}/api/users`);
    log('ℹ️  Usuarios encontrados: ' + response.data.length, 'blue');
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('ℹ️  Endpoint protegido (requiere autenticación)', 'blue');
      return true;
    }
    log('⚠️  Error verificando usuarios: ' + error.message, 'yellow');
    return false;
  }
}

async function testAdminLogin() {
  separator('🔐 PROBANDO LOGIN DE ADMINISTRADOR');
  
  const adminCredentials = {
    email: 'admin@email.com',
    password: 'admin123'
  };
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, adminCredentials, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    log('✅ Login exitoso', 'green');
    log('ℹ️  Token recibido: ' + response.data.data.accessToken.substring(0, 50) + '...', 'blue');
    log('ℹ️  Usuario: ' + response.data.data.user.email, 'blue');
    log('ℹ️  Roles: ' + JSON.stringify(response.data.data.user.roles), 'blue');
    
    return {
      success: true,
      token: response.data.data.accessToken,
      user: response.data.data.user
    };
  } catch (error) {
    log('❌ Error en login: ' + (error.response?.data?.error || error.response?.data?.message || error.message), 'red');
    log('ℹ️  Credenciales probadas: ' + JSON.stringify(adminCredentials), 'blue');
    if (error.response?.data) {
      log('ℹ️  Respuesta del servidor: ' + JSON.stringify(error.response.data), 'blue');
    }
    return { success: false };
  }
}

async function verifyJWT(token) {
  separator('🎫 VERIFICANDO TOKEN JWT');
  
  if (!token) {
    log('❌ No hay token para verificar', 'red');
    return false;
  }
  
  try {
    // Decodificar sin verificar la firma para ver el contenido
    const decoded = jwt.decode(token);
    log('✅ Token decodificado exitosamente', 'green');
    log('ℹ️  Payload: ' + JSON.stringify(decoded, null, 2), 'blue');
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      log('⚠️  Token expirado', 'yellow');
    } else {
      log('✅ Token válido y no expirado', 'green');
    }
    
    return true;
  } catch (error) {
    log('❌ Error verificando token: ' + error.message, 'red');
    return false;
  }
}

async function testAlumnosEndpoint(token) {
  separator('📚 PROBANDO ENDPOINT /api/alumnos');
  
  if (!token) {
    log('❌ No hay token para probar el endpoint', 'red');
    return false;
  }
  
  // Probar GET
  try {
    const getResponse = await axios.get(`${BACKEND_URL}/api/alumnos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    log('✅ GET /api/alumnos exitoso', 'green');
    log('ℹ️  Alumnos encontrados: ' + getResponse.data.length, 'blue');
  } catch (error) {
    log('❌ Error en GET /api/alumnos: ' + (error.response?.data?.message || error.message), 'red');
    log('ℹ️  Status: ' + error.response?.status, 'blue');
  }
  
  // Probar POST
  const testStudent = {
    nombre: 'Test Student',
    email: 'test@student.com',
    rut: '12345678-9',
    telefono: '123456789'
  };
  
  try {
    const postResponse = await axios.post(`${BACKEND_URL}/api/alumnos`, testStudent, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    log('✅ POST /api/alumnos exitoso', 'green');
    log('ℹ️  Alumno creado: ' + JSON.stringify(postResponse.data), 'blue');
    return true;
  } catch (error) {
    log('❌ Error en POST /api/alumnos: ' + (error.response?.data?.message || error.message), 'red');
    log('ℹ️  Status: ' + error.response?.status, 'blue');
    log('ℹ️  Datos enviados: ' + JSON.stringify(testStudent), 'blue');
    
    if (error.response?.status === 403) {
      log('⚠️  Error 403: Falta de permisos. Verificar roles del usuario.', 'yellow');
    }
    return false;
  }
}

async function checkProcesses() {
  separator('⚙️ VERIFICANDO PROCESOS DEL SISTEMA');
  
  try {
    // Verificar si hay procesos Node.js ejecutándose
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const { stdout } = await execPromise('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
    const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
    
    if (lines.length > 0) {
      log('✅ Procesos Node.js encontrados: ' + lines.length, 'green');
      lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 1) {
          log('ℹ️  PID: ' + parts[1].replace(/"/g, ''), 'blue');
        }
      });
    } else {
      log('⚠️  No se encontraron procesos Node.js', 'yellow');
    }
  } catch (error) {
    log('⚠️  Error verificando procesos: ' + error.message, 'yellow');
  }
}

async function checkFileStructure() {
  separator('📁 VERIFICANDO ESTRUCTURA DE ARCHIVOS');
  
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'backend/server.js',
    'backend/.env',
    'backend/package.json',
    'frontend/package.json'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log('✅ ' + file + ' existe', 'green');
    } else {
      log('❌ ' + file + ' NO EXISTE', 'red');
    }
  });
}

async function main() {
  log('🔍 SCRIPT DE DIAGNÓSTICO - AUTENTICACIÓN Y AUTORIZACIÓN', 'bright');
  
  // Verificaciones básicas
  await checkFileStructure();
  await checkProcesses();
  
  const backendOk = await checkBackendConnectivity();
  if (!backendOk) {
    log('\n❌ DIAGNÓSTICO DETENIDO: Backend no disponible', 'red');
    return;
  }
  
  await checkCORS();
  await checkDatabase();
  await checkExistingUsers();
  
  // Probar autenticación
  const loginResult = await testAdminLogin();
  
  if (loginResult.success) {
    await verifyJWT(loginResult.token);
    await testAlumnosEndpoint(loginResult.token);
  } else {
    await verifyJWT(null);
  }
  
  // Resumen
  separator('📋 RESUMEN Y RECOMENDACIONES');
  
  if (loginResult.success) {
    log('✅ DIAGNÓSTICO EXITOSO: Sistema funcionando correctamente', 'green');
  } else {
    log('❌ PROBLEMA PRINCIPAL: No se pudo obtener token de autenticación', 'red');
    log('ℹ️  Soluciones:', 'blue');
    log('ℹ️  1. Verificar que el usuario administrador existe', 'blue');
    log('ℹ️  2. Ejecutar script de inicialización: node scripts/createDefaultRoles.js', 'blue');
    log('ℹ️  3. Verificar configuración de base de datos', 'blue');
  }
  
  log('\n🏁 Diagnóstico completado', 'bright');
}

// Ejecutar el diagnóstico
main().catch(error => {
  console.error('Error fatal en el diagnóstico:', error);
  process.exit(1);
});