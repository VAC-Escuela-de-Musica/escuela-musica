// Exportaciones principales del módulo file-system

// Controladores
export {
  getDownloadUrl,
  downloadFile
} from './controllers/download.controller.js';

export {
  getDownloadUrl as getDownloadUrlFile,
  serveFileWithFallback,
  downloadFileWithFallback,
  healthCheck as fileHealthCheck
} from './controllers/file.controller.js';

export {
  serveFile
} from './controllers/serve.controller.js';

export {
  healthCheck,
  systemDiagnostics
} from './controllers/system.controller.js';

// Servicios
export {
  fileService,
  minioService
} from './services/index.js';

// Middlewares
export {
  fileAccessMiddleware,
  fileStreamMiddleware,
  fileSecurityMiddleware,
  fileCacheMiddleware,
  fileAccessLogger
} from './middlewares/index.js';

// Rutas principales
export { default as fileRoutes } from './routes/file.routes.js';

// Re-exportar todo el índice de controladores para compatibilidad
export * from './controllers/index.js';