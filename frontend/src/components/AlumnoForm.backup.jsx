// Backup de seguridad del componente AlumnoForm.jsx antes de la refactorización
// Fecha: 21-07-2025

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// --- UTILS ---
const formatRut = (value) => {
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (clean.length < 2) return clean;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let cuerpoFormateado = "";
  let i = cuerpo.length;
  while (i > 3) {
    cuerpoFormateado = "." + cuerpo.slice(i - 3, i) + cuerpoFormateado;
    i -= 3;
  }
  cuerpoFormateado = cuerpo.slice(0, i) + cuerpoFormateado;
  let rutFinal = `${cuerpoFormateado}-${dv}`;
  return rutFinal.slice(0, 12);
};

const validateRut = (rut) => {
  if (!rut) return false;
  const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/;
  return regex.test(rut);
};

const formatDateToCL = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDateFromCL = (clDateStr) => {
  if (!clDateStr) return "";
  const [day, month, year] = clDateStr.split("-");
  return `${year}-${month}-${day}`;
};

// --- VALIDACIONES DE CAMPO ---
const fieldValidators = {
  nombreAlumno: (v) => !v || v.length < 3 ? "El nombre es obligatorio y debe tener al menos 3 letras." : "",
  rutAlumno: (v) => !validateRut(v) ? "El RUT no es válido. Debe tener puntos y guion." : "",
  edadAlumno: (v) => !v || isNaN(v) || v < 1 || v > 99 ? "La edad debe ser un número entre 1 y 99." : "",
  telefonoAlumno: (v) => !/^[0-9]{8}$/.test(v) ? "Debe tener exactamente 8 dígitos." : "",
  email: (v) => !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? "Email no válido." : "",
  fechaIngreso: (v) => !/^\d{2}-\d{2}-\d{4}$/.test(v) ? "Formato DD-MM-AAAA requerido." : "",
  rutApoderado: (v) => v && !validateRut(v) ? "RUT no válido." : "",
  telefonoApoderado: (v) => v && !/^[0-9]{8}$/.test(v) ? "Debe tener 8 dígitos." : "",
  emailApoderado: (v) => v && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? "Email no válido." : "",
  rrss: (v) => v && !/^[a-zA-Z0-9_@.\-]*$/.test(v) ? "Solo letras, números, guiones, puntos y arroba." : "",
  instrumentos: (arr) => arr.some(i => i && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(i)) ? "Solo letras y espacios." : "",
  estilosMusicales: (arr) => arr.some(e => e && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(e)) ? "Solo letras y espacios." : "",
};

const tipoCursoOpciones = ["Grupal", "Individual"];
const modalidadOpciones = ["Presencial", "Online"];
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  // ...existing code...
}

export default AlumnoForm;
