// Exportar todos los middlewares de validación
export { 
  validateRequest, 
  validateMongoId, 
  validateRequiredFields, 
  sanitizeInput 
} from './request.middleware.js';

export { 
  validateFileType,
  validateImageFile,
  validateMaterialFile,
  validateDocumentFile,
  validateFileSize,
  requireFile,
  validateFileName
} from './file.middleware.js';
