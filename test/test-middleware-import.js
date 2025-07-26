// Script para verificar importación de middlewares
console.log('🔍 [TEST] Verificando importación de middlewares...');

try {
  console.log('1. Intentando importar middlewares...');
  const middlewares = require('../backend/src/middlewares/index.js');
  console.log('✅ Middlewares importados correctamente');
  console.log('Middlewares disponibles:', Object.keys(middlewares));
  
  // Verificar requireAdmin específicamente
  console.log('2. Verificando requireAdmin...');
  if (middlewares.requireAdmin) {
    console.log('✅ requireAdmin está disponible');
    console.log('Tipo:', typeof middlewares.requireAdmin);
  } else {
    console.log('❌ requireAdmin NO está disponible');
  }
  
  // Verificar authenticateJWT
  console.log('3. Verificando authenticateJWT...');
  if (middlewares.authenticateJWT) {
    console.log('✅ authenticateJWT está disponible');
    console.log('Tipo:', typeof middlewares.authenticateJWT);
  } else {
    console.log('❌ authenticateJWT NO está disponible');
  }
  
} catch (error) {
  console.error('❌ Error en la importación de middlewares:', error.message);
  console.error('Stack:', error.stack);
}

console.log('🎯 Verificación completada'); 