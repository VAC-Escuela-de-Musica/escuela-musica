// Exportar todos los middlewares de manejo de errores
export { 
  globalErrorHandler, 
  notFoundHandler, 
  asyncHandler, 
  accessErrorLogger 
} from './error.middleware.js';
