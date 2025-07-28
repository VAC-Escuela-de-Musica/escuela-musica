import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
} from "@mui/material";
import { es } from "date-fns/locale";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AlumnoDatos from "./AlumnoDatos";
import ApoderadoDatos from "./ApoderadoDatos";
import ClaseDatos from "./ClaseDatos";
import OtrosDatos from "./OtrosDatos";
import ErrorDialog from "./ErrorDialog";
import { fieldValidators } from "./validators";
import {
  initArray,
  initBool,
  getTelefonoSinPrefijo,
  extractDiaHoraFromClase,
} from "./utils";
import styles from "./AlumnoForm.module.css";

const steps = [
  "Datos del Alumno",
  "Datos del Apoderado",
  "Otros Datos",
  "Datos de Clase",
];

function AlumnoForm({ initialData = {}, onSubmit, onClose }) {
  const safeInitialData = initialData || {};
  let dia = safeInitialData.dia || "";
  let hora = safeInitialData.hora || "";
  if (!dia && !hora && safeInitialData.clase) {
    const extraidos = extractDiaHoraFromClase(safeInitialData.clase);
    dia = extraidos.dia;
    hora = extraidos.hora;
  }

  const [activeStep, setActiveStep] = useState(0);
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

  // Validación por paso
  const validateStep = () => {
    let requiredFields = [];
    if (activeStep === 0) {
      requiredFields = [
        "nombreAlumno",
        "rutAlumno",
        "edadAlumno",
        "telefonoAlumno",
        "email",
        "fechaIngreso",
      ];
      // Solo incluir password si es un alumno nuevo o si se está mostrando el campo de cambio de contraseña
      if (!safeInitialData._id || showPasswordField) {
        requiredFields.push("password");
      }
    }
    if (activeStep === 1) {
      requiredFields = ["nombreApoderado", "rutApoderado", "telefonoApoderado"];
    }
    if (activeStep === 2) {
      // Puedes agregar campos obligatorios si lo deseas
    }
    if (activeStep === 3) {
      requiredFields = ["curso", "tipoCurso", "modalidadClase", "dia", "hora"];
    }
    let errors = {};
    requiredFields.forEach((key) => {
      if (fieldValidators[key]) {
        errors[key] = fieldValidators[key](form[key]);
      } else if (!form[key]) {
        errors[key] = "Este campo es obligatorio";
      }
    });
    setFieldErrors(errors);
    return Object.values(errors).filter((v) => v).length === 0;
  };

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

  const handleFechaIngresoChange = (date) => {
    setForm({ ...form, fechaIngreso: date });
    if (fieldValidators["fechaIngreso"]) {
      setFieldErrors((prev) => ({
        ...prev,
        fechaIngreso: fieldValidators["fechaIngreso"](date),
      }));
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    } else {
      setError("Por favor completa los campos obligatorios.");
      setShowError(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
    setShowError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) {
      setError("Por favor completa los campos obligatorios.");
      setShowError(true);
      return;
    }
    setError("");
    setShowError(false);

    const clase = form.dia && form.hora ? `${form.dia} ${form.hora}` : "";
    const telefonoAlumno =
      (form.codigoPaisAlumno || "") + (form.telefonoAlumno || "");
    const telefonoApoderado =
      (form.codigoPaisApoderado || "") + (form.telefonoApoderado || "");

    // Convertir la fecha al formato ISO string para el servidor
    const fechaIngresoFormatted =
      form.fechaIngreso instanceof Date
        ? form.fechaIngreso.toISOString().split("T")[0] // Formato YYYY-MM-DD
        : form.fechaIngreso;

    const dataToSend = {
      ...form,
      clase,
      telefonoAlumno,
      telefonoApoderado,
      fechaIngreso: fechaIngresoFormatted,
    };

    // Limpiar campos vacíos que pueden causar problemas
    if (!dataToSend.rrss) dataToSend.rrss = "";
    if (!dataToSend.direccion) dataToSend.direccion = "";
    if (!dataToSend.otroEstilo) dataToSend.otroEstilo = "";
    if (!dataToSend.referenteMusical) dataToSend.referenteMusical = "";
    if (!dataToSend.detalleCondicionAprendizaje)
      dataToSend.detalleCondicionAprendizaje = "";
    if (!dataToSend.detalleCondicionMedica)
      dataToSend.detalleCondicionMedica = "";
    if (!dataToSend.observaciones) dataToSend.observaciones = "";
    if (!dataToSend.emailApoderado) dataToSend.emailApoderado = "";

    // Asegurar que los arrays no estén vacíos o tengan elementos vacíos
    if (
      !Array.isArray(dataToSend.instrumentos) ||
      dataToSend.instrumentos.length === 0
    ) {
      dataToSend.instrumentos = [];
    } else {
      dataToSend.instrumentos = dataToSend.instrumentos.filter(
        (i) => i.trim() !== ""
      );
    }

    if (
      !Array.isArray(dataToSend.estilosMusicales) ||
      dataToSend.estilosMusicales.length === 0
    ) {
      dataToSend.estilosMusicales = [];
    } else {
      dataToSend.estilosMusicales = dataToSend.estilosMusicales.filter(
        (e) => e.trim() !== ""
      );
    }

    // Asegurar que los valores booleanos estén correctamente establecidos
    dataToSend.conocimientosPrevios = Boolean(dataToSend.conocimientosPrevios);
    dataToSend.condicionAprendizaje = Boolean(dataToSend.condicionAprendizaje);
    dataToSend.condicionMedica = Boolean(dataToSend.condicionMedica);

    // Eliminar campos que no están en el schema
    delete dataToSend.codigoPaisAlumno;
    delete dataToSend.codigoPaisApoderado;

    if (
      safeInitialData._id &&
      (!showPasswordField || form.password === "********")
    ) {
      delete dataToSend.password;
    }

    try {
      await onSubmit(dataToSend);
    } catch (err) {
      let errorMessage = "Error al guardar el alumno";

      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setShowError(true);
    }
  };

  // Renderiza el contenido de cada paso
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
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
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(51, 51, 51, 1)",
                        color: "#ffffff",
                        "& fieldset": {
                          borderColor: "#555555",
                        },
                        "&:hover fieldset": {
                          borderColor: "#2196f3",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#2196f3",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#aaaaaa",
                        "&.Mui-focused": {
                          color: "#2196f3",
                        },
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#aaaaaa",
                        "&.Mui-error": {
                          color: "#f44336",
                        },
                      },
                      "& .MuiIconButton-root": {
                        color: "#aaaaaa",
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
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
                onClick={() => setShowPasswordField(true)}
                sx={{
                  gridColumn: "1 / -1",
                  mt: 1,
                  borderColor: "#2196f3",
                  color: "#2196f3",
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    borderColor: "#1976d2",
                  },
                }}
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
        );
      case 1:
        return (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
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
        );
      case 2:
        return (
          <Box>
            <OtrosDatos
              values={form}
              errors={fieldErrors}
              onChange={handleChange}
            />
          </Box>
        );
      case 3:
        return (
          <Box>
            <ClaseDatos
              values={form}
              errors={fieldErrors}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
            />
          </Box>
        );
      default:
        return null;
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
      PaperProps={{
        sx: {
          backgroundColor: "rgba(42, 42, 42, 1)",
          color: "rgba(42, 42, 42, 1))",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#3a3a3a",
          color: "#2196f3",
          fontWeight: "bold",
          fontSize: "1.5rem",
          borderBottom: "1px solid #444444",
        }}
      >
        {safeInitialData && safeInitialData._id
          ? "Editar Alumno"
          : "Agregar Alumno"}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          backgroundColor: "#2a2a2a",
          borderColor: "#444444",
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 3,
            "& .MuiStepLabel-label": {
              color: "#ffffff",
              "&.Mui-active": {
                color: "#2196f3",
                fontWeight: "bold",
              },
              "&.Mui-completed": {
                color: "#2196f3",
              },
            },
            "& .MuiStepIcon-root": {
              color: "#555555",
              "&.Mui-active": {
                color: "#2196f3",
              },
              "&.Mui-completed": {
                color: "#2196f3",
              },
            },
            "& .MuiStepConnector-line": {
              borderColor: "#555555",
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box
          component="form"
          id="alumno-form"
          onSubmit={handleSubmit}
          className={styles.formContainer}
          sx={{ p: { xs: 1, sm: 2 }, boxSizing: "border-box" }}
        >
          {renderStepContent()}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#3a3a3a",
          borderTop: "1px solid #444444",
          "& .MuiButton-outlined": {
            borderColor: "#2196f3",
            color: "#2196f3",
            "&:hover": {
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              borderColor: "#1976d2",
            },
          },
          "& .MuiButton-text": {
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          },
        }}
      >
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined">
            Anterior
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} variant="contained" color="primary">
            Siguiente
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            type="submit"
            variant="contained"
            color="success"
            form="alumno-form"
          >
            Guardar
          </Button>
        )}
        <Button type="button" onClick={onClose} variant="text">
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
