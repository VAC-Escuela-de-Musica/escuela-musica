/**
 * STUDENT-MANAGEMENT FEATURE - ÍNDICE PRINCIPAL
 * Exportaciones centralizadas para la gestión de estudiantes/alumnos
 */

// === CONTROLADOR ===
// Funciones individuales del controlador
export {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos
} from './controllers/alumnos.controller.js'

// Controlador completo como objeto
export { default as AlumnosController } from './controllers/alumnos.controller.js'

// === SERVICIO ===
// Funciones individuales del servicio (con prefijo para evitar conflictos)
export {
  getAllAlumnos as getAllAlumnosService,
  createAlumnos as createAlumnosService,
  getAlumnosById as getAlumnosByIdService,
  updateAlumnos as updateAlumnosService,
  deleteAlumnos as deleteAlumnosService
} from './services/alumnos.service.js'

// Servicio completo como objeto
export { default as AlumnosService } from './services/alumnos.service.js'

// === RUTAS ===
// Rutas/Router
export { default as AlumnosRoutes } from './routes/alumnos.routes.js'
