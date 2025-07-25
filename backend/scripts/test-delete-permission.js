// Script para probar permisos de eliminación de materiales
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:1230';

// Función para hacer login y obtener token
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    console.log('🔐 Login response:', data);
    
    if (data.success) {
      return data.data.accessToken;
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    return null;
  }
}

// Función para obtener materiales
async function getMaterials(token) {
  try {
    const response = await fetch(`${API_BASE}/api/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📚 Materials response:', data);
    
    if (data.success) {
      return data.data.documents || data.data || [];
    } else {
      throw new Error(data.error || 'Failed to get materials');
    }
  } catch (error) {
    console.error('❌ Error obteniendo materiales:', error.message);
    return [];
  }
}

// Función para intentar eliminar un material
async function deleteMaterial(token, materialId) {
  try {
    console.log(`🗑️ Intentando eliminar material: ${materialId}`);
    
    const response = await fetch(`${API_BASE}/api/materials/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('🗑️ Delete response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('❌ Error eliminando material:', error.message);
    return { success: false, error: error.message };
  }
}

// Función principal
async function testDeletePermissions() {
  console.log('🧪 Iniciando prueba de permisos de eliminación...');
  
  // Credenciales de prueba basadas en los usuarios existentes
  const testUsers = [
    { email: 'admin@email.com', password: 'admin123', role: 'admin' },
    { email: 'user@email.com', password: 'user123', role: 'user' },
    { email: 'profesor@email.com', password: 'profesor123', role: 'profesor' }
  ];
  
  for (const user of testUsers) {
    console.log(`\n👤 Probando con usuario: ${user.email} (${user.role})`);
    
    // Login
    const token = await login(user.email, user.password);
    if (!token) {
      console.log(`❌ No se pudo autenticar ${user.email}`);
      continue;
    }
    
    // Obtener materiales
    const materials = await getMaterials(token);
    if (materials.length === 0) {
      console.log(`📚 No hay materiales disponibles para ${user.email}`);
      continue;
    }
    
    // Intentar eliminar el primer material
    const firstMaterial = materials[0];
    console.log(`📄 Material a eliminar:`, {
      id: firstMaterial._id,
      nombre: firstMaterial.nombre,
      usuario: firstMaterial.usuario,
      bucketTipo: firstMaterial.bucketTipo
    });
    
    const deleteResult = await deleteMaterial(token, firstMaterial._id);
    
    if (deleteResult.success) {
      console.log(`✅ ${user.email} pudo eliminar el material`);
    } else {
      console.log(`❌ ${user.email} NO pudo eliminar el material:`, deleteResult.data?.error || deleteResult.error);
    }
  }
}

// Ejecutar la prueba
testDeletePermissions().catch(console.error);