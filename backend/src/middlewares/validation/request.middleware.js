"use strict";

import { validationResult } from "express-validator";
import { respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Middleware para validar los resultados de express-validator
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      return respondError(
        req,
        res,
        400,
        "Errores de validación",
        formattedErrors
      );
    }

    next();
  } catch (error) {
    handleError(error, "request.middleware -> validateRequest");
  }
};

/**
 * Middleware para validar parámetros de ID de MongoDB
 * @param {string} paramName - Nombre del parámetro a validar
 */
const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

      if (!id || !mongoIdRegex.test(id)) {
        return respondError(
          req,
          res,
          400,
          "ID inválido",
          `El parámetro ${paramName} debe ser un ID válido de MongoDB`
        );
      }

      next();
    } catch (error) {
      handleError(error, "request.middleware -> validateMongoId");
    }
  };
};

/**
 * Middleware para validar que existan ciertos campos en el body
 * @param {Array<string>} requiredFields - Campos requeridos
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    try {
      const missingFields = [];

      for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field) || req.body[field] === undefined || req.body[field] === null) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        return respondError(
          req,
          res,
          400,
          "Campos requeridos faltantes",
          `Los siguientes campos son requeridos: ${missingFields.join(', ')}`
        );
      }

      next();
    } catch (error) {
      handleError(error, "request.middleware -> validateRequiredFields");
    }
  };
};

/**
 * Middleware para sanitizar y normalizar datos de entrada
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la siguiente función
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitizar strings en el body
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
    }

    // Sanitizar query parameters
    if (req.query && typeof req.query === 'object') {
      for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      }
    }

    next();
  } catch (error) {
    handleError(error, "request.middleware -> sanitizeInput");
  }
};

export { 
  validateRequest, 
  validateMongoId, 
  validateRequiredFields, 
  sanitizeInput 
};
