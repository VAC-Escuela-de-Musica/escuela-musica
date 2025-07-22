// Exportar middlewares de acceso a archivos
export { 
  fileAccessMiddleware, 
  fileStreamMiddleware, 
  fileSecurityMiddleware, 
  fileCacheMiddleware, 
  fileAccessLogger 
} from './access.middleware.js';

// No hay middlewares de subida de archivos activos, ya que se eliminó la lógica de multer.
