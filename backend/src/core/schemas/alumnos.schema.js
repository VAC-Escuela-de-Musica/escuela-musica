import { Schema } from 'mongoose'

const alumnoSchema = new Schema(
  {
    // Datos del estudiante
    nombreAlumno: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [50, 'El nombre no puede superar los 50 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
        'El nombre solo puede contener letras y espacios'
      ]
    },
    rutAlumno: {
      type: String,
      required: [true, 'El RUT es obligatorio'],
      unique: true,
      trim: true,
      match: [
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        'El RUT debe tener el formato 12.345.678-9'
      ]
    },
    edadAlumno: {
      type: String,
      trim: true,
      maxlength: [3, 'La edad no puede superar los 3 caracteres'],
      match: [
        /^(1[0-9]|[2-9][0-9]|[1-9])$/,
        'La edad debe ser un número entre 1 y 99'
      ]
    },
    direccion: {
      type: String,
      trim: true,
      maxlength: [100, 'La dirección no puede superar los 100 caracteres'],
      match: [
        /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ,.#-]+$/,
        'La dirección solo puede contener letras, números y algunos símbolos (, . # -)'
      ]
    },
    telefonoAlumno: {
      type: String,
      trim: true,
      match: [
        /^\+?\d{9,15}$/,
        'El teléfono debe contener solo números y puede iniciar con +'
      ]
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'El email no es válido'
      ]
    },
    fechaIngreso: {
      type: String,
      required: [true, 'La fecha de ingreso es obligatoria'],
      match: [
        /^(\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])|((0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}))$/,
        'La fecha debe tener el formato YYYY-MM-DD (ISO) o DD-MM-YYYY'
      ]
    },

    // Datos del apoderado
    nombreApoderado: {
      type: String,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [
        50,
        'El nombre del apoderado no puede superar los 50 caracteres'
      ],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/,
        'El nombre solo puede contener letras y espacios'
      ]
    },
    rutApoderado: {
      type: String,
      trim: true,
      match: [
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        'El RUT debe tener el formato 12.345.678-9'
      ]
    },
    telefonoApoderado: {
      type: String,
      trim: true,
      match: [
        /^\+?\d{9,15}$/,
        'El teléfono debe contener solo números y puede iniciar con +'
      ]
    },
    // Otros datos
    rrss: {
      type: String,
      trim: true,
      maxlength: [100, 'Las RRSS no pueden superar los 100 caracteres'],
      match: [
        /^[a-zA-Z0-9_@.\-]*$/,
        'Las RRSS solo pueden contener letras, números, guiones, puntos y arroba'
      ]
    },
    conocimientosPrevios: {
      type: Boolean,
      default: false
    },
    instrumentos: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((i) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(i))
        },
        message: 'Cada instrumento solo puede contener letras y espacios'
      }
    },
    estilosMusicales: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((e) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(e))
        },
        message: 'Cada estilo solo puede contener letras y espacios'
      }
    },
    otroEstilo: {
      type: String,
      trim: true,
      maxlength: [50, 'El estilo no puede superar los 50 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/,
        'El estilo solo puede contener letras y espacios'
      ]
    },
    referenteMusical: {
      type: String,
      trim: true,
      maxlength: [100, 'El referente no puede superar los 100 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.'-]*$/,
        "El referente solo puede contener letras, números y algunos símbolos (, . ' -)"
      ]
    },
    condicionAprendizaje: {
      type: Boolean,
      default: false
    },
    detalleCondicionAprendizaje: {
      type: String,
      trim: true,
      maxlength: [100, 'El detalle no puede superar los 100 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.'-]*$/,
        "El detalle solo puede contener letras, números y algunos símbolos (, . ' -)"
      ]
    },
    condicionMedica: {
      type: Boolean,
      default: false
    },
    detalleCondicionMedica: {
      type: String,
      trim: true,
      maxlength: [100, 'El detalle no puede superar los 100 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.'-]*$/,
        "El detalle solo puede contener letras, números y algunos símbolos (, . ' -)"
      ]
    },
    observaciones: {
      type: String,
      trim: true,
      maxlength: [
        200,
        'Las observaciones no pueden superar los 200 caracteres'
      ],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ,.'-]*$/,
        "Las observaciones solo pueden contener letras, números y algunos símbolos (, . ' -)"
      ]
    },
    curso: {
      type: String,
      trim: true,
      maxlength: [50, 'El curso no puede superar los 50 caracteres'],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9 ]*$/,
        'El curso solo puede contener letras, números y espacios'
      ]
    },
    tipoCurso: {
      type: String,
      trim: true,
      maxlength: [50, 'El tipo de curso no puede superar los 50 caracteres'],
      enum: {
        values: ['Grupal', 'Individual'],
        message: "El tipo de curso solo puede ser 'Grupal' o 'Individual'"
      }
    },
    modalidadClase: {
      type: String,
      trim: true,
      maxlength: [50, 'La modalidad no puede superar los 50 caracteres'],
      enum: {
        values: ['Presencial', 'Online'],
        message: "La modalidad solo puede ser 'Presencial' u 'Online'"
      }
    },
    clase: {
      type: String,
      trim: true,
      maxlength: [30, 'La clase no puede superar los 30 caracteres'],
      match: [
        /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo) ([01]\d|2[0-3]):[0-5]\d$/,
        "La clase debe tener el formato 'Día HH:mm', por ejemplo 'Lunes 16:00'"
      ]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default alumnoSchema
