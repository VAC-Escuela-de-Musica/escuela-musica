"use strict";

import path from "path";
import { respondError } from "../../utils/resHandler.js";
import { handleError } from "../../utils/errorHandler.js";

/**
 * Validador genérico de tipos de archivo por extensión
 * @param {Array<string>} allowedExtensions - Extensiones permitidas (ej: ['.jpg', '.png'])
 * @param {string} errorMessage - Mensaje de error personalizado
 */
const validateFileType = (allowedExtensions, errorMessage = "Tipo de archivo no permitido") => {
  return (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`${errorMessage}. Tipos permitidos: ${allowedExtensions.join(', ')}`), false);
      }
    } catch (error) {
      cb(error, false);
    }
  };
};

/**
 * Validador específico para imágenes
 */
const validateImageFile = validateFileType(
  ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  "Solo se permiten archivos de imagen"
);

/**
 * Validador específico para materiales educativos
 */
const validateMaterialFile = validateFileType(
  ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.jpg', '.jpeg', '.png'],
  "Solo se permiten archivos de materiales educativos"
);

/**
 * Validador específico para documentos
 */
const validateDocumentFile = validateFileType(
  ['.pdf', '.docx', '.doc', '.txt', '.rtf'],
  "Solo se permiten archivos de documento"
);

/**
 * Middleware para validar el tamaño del archivo después de la subida
 * @param {number} maxSizeInMB - Tamaño máximo en MB
 */
const validateFileSize = (maxSizeInMB) => {
  return (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      const files = req.files || [req.file];

      for (const file of files) {
        if (file && file.size > maxSizeInBytes) {
          return respondError(
            req,
            res,
            400,
            "Archivo muy grande",
            `El archivo ${file.originalname} excede el tamaño máximo de ${maxSizeInMB}MB`
          );
        }
      }

      next();
    } catch (error) {
      handleError(error, "file.validation -> validateFileSize");
    }
  };
};

/**
 * Middleware para validar que se haya subido al menos un archivo
 */
const requireFile = (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return respondError(
        req,
        res,
        400,
        "Archivo requerido",
        "Debe subir al menos un archivo"
      );
    }

    next();
  } catch (error) {
    handleError(error, "file.validation -> requireFile");
  }
};

/**
 * Middleware para validar el nombre del archivo
 */
const validateFileName = (req, res, next) => {
  try {
    const files = req.files || [req.file];

    for (const file of files) {
      if (file) {
        // Verificar que el nombre no esté vacío
        if (!file.originalname || file.originalname.trim() === '') {
          return respondError(
            req,
            res,
            400,
            "Nombre de archivo inválido",
            "El archivo debe tener un nombre válido"
          );
        }

        // Verificar caracteres peligrosos
        const dangerousChars = /[<>:"/\\|?*]/;
        if (dangerousChars.test(file.originalname)) {
          return respondError(
            req,
            res,
            400,
            "Nombre de archivo inválido",
            "El nombre del archivo contiene caracteres no permitidos"
          );
        }
      }
    }

    next();
  } catch (error) {
    handleError(error, "file.validation -> validateFileName");
  }
};

export { 
  validateFileType,
  validateImageFile,
  validateMaterialFile,
  validateDocumentFile,
  validateFileSize,
  requireFile,
  validateFileName
};
