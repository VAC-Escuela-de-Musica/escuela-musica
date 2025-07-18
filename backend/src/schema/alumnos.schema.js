import { Schema } from "mongoose";

const alumnoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre no puede superar los 50 caracteres"],
      match: [
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
        "El nombre solo puede contener letras y espacios",
      ],
    },
    rut: {
      type: String,
      required: [true, "El RUT es obligatorio"],
      unique: true,
      trim: true,
      match: [
        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
        "El RUT debe tener el formato 12.345.678-9",
      ],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [100, "La dirección no puede superar los 100 caracteres"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^\+?\d{9,15}$/,
        "El teléfono debe contener solo números y puede iniciar con +",
      ],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, "El email no es válido"],
    },
    fechaIngreso: {
      type: Date,
      required: [true, "La fecha de ingreso es obligatoria"],
      validate: {
        validator: function (value) {
          return value instanceof Date && value <= new Date();
        },
        message: "La fecha de ingreso debe ser válida y anterior o igual a hoy",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default alumnoSchema;
