import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from "@mui/material";
import { es } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AlumnoDatos from "./AlumnoDatos";
import ApoderadoDatos from "./ApoderadoDatos";
import ClaseDatos from "./ClaseDatos";
import OtrosDatos from "./OtrosDatos";
import ErrorDialog from "./ErrorDialog";
import { fieldValidators } from "./validators";
import {
  formatDateToCL,
  parseDateFromCL,
  initArray,
  initBool,
  getTelefonoSinPrefijo,
  extractDiaHoraFromClase,
} from "./utils";
import styles from "./AlumnoForm.module.css";

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const safeInitialData = initialData || {};
  let dia = safeInitialData.dia || "";
  let hora = safeInitialData.hora || "";
  if (!dia && !hora && safeInitialData.clase) {
    const extraidos = extractDiaHoraFromClase(safeInitialData.clase);
    dia = extraidos.dia;
    hora = extraidos.hora;
  }

  const [showPasswordField, setShowPasswordField] = useState(false);

  const [form, setForm] = useState({
    nombreAlumno: safeInitialData.nombreAlumno || "",
    rutAlumno: safeInitialData.rutAlumno || "",
    edadAlumno: safeInitialData.edadAlumno || "",
    direccion: safeInitialData.direccion || "",
    codigoPaisAlumno: safeInitialData.codigoPaisAlumno || "+56",
    telefonoAlumno: getTelefonoSinPrefijo(
      safeInitialData.telefonoAlumno,
      safeInitialData.codigoPaisAlumno || "+56",
      9
    ),
    email: safeInitialData.email || "",
    fechaIngreso: safeInitialData.fechaIngreso
      ? new Date(safeInitialData.fechaIngreso)
      : null,
    nombreApoderado: safeInitialData.nombreApoderado || "",
    rutApoderado: safeInitialData.rutApoderado || "",
    codigoPaisApoderado: safeInitialData.codigoPaisApoderado || "+56",
    telefonoApoderado: getTelefonoSinPrefijo(
      safeInitialData.telefonoApoderado,
      safeInitialData.codigoPaisApoderado || "+56",
      9
    ),
    emailApoderado: safeInitialData.emailApoderado || "",
    rrss: safeInitialData.rrss || "",
    conocimientosPrevios: initBool(safeInitialData.conocimientosPrevios),
    instrumentos: initArray(safeInitialData.instrumentos),
    estilosMusicales: initArray(safeInitialData.estilosMusicales),
    otroEstilo: safeInitialData.otroEstilo || "",
    referenteMusical: safeInitialData.referenteMusical || "",
    condicionAprendizaje: initBool(safeInitialData.condicionAprendizaje),
    detalleCondicionAprendizaje:
      safeInitialData.detalleCondicionAprendizaje || "",
    condicionMedica: initBool(safeInitialData.condicionMedica),
    detalleCondicionMedica: safeInitialData.detalleCondicionMedica || "",
    observaciones: safeInitialData.observaciones || "",
    curso: safeInitialData.curso || "",
    tipoCurso: safeInitialData.tipoCurso || "",
    modalidadClase: safeInitialData.modalidadClase || "",
    dia,
    hora,
    password: safeInitialData._id ? "********" : "",
  });

  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    let newForm = { ...form };
    if (name === "instrumentos" || name === "estilosMusicales") {
      val = value.split(",").map((i) => i.trim());
    }
    if (name === "password" && value !== "********") {
      newForm.password = value;
    } else {
      newForm[name] = val;
    }
    if (name === "condicionMedica" && !checked) {
      newForm.detalleCondicionMedica = "";
    }
    if (name === "condicionAprendizaje" && !checked) {
      newForm.detalleCondicionAprendizaje = "";
    }
    setForm(newForm);
    if (fieldValidators[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldValidators[name](val),
      }));
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (fieldValidators[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: fieldValidators[name](value),
      }));
    }
  };

  // Cambia la fecha desde el DatePicker
  const handleFechaIngresoChange = (date) => {
    setForm({ ...form, fechaIngreso: date });
    if (fieldValidators["fechaIngreso"]) {
      setFieldErrors((prev) => ({
        ...prev,
        fechaIngreso: fieldValidators["fechaIngreso"](date),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);
    let newFieldErrors = {};
    Object.entries(fieldValidators).forEach(([key, fn]) => {
      newFieldErrors[key] = fn(form[key]);
    });

    if (
      !safeInitialData._id ||
      (safeInitialData._id && showPasswordField && form.password !== "********")
    ) {
      if (!form.password || form.password.length < 6) {
        newFieldErrors.password =
          "La contraseña es obligatoria y debe tener al menos 6 caracteres.";
      }
    }

    const firstError = Object.values(newFieldErrors).find((v) => v);
    setFieldErrors(newFieldErrors);
    if (firstError) {
      setError(firstError);
      setShowError(true);
      return;
    }
    const clase = form.dia && form.hora ? `${form.dia} ${form.hora}` : "";
    const telefonoAlumno =
      (form.codigoPaisAlumno || "") + (form.telefonoAlumno || "");
    const telefonoApoderado =
      (form.codigoPaisApoderado || "") + (form.telefonoApoderado || "");

    const dataToSend = {
      ...form,
      clase,
      telefonoAlumno,
      telefonoApoderado,
      fechaIngreso: form.fechaIngreso,
    };
    if (
      safeInitialData._id &&
      (!showPasswordField || form.password === "********")
    ) {
      delete dataToSend.password;
    }

    try {
      await onSubmit(dataToSend);
    } catch (err) {
      setError(err.message || "Error al guardar el alumno");
      setShowError(true);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      disableEnforceFocus
      disableAutoFocus
    >
      <DialogTitle>
        {safeInitialData && safeInitialData._id
          ? "Editar Alumno"
          : "Agregar Alumno"}
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          id="alumno-form"
          onSubmit={handleSubmit}
          className={styles.formContainer}
          sx={{ p: { xs: 1, sm: 2 }, boxSizing: "border-box" }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" className={styles.sectionSubtitle}>
                Datos del Alumno
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="nombreAlumno"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="rutAlumno"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="edadAlumno"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="codigoPaisAlumno"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="telefonoAlumno"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="email"
                />
                {/* CAMPO FECHA EN ESPAÑOL */}
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={es}
                >
                  <DatePicker
                    label="Fecha de Ingreso"
                    value={form.fechaIngreso}
                    onChange={handleFechaIngresoChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="fechaIngreso"
                        error={!!fieldErrors.fechaIngreso}
                        helperText={fieldErrors.fechaIngreso}
                        fullWidth
                      />
                    )}
                  />
                </LocalizationProvider>
                {/* FIN CAMPO FECHA */}
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="rrss"
                />
                <AlumnoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="direccion"
                />
                {!safeInitialData._id && (
                  <AlumnoDatos
                    values={form}
                    errors={fieldErrors}
                    onChange={handleChange}
                    gridField="password"
                  />
                )}
                {safeInitialData._id && !showPasswordField && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => setShowPasswordField(true)}
                    sx={{ gridColumn: "1 / -1", mt: 1 }}
                  >
                    Cambiar contraseña
                  </Button>
                )}
                {safeInitialData._id && showPasswordField && (
                  <AlumnoDatos
                    values={form}
                    errors={fieldErrors}
                    onChange={handleChange}
                    gridField="password"
                  />
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" className={styles.sectionSubtitle}>
                Datos del Apoderado
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <ApoderadoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="nombreApoderado"
                />
                <ApoderadoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="rutApoderado"
                />
                <ApoderadoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="codigoPaisApoderado"
                />
                <ApoderadoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="telefonoApoderado"
                />
                <ApoderadoDatos
                  values={form}
                  errors={fieldErrors}
                  onChange={handleChange}
                  gridField="emailApoderado"
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Otros Datos
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <OtrosDatos
                values={form}
                errors={fieldErrors}
                onChange={handleChange}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Datos de Clase
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ClaseDatos
                values={form}
                errors={fieldErrors}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          form="alumno-form"
        >
          Guardar
        </Button>
        <Button type="button" onClick={onClose} variant="outlined">
          Cancelar
        </Button>
      </DialogActions>
      <ErrorDialog
        open={showError && !!error}
        error={error}
        onClose={() => setShowError(false)}
      />
    </Dialog>
  );
}

export default AlumnoForm;
