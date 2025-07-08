"use strict";

import Joi from "joi";
// import ROLES from "../constants/roles.constants.js";

/**
 * Esquema de validación para el cuerpo de la solicitud de clase.
 * @constant {Object}
 */
const claseBodySchema = Joi.object({
  titulo: Joi.string().required().messages({
    "string.empty": "El nombre de la clase no puede estar vacío.",
    "any.required": "El nombre de la clase es obligatorio.",
    "string.base": "El nombre de la clase debe ser de tipo string.",
  }),
  descripcion: Joi.string().optional().allow("").messages({
    "string.base": "La descripción debe ser de tipo string.",
  }),

//   profesorId: Joi.string().required().messages({
//     "string.empty": "El ID del profesor no puede estar vacío.",
//     "any.required": "El ID del profesor es obligatorio.",
//     "string.base": "El ID del profesor debe ser de tipo string.",
//  }),

  sala: Joi.string()
    .valid("Sala 1", "Sala 2", "Sala 3")
    .required()
    .messages({
      "any.only": "La sala debe ser 'Sala 1', 'Sala 2' o 'Sala 3'.",
      "any.required": "La sala es obligatoria.",
      "string.base": "La sala debe ser de tipo string.",
    }),
  horarios: Joi.array()
    .items(
      Joi.object({
        dia: Joi.string().required().messages({
          "string.empty": "El día no puede estar vacío.",
          "any.required": "El día es obligatorio.",
          "string.base": "El día debe ser de tipo string.",
        }),
        horaInicio: Joi.string().required().messages({
          "string.empty": "La hora de inicio no puede estar vacía.",
          "any.required": "La hora de inicio es obligatoria.",
          "string.base": "La hora de inicio debe ser de tipo string.",
        }),
        horaFin: Joi.string().required().messages({
          "string.empty": "La hora de fin no puede estar vacía.",
          "any.required": "La hora de fin es obligatoria.",
          "string.base": "La hora de fin debe ser de tipo string.",
        }),
      }),
    )
    .required()
    .messages({
      "array.base": "Los horarios deben ser un arreglo.",
      "array.includes": "Cada horario debe ser un objeto con 'dia', 'horaInicio' y 'horaFin'.",
      "any.required": "Los horarios son obligatorios.",
    }),
  estado: Joi.string()
    .valid("programada", "cancelada")
    .messages({
      "any.only": "El estado debe ser 'programada' o 'cancelada'.",
      "any.required": "El estado es obligatorio.",
      "string.base": "El estado debe ser de tipo string.",
    }),
  // materiales
  visible: Joi.boolean().default(true).messages({
    "boolean.base": "La visibilidad debe ser de tipo booleano.",
  }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

/**
 * Esquema de validación para el ID de la clase.
 * @constant {Object}
 */
const claseIdSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "El ID de la clase no puede estar vacío.",
    "any.required": "El ID de la clase es obligatorio.",
    "string.base": "El ID de la clase debe ser de tipo string.",
  }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

/**
 * Esquema de validación para cancelar una clase.
 * @constant {Object}
 */
const claseCancelSchema = Joi.object({
  estado: Joi.string()
    .valid("cancelada")
    .required()
    .messages({
      "any.only": "El estado debe ser 'cancelada'.",
      "any.required": "El estado es obligatorio.",
      "string.base": "El estado debe ser de tipo string.",
    }),
  }).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

export { claseBodySchema, claseIdSchema, claseCancelSchema };
