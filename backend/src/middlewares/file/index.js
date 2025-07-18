// Exportar middlewares de acceso a archivos
export { 
  fileAccessMiddleware, 
  fileStreamMiddleware, 
  fileSecurityMiddleware, 
  fileCacheMiddleware, 
  fileAccessLogger 
} from './access.middleware.js';

// Exportar middlewares de subida de archivos
export { 
  uploadImage, 
  uploadMaterial, 
  uploadDocument,
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleMaterial,
  uploadMultipleMaterials,
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadMixed
} from './upload.middleware.js';
