// Script para probar diferentes contraseñas del usuario
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:1230';

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

// Función para probar login
async function testLogin(email, password, csrfToken) {
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
    return { success: data.success, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testUserPasswords() {
  console.log('🔐 Probando contraseñas para user@email.com...');
  
  const csrfToken = await getCsrfToken();
  if (!csrfToken) {
    console.log('❌ No se pudo obtener token CSRF');
    return;
  }
  
  const passwords = [
    'user123',
    'profesor123',
    'admin123',
    'password',
    'user',
    '123456'
  ];
  
  for (const password of passwords) {
    console.log(`\n🔍 Probando contraseña: ${password}`);
    const result = await testLogin('user@email.com', password, csrfToken);
    
    if (result.success) {
      console.log(`✅ ¡Contraseña correcta! ${password}`);
      console.log('👤 Usuario:', result.data.data.user);
      break;
    } else {
      console.log(`❌ Contraseña incorrecta: ${password}`);
    }
  }
}

testUserPasswords().catch(console.error);