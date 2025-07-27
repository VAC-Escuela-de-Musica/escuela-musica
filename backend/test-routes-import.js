// Script para verificar importación de rutas en index.routes.js
console.log('🔍 [TEST] Verificando importación de rutas en index.routes.js...');

try {
  console.log('1. Intentando importar index.routes.js...');
  const indexRoutes = await import('./src/routes/index.routes.js');
  console.log('✅ index.routes.js importado correctamente');
  
  // Verificar si las rutas están registradas
  console.log('2. Verificando stack de rutas...');
  if (indexRoutes.default && indexRoutes.default.stack) {
    console.log('✅ Stack de rutas disponible');
    console.log('Número de rutas registradas:', indexRoutes.default.stack.length);
    
    // Mostrar las primeras rutas registradas
    console.log('3. Primeras rutas registradas:');
    indexRoutes.default.stack.slice(0, 10).forEach((layer, index) => {
      console.log(`   ${index + 1}. ${layer.route ? layer.route.path : 'Middleware'}`);
    });
  } else {
    console.log('❌ Stack de rutas no disponible');
  }
  
  // Intentar importar directamente las rutas de profesores
  console.log('4. Intentando importar profesores.routes.js directamente...');
  const profesoresRoutes = await import('./src/features/profesor-management/routes/profesores.routes.js');
  console.log('✅ profesores.routes.js importado correctamente');
  
  if (profesoresRoutes.default && profesoresRoutes.default.stack) {
    console.log('Stack de rutas de profesores:', profesoresRoutes.default.stack.length);
  } else {
    console.log('❌ Stack de rutas de profesores no disponible');
  }
  
} catch (error) {
  console.error('❌ Error en la importación:', error.message);
  console.error('Stack:', error.stack);
}

console.log('🎯 Verificación completada'); 