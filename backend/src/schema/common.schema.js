"use strict";

import Joi from "joi";
import { VALIDATION } from "../../constants/index.js";

/**
 * Schema para validar parámetros de ID
 */
export const idParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'El ID debe ser un ObjectId válido de MongoDB',
      'any.required': 'El ID es requerido'
    })
});

/**
 * Schema para validar parámetros de paginación
 */
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(VALIDATION.DEFAULT_PAGE)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.integer': 'La página debe ser un número entero',
      'number.min': 'La página debe ser mayor a 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(VALIDATION.MAX_LIMIT)
    .default(VALIDATION.DEFAULT_LIMIT)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser mayor a 0',
      'number.max': `El límite no puede ser mayor a ${VALIDATION.MAX_LIMIT}`
    }),
  sort: Joi.string()
    .valid('asc', 'desc', 'createdAt', '-createdAt', 'updatedAt', '-updatedAt')
    .default('createdAt')
    .messages({
      'any.only': 'El orden debe ser asc, desc, createdAt, -createdAt, updatedAt o -updatedAt'
    }),
  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'El término de búsqueda debe tener al menos 1 caracter',
      'string.max': 'El término de búsqueda no puede tener más de 100 caracteres'
    })
});

/**
 * Schema para validar filtros de materiales
 */
export const materialFiltersSchema = Joi.object({
  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
  isPublic: Joi.boolean()
    .optional(),
  author: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  dateFrom: Joi.date()
    .iso()
    .optional(),
  dateTo: Joi.date()
    .iso()
    .min(Joi.ref('dateFrom'))
    .optional()
}).concat(paginationSchema);

/**
 * Schema para validar filtros de usuarios
 */
export const userFiltersSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'user', 'teacher', 'student')
    .optional(),
  isActive: Joi.boolean()
    .optional(),
  email: Joi.string()
    .email()
    .optional()
}).concat(paginationSchema);

/**
 * Schema base para validar strings comunes
 */
export const commonSchemas = {
  email: Joi.string()
    .email()
    .max(VALIDATION.EMAIL_MAX_LENGTH)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Debe ser un email válido',
      'string.max': `El email no puede tener más de ${VALIDATION.EMAIL_MAX_LENGTH} caracteres`,
      'any.required': 'El email es requerido'
    }),
  
  password: Joi.string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`,
      'string.max': 'La contraseña no puede tener más de 128 caracteres',
      'string.pattern.base': 'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
      'any.required': 'La contraseña es requerida'
    }),
  
  username: Joi.string()
    .alphanum()
    .min(VALIDATION.USERNAME_MIN_LENGTH)
    .max(VALIDATION.USERNAME_MAX_LENGTH)
    .trim()
    .required()
    .messages({
      'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
      'string.min': `El nombre de usuario debe tener al menos ${VALIDATION.USERNAME_MIN_LENGTH} caracteres`,
      'string.max': `El nombre de usuario no puede tener más de ${VALIDATION.USERNAME_MAX_LENGTH} caracteres`,
      'any.required': 'El nombre de usuario es requerido'
    }),
  
  rut: Joi.string()
    .pattern(VALIDATION.RUT_REGEX)
    .required()
    .messages({
      'string.pattern.base': 'El RUT debe tener el formato XXXXXXXX-X',
      'any.required': 'El RUT es requerido'
    })
};
