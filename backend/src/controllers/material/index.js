// Controlador principal de materiales - Re-exporta todos los controladores específicos
export { 
  listMaterialsWithUrls, 
  getMaterialById, 
  updateMaterial, 
  deleteMaterial
} from './material.controller.js';

export { 
  getUploadUrl, 
  confirmUpload 
} from './upload.controller.js';

export { 
  initializeBucket, 
  testMinioConnection, 
  getStorageStats,
  clearCache 
} from './admin.controller.js';
