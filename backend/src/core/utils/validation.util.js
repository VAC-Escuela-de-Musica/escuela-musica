'use strict'

import Joi from 'joi'
import ROLES from '../constants/roles.constants.js'

/**
 * Esquemas de validación comunes reutilizables
 */

// Validación de email común
export const emailValidation = Joi.string().email().required().messages({
  'string.empty': 'El email no puede estar vacío.',
  'any.required': 'El email es obligatorio.',
  'string.base': 'El email debe ser de tipo string.',
  'string.email': 'El email debe tener un formato válido.'
})

// Validación de password para login
export const passwordLoginValidation = Joi.string().required().messages({
  'string.empty': 'La contraseña no puede estar vacía.',
  'any.required': 'La contraseña es obligatoria.',
  'string.base': 'La contraseña debe ser de tipo string.'
})

// Validación de password para registro (con mínimos)
export const passwordRegistrationValidation = Joi.string().required().min(5).messages({
  'string.empty': 'La contraseña no puede estar vacía.',
  'any.required': 'La contraseña es obligatoria.',
  'string.base': 'La contraseña debe ser de tipo string.',
  'string.min': 'La contraseña debe tener al menos 5 caracteres.'
})

// Validación de RUT chileno
export const rutValidation = Joi.string()
  .required()
  .min(9)
  .max(10)
  .pattern(/^[0-9]+[-|‐]{1}[0-9kK]{1}$/)
  .messages({
    'string.empty': 'El rut no puede estar vacío.',
    'any.required': 'El rut es obligatorio.',
    'string.base': 'El rut debe ser de tipo string.',
    'string.min': 'El rut debe tener al menos 9 caracteres.',
    'string.max': 'El rut debe tener al menos 10 caracteres.',
    'string.pattern.base': 'El rut tiene el formato XXXXXXXX-X, ejemplo: 12345678-9.'
  })

// Validación de roles
export const rolesValidation = Joi.array()
  .items(Joi.string().valid(...ROLES))
  .required()
  .messages({
    'array.base': 'El rol debe ser de tipo array.',
    'any.required': 'El rol es obligatorio.',
    'string.base': 'El rol debe ser de tipo string.',
    'any.only': 'El rol proporcionado no es válido.'
  })

// Validación de username
export const usernameValidation = Joi.string().required().messages({
  'string.empty': 'El nombre de usuario no puede estar vacío.',
  'any.required': 'El nombre de usuario es obligatorio.',
  'string.base': 'El nombre de usuario debe ser de tipo string.'
})

// Validación de ID de MongoDB
export const mongoIdValidation = Joi.string()
  .pattern(/^[a-fA-F0-9]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'ID inválido.',
    'any.required': 'ID es obligatorio.'
  })

/**
 * Función helper para crear esquemas de validación comunes
 */
export const createCommonSchemas = {
  // Esquema básico de login
  loginSchema: () => Joi.object({
    email: emailValidation,
    password: passwordLoginValidation
  }).messages({
    'object.unknown': 'No se permiten propiedades adicionales.'
  }),

  // Esquema básico de usuario
  userSchema: () => Joi.object({
    username: usernameValidation,
    rut: rutValidation,
    password: passwordRegistrationValidation,
    email: emailValidation,
    roles: rolesValidation
  }).messages({
    'object.unknown': 'No se permiten propiedades adicionales.'
  }),

  // Esquema para actualizar usuario (campos opcionales)
  userUpdateSchema: () => Joi.object({
    username: usernameValidation.optional(),
    rut: rutValidation.optional(),
    email: emailValidation.optional(),
    roles: rolesValidation.optional()
  }).messages({
    'object.unknown': 'No se permiten propiedades adicionales.'
  }),

  // Esquema de paginación
  paginationSchema: () => Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('asc')
  })
}

/**
 * Función para validar datos con un esquema específico
 * @param {Object} data - Datos a validar
 * @param {Object} schema - Esquema Joi
 * @returns {Object} - Resultado de validación
 */
export function validateData (data, schema) {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }))

    return {
      success: false,
      errors,
      data: null
    }
  }

  return {
    success: true,
    errors: null,
    data: value
  }
}
