"use strict";

import { respondError } from "../../utils/responseHandler.util.js";
import { HTTP_STATUS, VALIDATION } from "../../constants/index.js";

/**
 * Middleware para validar parámetros de ruta
 * @param {Object} schema - Schema de validación Joi
 * @returns {Function} Middleware function
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return respondError(
        req, 
        res, 
        HTTP_STATUS.BAD_REQUEST, 
        "Parámetros de ruta inválidos",
        errorDetails
      );
    }
    
    next();
  };
};

/**
 * Middleware para validar query parameters
 * @param {Object} schema - Schema de validación Joi
 * @returns {Function} Middleware function
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return respondError(
        req, 
        res, 
        HTTP_STATUS.BAD_REQUEST, 
        "Parámetros de consulta inválidos",
        errorDetails
      );
    }
    
    // Asignar valores validados y sanitizados
    req.query = value;
    next();
  };
};

/**
 * Middleware para validar body de request
 * @param {Object} schema - Schema de validación Joi
 * @returns {Function} Middleware function
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));
      
      return respondError(
        req, 
        res, 
        HTTP_STATUS.BAD_REQUEST, 
        "Datos del cuerpo inválidos",
        errorDetails
      );
    }
    
    // Asignar valores validados y sanitizados
    req.body = value;
    next();
  };
};

/**
 * Middleware para sanitizar strings de entrada
 * @param {Array} fields - Campos a sanitizar
 * @returns {Function} Middleware function
 */
export const sanitizeInput = (fields = []) => {
  return (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      // Eliminar caracteres peligrosos
      return str
        .trim()
        .replace(/[<>\"']/g, '') // Eliminar caracteres HTML básicos
        .replace(/^\s+|\s+$/g, '') // Eliminar espacios al inicio y final
        .replace(/\s+/g, ' '); // Reemplazar múltiples espacios con uno solo
    };
    
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (fields.length === 0 || fields.includes(key)) {
          sanitized[key] = typeof value === 'string' ? sanitizeString(value) : value;
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };
    
    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitizar query
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  };
};

/**
 * Middleware para validar paginación
 * @returns {Function} Middleware function
 */
export const validatePagination = () => {
  return (req, res, next) => {
    const { page = VALIDATION.DEFAULT_PAGE, limit = VALIDATION.DEFAULT_LIMIT } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // Validar que sean números válidos
    if (isNaN(pageNum) || pageNum < 1) {
      return respondError(
        req, 
        res, 
        HTTP_STATUS.BAD_REQUEST, 
        "El parámetro 'page' debe ser un número mayor a 0"
      );
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > VALIDATION.MAX_LIMIT) {
      return respondError(
        req, 
        res, 
        HTTP_STATUS.BAD_REQUEST, 
        `El parámetro 'limit' debe ser un número entre 1 y ${VALIDATION.MAX_LIMIT}`
      );
    }
    
    // Asignar valores validados
    req.query.page = pageNum;
    req.query.limit = limitNum;
    
    next();
  };
};
