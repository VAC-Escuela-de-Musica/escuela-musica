// Script para probar permisos de eliminación de materiales
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:1230';
let csrfToken = null;

// Función para obtener token CSRF
async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/api/csrf-token`);
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('❌ Error obteniendo token CSRF:', error.message);
    return null;
  }
}

// Función para hacer login
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '_csrf': csrfToken
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.accessToken;
    } else {
      console.error(`❌ Error login ${email}:`, data.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error login ${email}:`, error.message);
    return null;
  }
}

// Función para obtener materiales existentes
async function getMaterials(token) {
  try {
    const response = await fetch(`${API_BASE}/api/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        '_csrf': csrfToken
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.documents || data.data || [];
    } else {
      console.error('❌ Error obteniendo materiales:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Error obteniendo materiales:', error.message);
    return [];
  }
}

// Función para eliminar material
async function deleteMaterial(materialId, token) {
  try {
    const response = await fetch(`${API_BASE}/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        '_csrf': csrfToken
      }
    });
    
    const data = await response.json();
    return { success: data.success, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testMaterialDeletion() {
  console.log('🧪 Iniciando prueba de eliminación de materiales...');
  
  // Obtener token CSRF
  console.log('\n🔐 Obteniendo token CSRF...');
  csrfToken = await getCsrfToken();
  if (!csrfToken) {
    console.log('❌ No se pudo obtener token CSRF');
    return;
  }
  console.log('🔐 Token CSRF obtenido:', csrfToken.substring(0, 20) + '...');
  
  // Autenticar usuarios
  console.log('\n👤 Autenticando como admin...');
  const adminToken = await login('admin@email.com', 'admin123');
  if (!adminToken) {
    console.log('❌ No se pudo autenticar como admin');
    return;
  }
  console.log('✅ Admin autenticado');
  
  console.log('\n👤 Autenticando como user...');
  const userToken = await login('user@email.com', 'user123');
  if (!userToken) {
    console.log('❌ No se pudo autenticar como user');
    return;
  }
  console.log('✅ User autenticado');
  
  // Obtener materiales existentes
  console.log('\n📋 Obteniendo materiales existentes...');
  const materials = await getMaterials(adminToken);
  console.log(`📋 Se encontraron ${materials.length} materiales`);
  
  if (materials.length === 0) {
    console.log('⚠️ No hay materiales para probar eliminación');
    return;
  }
  
  // Mostrar información de los materiales
  materials.forEach((material, index) => {
    console.log(`📄 Material ${index + 1}:`);
    console.log(`   - ID: ${material._id}`);
    console.log(`   - Nombre: ${material.nombre}`);
    console.log(`   - Usuario: ${material.usuario}`);
    console.log(`   - Bucket: ${material.bucketTipo}`);
  });
  
  // Probar eliminación con diferentes usuarios
  const testMaterial = materials[0];
  console.log(`\n🗑️ Probando eliminación del material: ${testMaterial.nombre}`);
  console.log(`   - Creado por: ${testMaterial.usuario}`);
  
  // Prueba 1: Usuario normal intenta eliminar material
  console.log('\n🧪 Prueba 1: Usuario normal intenta eliminar material...');
  const userDeleteResult = await deleteMaterial(testMaterial._id, userToken);
  if (userDeleteResult.success) {
    console.log('✅ Usuario pudo eliminar el material');
  } else {
    console.log('❌ Usuario no pudo eliminar el material:', userDeleteResult.error || userDeleteResult.data?.error);
    console.log('📊 Status:', userDeleteResult.status);
  }
  
  // Prueba 2: Admin intenta eliminar material
  console.log('\n🧪 Prueba 2: Admin intenta eliminar material...');
  const adminDeleteResult = await deleteMaterial(testMaterial._id, adminToken);
  if (adminDeleteResult.success) {
    console.log('✅ Admin pudo eliminar el material');
  } else {
    console.log('❌ Admin no pudo eliminar el material:', adminDeleteResult.error || adminDeleteResult.data?.error);
    console.log('📊 Status:', adminDeleteResult.status);
  }
  
  console.log('\n🏁 Prueba completada');
}

testMaterialDeletion().catch(console.error);