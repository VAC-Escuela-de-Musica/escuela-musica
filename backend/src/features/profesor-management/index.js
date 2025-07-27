/**
 * PROFESOR-MANAGEMENT FEATURE - ÍNDICE PRINCIPAL
 * Exportaciones centralizadas para la gestión de profesores
 */

// === CONTROLADOR ===
// Funciones individuales del controlador
export {
  getAllProfesores,
  createProfesores,
  getProfesoresById,
  updateProfesores,
  deleteProfesores,
  getProfesorByEmail,
  getProfesoresActivos,
  toggleProfesorStatus
} from './controllers/profesores.controller.js'

// Controlador completo
export { default as ProfesoresController } from './controllers/profesores.controller.js'

// === SERVICIO ===
// Funciones individuales del servicio (con prefijo para evitar conflictos)
export {
  getAllProfesores as getAllProfesoresService,
  createProfesores as createProfesoresService,
  getProfesoresById as getProfesoresByIdService,
  updateProfesores as updateProfesoresService,
  deleteProfesores as deleteProfesoresService,
  getProfesorByEmail as getProfesorByEmailService,
  getProfesoresActivos as getProfesoresActivosService,
  toggleProfesorStatus as toggleProfesorStatusService
} from './services/profesores.service.js'

// Servicio completo
export { default as ProfesoresService } from './services/profesores.service.js'

// === RUTAS ===
// Router principal
export { default as profesoresRoutes } from './routes/profesores.routes.js' 