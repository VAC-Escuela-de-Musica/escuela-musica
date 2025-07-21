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
  // --- Ocultar scroll externo al abrir el modal ---
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);
  const safeInitialData = initialData || {};

  // Extrae día y hora desde el campo 'clase' si existen
  let diaFromClase = "";
  let horaFromClase = "";
  if (safeInitialData.clase && (!safeInitialData.dia || !safeInitialData.hora)) {
    const partes = safeInitialData.clase.split(" ");
    diaFromClase = partes[0] || "";
    horaFromClase = partes[1] || "";
  }

  // Utilidad para inicializar arrays correctamente
  const initArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.length > 0 ? val.split(',').map(i => i.trim()) : []);
  // Utilidad para inicializar booleanos correctamente
  const initBool = (val) => typeof val === 'boolean' ? val : !!val;

  // Solo los 8 dígitos del teléfono, sin el prefijo
  const getTelefonoSinPrefijo = (tel) => {
    if (!tel) return "";
    // Elimina solo un prefijo +569 al inicio
    return tel.trim().replace(/^\+569/, "");
  };

  // Inicializa la fecha en formato chileno si viene en formato ISO
  const initialFechaIngreso =
    safeInitialData.fechaIngreso && safeInitialData.fechaIngreso.includes("-")
      ? formatDateToCL(safeInitialData.fechaIngreso)
      : safeInitialData.fechaIngreso || "";

  const [form, setForm] = useState({
    // Datos del alumno
    nombreAlumno: safeInitialData.nombreAlumno || "",
    rutAlumno: safeInitialData.rutAlumno || "",
    edadAlumno: safeInitialData.edadAlumno || "",
    direccion: safeInitialData.direccion || "",
    telefonoAlumno: getTelefonoSinPrefijo(safeInitialData.telefonoAlumno),
    email: safeInitialData.email || "",
    fechaIngreso: initialFechaIngreso,
    // Datos del apoderado
    nombreApoderado: safeInitialData.nombreApoderado || "",
    rutApoderado: safeInitialData.rutApoderado || "",
    telefonoApoderado: getTelefonoSinPrefijo(safeInitialData.telefonoApoderado),
    emailApoderado: safeInitialData.emailApoderado || "",
    // Otros datos
    rrss: safeInitialData.rrss || "",
    conocimientosPrevios: initBool(safeInitialData.conocimientosPrevios),
    instrumentos: initArray(safeInitialData.instrumentos),
    estilosMusicales: initArray(safeInitialData.estilosMusicales),
    otroEstilo: safeInitialData.otroEstilo || "",
    referenteMusical: safeInitialData.referenteMusical || "",
    condicionAprendizaje: initBool(safeInitialData.condicionAprendizaje),
    detalleCondicionAprendizaje: safeInitialData.detalleCondicionAprendizaje || "",
    condicionMedica: initBool(safeInitialData.condicionMedica),
    detalleCondicionMedica: safeInitialData.detalleCondicionMedica || "",
    observaciones: safeInitialData.observaciones || "",
    curso: safeInitialData.curso || "",
    tipoCurso: safeInitialData.tipoCurso || "",
    modalidadClase: safeInitialData.modalidadClase || "",
    dia: safeInitialData.dia || diaFromClase,
    hora: safeInitialData.hora || horaFromClase,
  });
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- handleChange con formateo de RUT, fecha y teléfonos ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "telefonoAlumno" || name === "telefonoApoderado") {
      val = value.replace(/[^0-9]/g, "").slice(0, 8);
    } else if (name === "rutAlumno" || name === "rutApoderado") {
      val = formatRut(value);
    } else if (name === "fechaIngreso") {
      val = value.replace(/[^0-9]/g, "");
      if (val.length > 2) val = val.slice(0, 2) + "-" + val.slice(2);
      if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 9);
      val = val.slice(0, 10);
    }
    setForm({ ...form, [name]: val });
    // Validación inmediata
    if (fieldValidators[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: fieldValidators[name](val) }));
    }
  };

  useEffect(() => {
    if (safeInitialData && safeInitialData.fechaIngreso) {
      setForm((prev) => ({
        ...prev,
        fechaIngreso: formatDateToCL(safeInitialData.fechaIngreso),
      }));
    }
  }, [safeInitialData]);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldValidators[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: fieldValidators[name](value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);

    // Validaciones extra
    // Validaciones modernas y robustas
    // Validación de todos los campos relevantes
    let newFieldErrors = {};
    Object.entries(fieldValidators).forEach(([key, fn]) => {
      if (key === "instrumentos" || key === "estilosMusicales") {
        newFieldErrors[key] = fn(form[key]);
      } else {
        newFieldErrors[key] = fn(form[key]);
      }
    });
    setFieldErrors(newFieldErrors);
    const firstError = Object.values(newFieldErrors).find((v) => v);
    if (firstError) {
      setError(firstError);
      setShowError(true);
      return;
    }
    // Unir día y hora en clase
    const clase = form.dia && form.hora ? `${form.dia} ${form.hora}` : "";
    const telefonoAlumno = "+569" + (form.telefonoAlumno || "");
    const telefonoApoderado = "+569" + (form.telefonoApoderado || "");
    try {
      await onSubmit({
        ...form,
        clase,
        telefonoAlumno,
        telefonoApoderado,
        fechaIngreso: form.fechaIngreso,
      });
    } catch (err) {
      setError(err.message || "Error al guardar el alumno");
      setShowError(true);
    }
  };

  // Para mostrar la fecha en el input tipo date, conviértela de chileno a ISO
  const fechaIngresoISO = form.fechaIngreso
    ? parseDateFromCL(form.fechaIngreso)
    : "";

return (
  <Dialog
    open={true}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    PaperProps={{
      sx: {
        background: "rgba(0,0,0,0.10)",
        boxShadow: "none",
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        minHeight: '100vh',
      },
    }}
    sx={{ zIndex: 2000 }}
  >
    {/* Modal tipo Windows para errores */}
    <Dialog
      open={showError && !!error}
      onClose={() => setShowError(false)}
      PaperProps={{
        sx: {
          minWidth: 340,
          maxWidth: 400,
          border: "2px solid #1976d2",
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "#fff",
          pt: 2,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0 }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
        <span
          style={{ fontWeight: 500, fontSize: "1.1rem", color: "#1976d2" }}
        >
          Error
        </span>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={() => setShowError(false)} size="small">
          <span
            style={{ fontWeight: "bold", fontSize: 18, color: "#1976d2" }}
          >
            ×
          </span>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <Typography sx={{ color: "#222", fontSize: "1.05rem" }}>
          {error}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          onClick={() => setShowError(false)}
          variant="contained"
          color="primary"
          autoFocus
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        background: "#f5f5f5",
        color: "#222",
        p: { xs: '20px 10px', sm: '32px 40px' },
        borderRadius: 3,
        minWidth: 0,
        maxWidth: { xs: '100%', sm: 700 },
        width: { xs: '100%', sm: '90vw', md: '700px' },
        maxHeight: { xs: '100vh', sm: '90vh' },
        mx: { xs: 0, sm: 'auto' },
        my: { xs: 2, sm: 4 },
        overflowY: 'auto',
        overflowX: 'hidden',
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        boxSizing: 'border-box',
      }}
    >
        <Typography variant="h5" sx={{ mb: 2, color: "#222" }}>
          {safeInitialData && safeInitialData._id
            ? "Editar Alumno"
            : "Agregar Alumno"}
        </Typography>
        {/* DATOS DE ALUMNO */}
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos del Alumno
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Nombre Alumno"
            name="nombreAlumno"
            value={form.nombreAlumno}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.nombreAlumno}
            helperText={fieldErrors.nombreAlumno}
            sx={{ flex: 1 }}
          />
          <TextField
            label="RUT Alumno"
            name="rutAlumno"
            value={form.rutAlumno}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.rutAlumno}
            helperText={fieldErrors.rutAlumno}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Edad Alumno"
            name="edadAlumno"
            value={form.edadAlumno}
            onChange={handleChange}
            type="number"
            required
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ min: 1, max: 99 }}
            error={!!fieldErrors.edadAlumno}
            helperText={fieldErrors.edadAlumno || "Edad entre 1 y 99 años"}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Teléfono Alumno"
            name="telefonoAlumno"
            value={form.telefonoAlumno}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ maxLength: 8 }}
            error={!!fieldErrors.telefonoAlumno}
            helperText={fieldErrors.telefonoAlumno || "Ejemplo: +569XXXXXXXX"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+569</InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.email}
            helperText={fieldErrors.email}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Fecha de Ingreso"
            name="fechaIngreso"
            value={form.fechaIngreso}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.fechaIngreso}
            helperText={fieldErrors.fechaIngreso || "Formato: DD-MM-AAAA"}
            placeholder="Ej: 19-07-2025"
            sx={{ flex: 1 }}
          />
        </Box>
        {/* DATOS DE APODERADO */}
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos del Apoderado
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Nombre Apoderado"
            name="nombreApoderado"
            value={form.nombreApoderado}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.nombreApoderado}
            helperText={fieldErrors.nombreApoderado}
            sx={{ flex: 1 }}
          />
          <TextField
            label="RUT Apoderado"
            name="rutApoderado"
            value={form.rutApoderado}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.rutApoderado}
            helperText={fieldErrors.rutApoderado}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Teléfono Apoderado"
            name="telefonoApoderado"
            value={form.telefonoApoderado}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            inputProps={{ maxLength: 8 }}
            error={!!fieldErrors.telefonoApoderado}
            helperText={fieldErrors.telefonoApoderado || "Ejemplo: +569XXXXXXXX"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">+569</InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Dirección"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            variant="outlined"
            sx={{ flex: 1 }}
          />
        </Box>
        {/* OTROS DATOS */}
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Otros Datos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          label="RRSS"
          name="rrss"
          value={form.rrss}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!fieldErrors.rrss}
          helperText={fieldErrors.rrss}
        />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Instrumentos (Separados por comas)"
            name="instrumentos"
            value={form.instrumentos.join(", ")}
            onChange={(e) => {
              const val = e.target.value.split(",").map((i) => i.trim());
              setForm({ ...form, instrumentos: val });
              setFieldErrors((prev) => ({ ...prev, instrumentos: fieldValidators.instrumentos(val) }));
            }}
            placeholder="Ej: Guitarra, Piano"
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.instrumentos}
            helperText={fieldErrors.instrumentos}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Estilos Musicales (Separados por comas)"
            name="estilosMusicales"
            value={form.estilosMusicales.join(", ")}
            onChange={(e) => {
              const val = e.target.value.split(",").map((i) => i.trim());
              setForm({ ...form, estilosMusicales: val });
              setFieldErrors((prev) => ({ ...prev, estilosMusicales: fieldValidators.estilosMusicales(val) }));
            }}
            placeholder="Ej: Rock, Jazz"
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!fieldErrors.estilosMusicales}
            helperText={fieldErrors.estilosMusicales}
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Otro Estilo"
            name="otroEstilo"
            value={form.otroEstilo}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Referente Musical"
            name="referenteMusical"
            value={form.referenteMusical}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.conocimientosPrevios}
                onChange={(e) =>
                  setForm({ ...form, conocimientosPrevios: e.target.checked })
                }
                name="conocimientosPrevios"
              />
            }
            label="Conocimientos Previos"
            sx={{ flex: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.condicionAprendizaje}
                onChange={(e) =>
                  setForm({ ...form, condicionAprendizaje: e.target.checked })
                }
                name="condicionAprendizaje"
              />
            }
            label="Condición de Aprendizaje"
            sx={{ flex: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.condicionMedica}
                onChange={(e) =>
                  setForm({ ...form, condicionMedica: e.target.checked })
                }
                name="condicionMedica"
              />
            }
            label="Condición Médica"
            sx={{ flex: 1 }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          {form.condicionAprendizaje && (
            <TextField
              label="Detalle Condición de Aprendizaje"
              name="detalleCondicionAprendizaje"
              value={form.detalleCondicionAprendizaje}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ flex: 1 }}
            />
          )}
          {form.condicionMedica && (
            <TextField
              label="Detalle Condición Médica"
              name="detalleCondicionMedica"
              value={form.detalleCondicionMedica}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{ flex: 1 }}
            />
          )}
        </Box>
        <TextField
          label="Observaciones"
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        {/* DATOS DE CLASE */}
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos de Clase
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            label="Curso"
            name="curso"
            value={form.curso}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
            sx={{ flex: 1 }}
          />
          <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
            <InputLabel id="tipoCurso-label">Tipo de Curso</InputLabel>
            <Select
              labelId="tipoCurso-label"
              name="tipoCurso"
              value={form.tipoCurso}
              onChange={handleSelectChange}
              required
              label="Tipo de Curso"
            >
              {tipoCursoOpciones.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
            <InputLabel id="modalidadClase-label">Modalidad de Clase</InputLabel>
            <Select
              labelId="modalidadClase-label"
              name="modalidadClase"
              value={form.modalidadClase}
              onChange={handleSelectChange}
              required
              label="Modalidad de Clase"
            >
              {modalidadOpciones.map((op) => (
                <MenuItem key={op} value={op}>
                  {op}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
            <InputLabel id="dia-label">Día</InputLabel>
            <Select
              labelId="dia-label"
              name="dia"
              value={form.dia}
              onChange={handleSelectChange}
              required
              label="Día"
            >
              {diasSemana.map((dia) => (
                <MenuItem key={dia} value={dia}>
                  {dia}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TextField
          label="Hora (HH:mm)"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          placeholder="Ej: 16:00"
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Otros Datos
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          label="RRSS"
          name="rrss"
          value={form.rrss}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!fieldErrors.rrss}
          helperText={fieldErrors.rrss}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.conocimientosPrevios}
              onChange={(e) =>
                setForm({ ...form, conocimientosPrevios: e.target.checked })
              }
              name="conocimientosPrevios"
            />
          }
          label="Conocimientos Previos"
        />
        <TextField
          label="Instrumentos (Separados por comas)"
          name="instrumentos"
          value={form.instrumentos.join(", ")}
          onChange={(e) => {
            const val = e.target.value.split(",").map((i) => i.trim());
            setForm({ ...form, instrumentos: val });
            setFieldErrors((prev) => ({ ...prev, instrumentos: fieldValidators.instrumentos(val) }));
          }}
          placeholder="Ej: Guitarra, Piano"
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!fieldErrors.instrumentos}
          helperText={fieldErrors.instrumentos}
        />
        <TextField
          label="Estilos Musicales (Separados por comas)"
          name="estilosMusicales"
          value={form.estilosMusicales.join(", ")}
          onChange={(e) => {
            const val = e.target.value.split(",").map((i) => i.trim());
            setForm({ ...form, estilosMusicales: val });
            setFieldErrors((prev) => ({ ...prev, estilosMusicales: fieldValidators.estilosMusicales(val) }));
          }}
          placeholder="Ej: Rock, Jazz"
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!fieldErrors.estilosMusicales}
          helperText={fieldErrors.estilosMusicales}
        />
        <TextField
          label="Otro Estilo"
          name="otroEstilo"
          value={form.otroEstilo}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Referente Musical"
          name="referenteMusical"
          value={form.referenteMusical}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.condicionAprendizaje}
              onChange={(e) =>
                setForm({ ...form, condicionAprendizaje: e.target.checked })
              }
              name="condicionAprendizaje"
            />
          }
          label="Condición de Aprendizaje"
        />
        <TextField
          label="Detalle Condición de Aprendizaje"
          name="detalleCondicionAprendizaje"
          value={form.detalleCondicionAprendizaje}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.condicionMedica}
              onChange={(e) =>
                setForm({ ...form, condicionMedica: e.target.checked })
              }
              name="condicionMedica"
            />
          }
          label="Condición Médica"
        />
        <TextField
          label="Detalle Condición Médica"
          name="detalleCondicionMedica"
          value={form.detalleCondicionMedica}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Observaciones"
          name="observaciones"
          value={form.observaciones}
          onChange={handleChange}
          multiline
          rows={4}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos de Clase
        </Typography>
        <TextField
          label="Curso"
          name="curso"
          value={form.curso}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />
        {/* Select para Tipo de Curso */}
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="tipoCurso-label">Tipo de Curso</InputLabel>
          <Select
            labelId="tipoCurso-label"
            name="tipoCurso"
            value={form.tipoCurso}
            onChange={handleSelectChange}
            required
            label="Tipo de Curso"
          >
            {tipoCursoOpciones.map((op) => (
              <MenuItem key={op} value={op}>
                {op}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Select para Modalidad de Clase */}
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="modalidadClase-label">Modalidad de Clase</InputLabel>
          <Select
            labelId="modalidadClase-label"
            name="modalidadClase"
            value={form.modalidadClase}
            onChange={handleSelectChange}
            required
            label="Modalidad de Clase"
          >
            {modalidadOpciones.map((op) => (
              <MenuItem key={op} value={op}>
                {op}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Select para Día */}
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel id="dia-label">Día</InputLabel>
          <Select
            labelId="dia-label"
            name="dia"
            value={form.dia}
            onChange={handleSelectChange}
            required
            label="Día"
          >
            {diasSemana.map((dia) => (
              <MenuItem key={dia} value={dia}>
                {dia}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Campo de texto para Hora */}
        <TextField
          label="Hora (HH:mm)"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          placeholder="Ej: 16:00"
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Guardar
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outlined"
            sx={{ ml: 2 }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default AlumnoForm;
