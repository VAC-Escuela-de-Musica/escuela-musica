// Exportar todos los middlewares de validación
export {
  validateRequest,
  validateMongoId,
  validateRequiredFields,
  sanitizeInput
} from '../../core/middlewares/request.middleware.js'

export {
  validateFileType,
  validateImageFile,
  validateMaterialFile,
  validateDocumentFile,
  validateFileSize,
  requireFile,
  validateFileName
} from '../../features/file-system/middlewares/file.middleware.js'

export {
  validateParams,
  validateQuery,
  validateBody,
  sanitizeInput as enhancedSanitizeInput,
  validatePagination
} from './enhanced.middleware.js'
