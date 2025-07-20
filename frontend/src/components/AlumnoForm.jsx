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

// --- FUNCIÓN DE FORMATEO DE RUT ---
function formatRut(value) {
  let clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
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
  return `${cuerpoFormateado}-${dv}`;
}

// --- FUNCIÓN DE VALIDACIÓN DE RUT SOLO FORMATO ---
function validateRut(rut) {
  if (!rut) return false;
  // Solo valida el formato: XX.XXX.XXX-X o X.XXX.XXX-X o XXXXXXXX-X
  const regex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/;
  return regex.test(rut);
}

// --- FORMATEO Y PARSEO DE FECHA CHILENA ---
function formatDateToCL(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function parseDateFromCL(clDateStr) {
  if (!clDateStr) return "";
  const [day, month, year] = clDateStr.split("-");
  return `${year}-${month}-${day}`;
}

const tipoCursoOpciones = ["Grupal", "Individual"];
const modalidadOpciones = ["Presencial", "Online"];
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const safeInitialData = initialData || {};

  // Solo los 8 dígitos del teléfono, sin el prefijo
  const getTelefonoSinPrefijo = (tel) =>
    tel && tel.startsWith("+569") ? tel.slice(4) : tel || "";

  // Inicializa la fecha en formato chileno si viene en formato ISO
  const initialFechaIngreso =
    safeInitialData.fechaIngreso && safeInitialData.fechaIngreso.includes("-")
      ? formatDateToCL(safeInitialData.fechaIngreso)
      : safeInitialData.fechaIngreso || "";

  const [form, setForm] = useState({
    // Datos del alumno
    nombreAlumno: "",
    rutAlumno: "",
    edadAlumno: "",
    direccion: "",
    telefonoAlumno: getTelefonoSinPrefijo(safeInitialData.telefonoAlumno),
    email: "",
    fechaIngreso: initialFechaIngreso,
    // Datos del apoderado
    nombreApoderado: "",
    rutApoderado: "",
    telefonoApoderado: getTelefonoSinPrefijo(safeInitialData.telefonoApoderado),
    // Otros datos
    rrss: "",
    conocimientosPrevios: false,
    instrumentos: [],
    estilosMusicales: [],
    otroEstilo: "",
    referenteMusical: "",
    condicionAprendizaje: false,
    detalleCondicionAprendizaje: "",
    condicionMedica: false,
    detalleCondicionMedica: "",
    observaciones: "",
    curso: "",
    tipoCurso: "",
    modalidadClase: "",
    dia: "",
    hora: "",
    ...safeInitialData,
    fechaIngreso: initialFechaIngreso,
  });
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  // --- handleChange con formateo de RUT, fecha y teléfonos ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telefonoAlumno" || name === "telefonoApoderado") {
      // Solo permite 8 dígitos numéricos
      const soloNumeros = value.replace(/[^0-9]/g, "").slice(0, 8);
      setForm({ ...form, [name]: soloNumeros });
    } else if (name === "rutAlumno" || name === "rutApoderado") {
      setForm({ ...form, [name]: formatRut(value) });
    } else if (name === "fechaIngreso") {
      setForm({ ...form, fechaIngreso: formatDateToCL(value) });
    } else {
      setForm({ ...form, [name]: value });
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);

    // Validaciones extra
    if (!form.nombreAlumno || form.nombreAlumno.length < 3) {
      setError(
        "El nombre del alumno es obligatorio y debe tener al menos 3 letras."
      );
      setShowError(true);
      return;
    }
    if (!validateRut(form.rutAlumno)) {
      setError("El RUT del alumno no es válido. Debe tener puntos y guion.");
      setShowError(true);
      return;
    }
    if (!form.fechaIngreso || form.fechaIngreso.length !== 10) {
      setError(
        "La fecha de ingreso es obligatoria y debe tener el formato DD-MM-AAAA."
      );
      setShowError(true);
      return;
    }
    if (form.rutApoderado && !validateRut(form.rutApoderado)) {
      setError("El RUT del apoderado no es válido.");
      setShowError(true);
      return;
    }

    // Unir día y hora en clase
    const clase = form.dia && form.hora ? `${form.dia} ${form.hora}` : "";
    // Teléfonos: agregar el prefijo antes de enviar
    const telefonoAlumno = "+569" + (form.telefonoAlumno || "");
    const telefonoApoderado = "+569" + (form.telefonoApoderado || "");
    try {
      await onSubmit({
        ...form,
        clase,
        telefonoAlumno,
        telefonoApoderado,
        // La fecha se envía en formato chileno
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
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 1000,
        pt: 10,
      }}
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
          p: 3,
          borderRadius: 3,
          minWidth: 280,
          maxWidth: 400,
          width: "90vw",
          maxHeight: "90vh",
          mx: "auto",
          overflowY: "auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#222" }}>
          {safeInitialData && safeInitialData._id
            ? "Editar Alumno"
            : "Agregar Alumno"}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos del Apoderado
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          label="Nombre Apoderado"
          name="nombreApoderado"
          value={form.nombreApoderado}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="RUT Apoderado"
          name="rutApoderado"
          value={form.rutApoderado}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Teléfono Apoderado"
          name="telefonoApoderado"
          value={form.telefonoApoderado}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          inputProps={{ maxLength: 8 }}
          helperText="Ejemplo: +569XXXXXXXX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">+569</InputAdornment>
            ),
          }}
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
        />
        <Typography variant="h6" sx={{ mt: 2, color: "#444" }}>
          Datos del Alumno
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TextField
          label="Nombre Alumno"
          name="nombreAlumno"
          value={form.nombreAlumno}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          variant="outlined"
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
        />
        <TextField
          label="Edad Alumno"
          name="edadAlumno"
          value={form.edadAlumno}
          onChange={(e) => {
            // Solo permite números positivos y máximo 2 dígitos
            let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
            setForm({ ...form, edadAlumno: val });
          }}
          type="number"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          inputProps={{ min: 1, max: 99 }}
          helperText="Edad entre 1 y 99 años"
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
          helperText="Ejemplo: +569XXXXXXXX"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">+569</InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Fecha de Ingreso"
          name="fechaIngreso"
          value={form.fechaIngreso}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9]/g, "");
            if (val.length > 2) val = val.slice(0, 2) + "-" + val.slice(2);
            if (val.length > 5) val = val.slice(0, 5) + "-" + val.slice(5, 9);
            val = val.slice(0, 10); // Limita a DD-MM-AAAA
            setForm({ ...form, fechaIngreso: val });
          }}
          fullWidth
          margin="normal"
          variant="outlined"
          helperText="Formato: DD-MM-AAAA"
          placeholder="Ej: 19-07-2025"
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
          onChange={(e) =>
            setForm({
              ...form,
              instrumentos: e.target.value.split(",").map((i) => i.trim()),
            })
          }
          placeholder="Ej: Guitarra, Piano"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <TextField
          label="Estilos Musicales (Separados por comas)"
          name="estilosMusicales"
          value={form.estilosMusicales.join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              estilosMusicales: e.target.value.split(",").map((i) => i.trim()),
            })
          }
          placeholder="Ej: Rock, Jazz"
          fullWidth
          margin="normal"
          variant="outlined"
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
    </Box>
  );
}

export default AlumnoForm;
