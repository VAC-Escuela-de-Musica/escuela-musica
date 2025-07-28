import mongoose from "mongoose";

const claseSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  profesor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sala: String,
  horarios: [
    {
      dia: String,
      horaInicio: String,
      horaFin: String,
    },
  ],
  estado: { type: String, default: "programada" }, 
  materiales: [
    {
      tipo: { type: String, enum: ["video", "audio", "pdf", "imagen"] },
      url: String,
      descripcion: String,
    },
  ],
  // Nuevo campo: estudiantes asignados a esta clase
  estudiantes: [
    {
      alumno: { type: mongoose.Schema.Types.ObjectId, ref: "Alumno" },
      fechaAsignacion: { type: Date, default: Date.now },
      estado: { 
        type: String, 
        enum: ["activo", "inactivo", "suspendido"], 
        default: "activo",
      },
      notas: String, // Notas adicionales sobre el estudiante en esta clase
      asistencia: [
        {
          fecha: { type: Date, required: true },
          presente: { type: Boolean, required: true },
          observaciones: String,
        },
      ],
    },
  ],
  visible: { type: Boolean, default: true },
}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model("Clase", claseSchema);
