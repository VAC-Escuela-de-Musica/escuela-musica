import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Divider,
} from "@mui/material";

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const [form, setForm] = useState({
    // Datos del alumno
    nombreAlumno: "",
    rutAlumno: "",
    edadAlumno: "",
    direccion: "",
    telefonoAlumno: "",
    email: "",
    fechaIngreso: "",
    // Datos del apoderado
    nombreApoderado: "",
    rutApoderado: "",
    telefonoApoderado: "",
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
    ...initialData,
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    if (initialData && initialData.fechaIngreso) {
      setForm((prev) => ({
        ...prev,
        fechaIngreso: new Date(initialData.fechaIngreso)
          .toISOString()
          .split("T")[0],
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message || "Error al guardar el alumno");
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "flex-start", // Alinea arriba
        justifyContent: "center",
        zIndex: 1000,
        pt: 10, // Solo margen superior
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          background: "#444",
          color: "#fff",
          p: 3,
          borderRadius: 2,
          minWidth: 280,
          maxWidth: 400,
          width: "90vw",
          maxHeight: "90vh",
          mx: "auto",
          overflowY: "auto",
          boxShadow: 4,
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Typography variant="h5" sx={{ mb: 2 }}>
          {initialData && initialData._id ? "Editar Alumno" : "Agregar Alumno"}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
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
          variant="filled"
        />
        <TextField
          label="RUT Apoderado"
          name="rutApoderado"
          value={form.rutApoderado}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Teléfono Apoderado"
          name="telefonoApoderado"
          value={form.telefonoApoderado}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Dirección"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
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
          variant="filled"
        />
        <TextField
          label="RUT Alumno"
          name="rutAlumno"
          value={form.rutAlumno}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Edad Alumno"
          name="edadAlumno"
          value={form.edadAlumno}
          onChange={handleChange}
          type="number"
          required
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Teléfono Alumno"
          name="telefonoAlumno"
          value={form.telefonoAlumno}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Fecha de Ingreso"
          name="fechaIngreso"
          value={form.fechaIngreso}
          onChange={handleChange}
          type="date"
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          variant="filled"
        />
        <Typography variant="h6" sx={{ mt: 2 }}>
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
          variant="filled"
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
          variant="filled"
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
          variant="filled"
        />
        <TextField
          label="Otro Estilo"
          name="otroEstilo"
          value={form.otroEstilo}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Referente Musical"
          name="referenteMusical"
          value={form.referenteMusical}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
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
          variant="filled"
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
          variant="filled"
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
          variant="filled"
        />
        <TextField
          label="Curso"
          name="curso"
          value={form.curso}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Tipo de Curso"
          name="tipoCurso"
          value={form.tipoCurso}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Modalidad de Clase"
          name="modalidadClase"
          value={form.modalidadClase}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Día"
          name="dia"
          value={form.dia}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
        />
        <TextField
          label="Hora"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="filled"
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
