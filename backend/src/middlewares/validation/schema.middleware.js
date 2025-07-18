"use strict";

import { respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Middleware para validar esquemas usando Joi
 * @param {Object} schema - Esquema de validación de Joi
 * @param {string} property - Propiedad del request a validar (body, params, query)
 * @returns {Function} Middleware de validación
 */
export const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false, // Mostrar todos los errores
        allowUnknown: false, // No permitir campos desconocidos
        stripUnknown: true // Eliminar campos desconocidos
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return respondError(req, res, 400, "Errores de validación", {
          errors: errorMessages
        });
      }

      // Reemplazar el valor original con el valor validado
      req[property] = value;
      next();
    } catch (err) {
      handleError(err, "validateSchema.middleware");
      return respondError(req, res, 500, "Error en validación");
    }
  };
};

/**
 * Middleware para validar parámetros de ID de MongoDB
 * @param {string} paramName - Nombre del parámetro a validar
 * @returns {Function} Middleware de validación
 */
export const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

      if (!mongoIdRegex.test(id)) {
        return respondError(req, res, 400, `El parámetro ${paramName} debe ser un ID válido de MongoDB`);
      }

      next();
    } catch (err) {
      handleError(err, "validateMongoId.middleware");
      return respondError(req, res, 500, "Error en validación de ID");
    }
  };
};

/**
 * Middleware para validar paginación
 * @returns {Function} Middleware de validación
 */
export const validatePagination = () => {
  return (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return respondError(req, res, 400, "El parámetro 'page' debe ser un número mayor a 0");
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return respondError(req, res, 400, "El parámetro 'limit' debe ser un número entre 1 y 100");
      }

      req.pagination = {
        page: pageNum,
        limit: limitNum
      };

      next();
    } catch (err) {
      handleError(err, "validatePagination.middleware");
      return respondError(req, res, 500, "Error en validación de paginación");
    }
  };
};

export default {
  validateSchema,
  validateMongoId,
  validatePagination
};
