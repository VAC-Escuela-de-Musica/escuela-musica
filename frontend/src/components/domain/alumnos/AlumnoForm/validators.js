// Funciones de validación puras
export const validateRut = (rut) => {
  if (!rut) return false;
  const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/;
  return regex.test(rut);
};

export const fieldValidators = {
  nombreAlumno: (v) =>
    !v || v.length < 3
      ? "El nombre es obligatorio y debe tener al menos 3 letras."
      : "",
  rutAlumno: (v) =>
    !validateRut(v) ? "El RUT no es válido. Debe tener puntos y guion." : "",
  edadAlumno: (v) =>
    !v || isNaN(v) || v < 1 || v > 99
      ? "La edad debe ser un número entre 1 y 99."
      : "",
  telefonoAlumno: (v) =>
    !/^[0-9]{9}$/.test(v) ? "Debe tener exactamente 9 dígitos." : "",
  email: (v) =>
    !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? "Email no válido." : "",
  password: (v) => {
    if (!v) return "La contraseña es obligatoria.";
    if (v === "********") return ""; // Permite el placeholder para edición
    if (v.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    return "";
  },
  fechaIngreso: (v) => {
    if (!v) return "La fecha es obligatoria.";
    // Si es un objeto Date, verificar que sea válido
    if (v instanceof Date) {
      return isNaN(v.getTime()) ? "Fecha inválida." : "";
    }
    // Si es string, acepta formato DD-MM-AAAA o ISO yyyy-MM-dd
    if (typeof v === "string") {
      if (!/^\d{2}-\d{2}-\d{4}$/.test(v) && !/^\d{4}-\d{2}-\d{2}$/.test(v))
        return "Formato de fecha inválido (DD-MM-AAAA o YYYY-MM-DD).";
    }
    return "";
  },
  nombreApoderado: (v) =>
    !v || v.length < 3
      ? "El nombre del apoderado es obligatorio y debe tener al menos 3 caracteres."
      : "",
  rutApoderado: (v) => (v && !validateRut(v) ? "RUT no válido." : ""),
  telefonoApoderado: (v) =>
    !v
      ? "El teléfono del apoderado es obligatorio."
      : !/^[0-9]{9}$/.test(v)
      ? "Debe tener exactamente 9 dígitos."
      : "",
  emailApoderado: (v) =>
    v && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? "Email no válido." : "",
  rrss: (v) =>
    v && !/^[a-zA-Z0-9_@.\-]*$/.test(v)
      ? "Solo letras, números, guiones, puntos y arroba."
      : "",
  instrumentos: (arr) =>
    arr.some((i) => i && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(i))
      ? "Solo letras y espacios."
      : "",
  estilosMusicales: (arr) =>
    arr.some((e) => e && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(e))
      ? "Solo letras y espacios."
      : "",
  // Validadores para campos de clase
  curso: (v) => (!v || v.trim().length === 0 ? "El curso es obligatorio." : ""),
  tipoCurso: (v) =>
    !v || v.trim().length === 0 ? "El tipo de curso es obligatorio." : "",
  modalidadClase: (v) =>
    !v || v.trim().length === 0 ? "La modalidad de clase es obligatoria." : "",
  dia: (v) => (!v || v.trim().length === 0 ? "El día es obligatorio." : ""),
  hora: (v) => {
    if (!v || v.trim().length === 0) return "La hora es obligatoria.";
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v))
      return "Formato de hora inválido (HH:MM).";
    return "";
  },
};
