'use strict'

// =============================================================================
// CONTENT MANAGEMENT FEATURE - MAIN INDEX
// =============================================================================
// Este archivo centraliza todas las exportaciones del módulo content-management

// ==================== CONTROLADORES ====================
// Controladores de administración
export {
  initializeBucket,
  testMinioConnection,
  getStorageStats,
  clearCache
} from './controllers/admin.controller.js'

// Controladores de galería
export {
  getActiveGallery,
  getGalleryByCategory,
  getAllGallery,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  toggleImageStatus,
  updateImageOrder,
  getImageUrl,
  getUploadUrl as getGalleryUploadUrl
} from './controllers/galeria.controller.js'

// Controladores de materiales
export {
  listMaterialsWithUrls,
  getMaterialById,
  updateMaterial,
  deleteMaterial as deleteMaterialById
} from './controllers/material.controller.js'

// Controladores de subida
export {
  getUploadUrl as getMaterialUploadUrl,
  confirmUpload
} from './controllers/upload.controller.js'

// ==================== SERVICIOS ====================
export { materialService } from './services/material.service.js'
export { galeriaService } from './services/galeria.service.js'

// ==================== RUTAS ====================
export { default as galeriaRoutes } from './routes/galeria.routes.js'
export { default as materialRoutes } from './routes/material.routes.js'

// ==================== EXPORTS AGRUPADOS ====================
// Para facilitar el uso, también exportamos objetos agrupados

// Todos los controladores de administración
export const adminControllers = {
  initializeBucket,
  testMinioConnection,
  getStorageStats,
  clearCache
}

// Todos los controladores de galería
export const galeriaControllers = {
  getActiveGallery,
  getGalleryByCategory,
  getAllGallery,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  toggleImageStatus,
  updateImageOrder,
  getImageUrl,
  getUploadUrl: getGalleryUploadUrl
}

// Todos los controladores de materiales
export const materialControllers = {
  listMaterialsWithUrls,
  getMaterialById,
  updateMaterial,
  deleteMaterial: deleteMaterialById
}

// Todos los controladores de subida
export const uploadControllers = {
  getUploadUrl: getMaterialUploadUrl,
  confirmUpload
}

// Todos los servicios
export const services = {
  materialService,
  galeriaService
}

// Todas las rutas
export const routes = {
  galeriaRoutes,
  materialRoutes
}
