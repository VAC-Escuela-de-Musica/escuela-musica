import Joi from 'joi'

const profesoresSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
    .required()
    .messages({
      'string.empty': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede superar los 50 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      'any.required': 'El nombre es obligatorio'
    }),

  apellidos: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/)
    .required()
    .messages({
      'string.empty': 'Los apellidos son obligatorios',
      'string.min': 'Los apellidos deben tener al menos 2 caracteres',
      'string.max': 'Los apellidos no pueden superar los 100 caracteres',
      'string.pattern.base': 'Los apellidos solo pueden contener letras y espacios',
      'any.required': 'Los apellidos son obligatorios'
    }),

  rut: Joi.string()
    .pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)
    .required()
    .messages({
      'string.empty': 'El RUT es obligatorio',
      'string.pattern.base': 'El RUT debe tener el formato 12.345.678-9',
      'any.required': 'El RUT es obligatorio'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'El email es obligatorio',
      'string.email': 'El email no es válido',
      'any.required': 'El email es obligatorio'
    }),

  numero: Joi.string()
    .pattern(/^\+?\d{9,15}$/)
    .required()
    .messages({
      'string.empty': 'El número de teléfono es obligatorio',
      'string.pattern.base': 'El teléfono debe contener solo números y puede iniciar con +',
      'any.required': 'El número de teléfono es obligatorio'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),

  sueldo: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'El sueldo debe ser un número',
      'number.min': 'El sueldo no puede ser negativo',
      'any.required': 'El sueldo es obligatorio'
    }),

  fechaContrato: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.base': 'La fecha de contrato debe ser una fecha válida',
      'date.max': 'La fecha de contrato no puede ser futura',
      'any.required': 'La fecha de contrato es obligatoria'
    }),

  activo: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'El campo activo debe ser verdadero o falso'
    })
})

// Esquema para actualización (campos opcionales)
const profesoresUpdateSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/),

  apellidos: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/),

  rut: Joi.string()
    .pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/),

  email: Joi.string()
    .email()
    .lowercase(),

  numero: Joi.string()
    .pattern(/^\+?\d{9,15}$/),

  password: Joi.string()
    .min(6),

  sueldo: Joi.number()
    .min(0),

  fechaContrato: Joi.date()
    .max('now'),

  activo: Joi.boolean()
})

export { profesoresSchema, profesoresUpdateSchema } 