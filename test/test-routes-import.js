// Script para verificar si las rutas de profesores se importan correctamente
console.log('🔍 [TEST] Verificando importación de rutas...');

try {
  console.log('1. Intentando importar index.routes.js...');
  const indexRoutes = require('../backend/src/routes/index.routes.js');
  console.log('✅ index.routes.js importado correctamente');
  
  // Verificar si las rutas están registradas
  console.log('2. Verificando stack de rutas...');
  console.log('Stack de rutas:', indexRoutes.stack ? indexRoutes.stack.length : 'No disponible');
  
  // Intentar importar directamente las rutas de profesores
  console.log('3. Intentando importar profesores.routes.js directamente...');
  const profesoresRoutes = require('../backend/src/features/profesor-management/routes/profesores.routes.js');
  console.log('✅ profesores.routes.js importado correctamente');
  console.log('Stack de rutas de profesores:', profesoresRoutes.stack ? profesoresRoutes.stack.length : 'No disponible');
  
  // Verificar si hay algún error en la importación del controlador
  console.log('4. Verificando controlador...');
  const ProfesoresController = require('../backend/src/features/profesor-management/controllers/profesores.controller.js');
  console.log('✅ Controlador importado correctamente');
  console.log('Funciones del controlador:', Object.keys(ProfesoresController));
  
  // Verificar si hay algún error en la importación del servicio
  console.log('5. Verificando servicio...');
  const ProfesoresService = require('../backend/src/features/profesor-management/services/profesores.service.js');
  console.log('✅ Servicio importado correctamente');
  console.log('Funciones del servicio:', Object.keys(ProfesoresService));
  
  // Verificar si hay algún error en la importación del modelo
  console.log('6. Verificando modelo...');
  const Profesor = require('../backend/src/core/models/profesores.model.js');
  console.log('✅ Modelo importado correctamente');
  
} catch (error) {
  console.error('❌ Error en la importación:', error.message);
  console.error('Stack:', error.stack);
}

console.log('🎯 Verificación completada'); 