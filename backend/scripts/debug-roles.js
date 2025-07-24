// Script para debuggear el problema de roles en la eliminación de materiales
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:1230';
let csrfToken = null;

// Función para obtener token CSRF
async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/api/csrf-token`);
    const data = await response.json();
    csrfToken = data.csrfToken;
    console.log('✅ CSRF Token obtenido:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('❌ Error obteniendo CSRF token:', error.message);
    return null;
  }
}

// Función para hacer login
async function login(email, password) {
  try {
    console.log('🔐 Intentando login con:', { email, password });
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '_csrf': csrfToken
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('🔐 Login response completa:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data
    });
    
    if (data.success) {
      return data.data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para verificar el token y ver los roles
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('🔍 Verify response:', {
      status: response.status,
      success: data.success,
      user: data.data?.user
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    return null;
  }
}

// Función para hacer una petición de prueba a materiales
async function testMaterialsEndpoint(token) {
  try {
    const response = await fetch(`${API_BASE}/api/materials`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📋 Materials response:', {
      status: response.status,
      success: data.success,
      materialsCount: data.data?.documents?.length || 0
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo materiales:', error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando debug de roles...');
  
  // Obtener CSRF token
  await getCsrfToken();
  if (!csrfToken) {
    console.error('❌ No se pudo obtener CSRF token');
    return;
  }
  
  // Probar con admin
  console.log('\n=== PROBANDO CON ADMIN ===');
  const adminToken = await login('admin@email.com', 'admin123');
  if (adminToken) {
    console.log('✅ Admin login exitoso');
    await verifyToken(adminToken);
    await testMaterialsEndpoint(adminToken);
  }
  
  // Probar con profesor
  console.log('\n=== PROBANDO CON PROFESOR ===')
  const userToken = await login('user@email.com', 'user123');
  if (userToken) {
    console.log('✅ Profesor login exitoso')
    await verifyToken(userToken);
    await testMaterialsEndpoint(userToken);
  }
}

main().catch(console.error);