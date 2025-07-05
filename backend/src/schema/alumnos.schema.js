import { Schema } from "mongoose";

const alumnoSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    rut: {
      type: String,
      required: [true, "El RUT es obligatorio"],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      match: [/.+@.+\..+/, "El email no es válido"],
    },
    birthdate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default alumnoSchema;
