"use strict";

import multer from "multer";
import { validateImageFile, validateMaterialFile, validateDocumentFile } from "../validation/file.middleware.js";

// Configuración común - almacenamiento en memoria
const storage = multer.memoryStorage();

/**
 * Configuración base para multer
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.fileFilter - Filtro de archivos
 * @param {number} options.maxSize - Tamaño máximo en bytes
 * @param {number} options.maxFiles - Número máximo de archivos
 */
const createMulterConfig = ({ fileFilter, maxSize, maxFiles = 1 }) => ({
  storage,
  limits: { 
    fileSize: maxSize,
    files: maxFiles 
  },
  fileFilter
});

// Configuraciones específicas
const imageUploadConfig = createMulterConfig({
  fileFilter: validateImageFile,
  maxSize: 10 * 1024 * 1024, // 10 MB
  maxFiles: 1
});

const materialUploadConfig = createMulterConfig({
  fileFilter: validateMaterialFile,
  maxSize: 50 * 1024 * 1024, // 50 MB
  maxFiles: 5
});

const documentUploadConfig = createMulterConfig({
  fileFilter: validateDocumentFile,
  maxSize: 25 * 1024 * 1024, // 25 MB
  maxFiles: 3
});

// Middleware instances
const uploadImage = multer(imageUploadConfig);
const uploadMaterial = multer(materialUploadConfig);
const uploadDocument = multer(documentUploadConfig);

// Middlewares específicos para diferentes tipos de subida
const uploadSingleImage = uploadImage.single('image');
const uploadMultipleImages = uploadImage.array('images', 5);
const uploadSingleMaterial = uploadMaterial.single('material');
const uploadMultipleMaterials = uploadMaterial.array('materials', 5);
const uploadSingleDocument = uploadDocument.single('document');
const uploadMultipleDocuments = uploadDocument.array('documents', 3);

// Middleware flexible para diferentes campos
const uploadMixed = uploadMaterial.fields([
  { name: 'images', maxCount: 3 },
  { name: 'documents', maxCount: 2 },
  { name: 'materials', maxCount: 5 }
]);

export { 
  // Configuraciones base
  uploadImage, 
  uploadMaterial, 
  uploadDocument,
  
  // Middlewares específicos
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleMaterial,
  uploadMultipleMaterials,
  uploadSingleDocument,
  uploadMultipleDocuments,
  uploadMixed
};
