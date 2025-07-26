// Script para verificar si el módulo de profesores se importa correctamente
console.log('🔍 Verificando importación de módulos...');

try {
  console.log('1. Intentando importar rutas de profesores...');
  const profesoresRoutes = require('../backend/src/features/profesor-management/routes/profesores.routes.js');
  console.log('✅ Rutas de profesores importadas correctamente');
  console.log('Rutas:', profesoresRoutes);
} catch (error) {
  console.error('❌ Error importando rutas de profesores:', error.message);
}

try {
  console.log('2. Intentando importar controlador de profesores...');
  const ProfesoresController = require('../backend/src/features/profesor-management/controllers/profesores.controller.js');
  console.log('✅ Controlador de profesores importado correctamente');
  console.log('Controlador:', Object.keys(ProfesoresController));
} catch (error) {
  console.error('❌ Error importando controlador de profesores:', error.message);
}

try {
  console.log('3. Intentando importar servicio de profesores...');
  const ProfesoresService = require('../backend/src/features/profesor-management/services/profesores.service.js');
  console.log('✅ Servicio de profesores importado correctamente');
  console.log('Servicio:', Object.keys(ProfesoresService));
} catch (error) {
  console.error('❌ Error importando servicio de profesores:', error.message);
}

try {
  console.log('4. Intentando importar modelo de profesores...');
  const Profesor = require('../backend/src/core/models/profesores.model.js');
  console.log('✅ Modelo de profesores importado correctamente');
  console.log('Modelo:', Profesor);
} catch (error) {
  console.error('❌ Error importando modelo de profesores:', error.message);
}

console.log('🎯 Verificación completada'); 