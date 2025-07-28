// Subcomponente: otros datos y observaciones
import React from "react";
import { TextField, Box, Checkbox, FormControlLabel } from "@mui/material";
import styles from "./AlumnoForm.module.css";

// Estilos oscuros para los TextField
const darkTextFieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#2a2a2a !important",
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
    "& input": {
      backgroundColor: "transparent !important",
      color: "#ffffff",
    },
    "& textarea": {
      backgroundColor: "transparent !important",
      color: "#ffffff",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaaaaa",
    "&.Mui-focused": {
      color: "#2196f3",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: "#aaaaaa",
    opacity: 1,
  },
  "& .MuiFormHelperText-root": {
    color: "#aaaaaa",
    "&.Mui-error": {
      color: "#f44336",
    },
  },
};

function OtrosDatos({ values, errors, onChange }) {
  return (
    <Box>
      <TextField
        label="Estilos Musicales (Separados por comas)"
        name="estilosMusicales"
        value={values.estilosMusicales.join(", ")}
        onChange={onChange}
        placeholder="Ej: Rock, Jazz"
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.estilosMusicales}
        helperText={errors.estilosMusicales}
        sx={darkTextFieldStyles}
      />
      <TextField
        label="Otro Estilo"
        name="otroEstilo"
        value={values.otroEstilo}
        onChange={onChange}
        fullWidth
        margin="normal"
        variant="outlined"
        placeholder="Ejemplo: Bolero, Metal, Salsa, Punk, etc."
        sx={darkTextFieldStyles}
      />
      <TextField
        label="Referente Musical"
        name="referenteMusical"
        value={values.referenteMusical}
        onChange={onChange}
        fullWidth
        margin="normal"
        variant="outlined"
        sx={darkTextFieldStyles}
      />
      <TextField
        label="Instrumentos (separados por comas)"
        name="instrumentos"
        value={
          Array.isArray(values.instrumentos)
            ? values.instrumentos.join(", ")
            : values.instrumentos || ""
        }
        onChange={onChange}
        fullWidth
        margin="normal"
        helperText={errors.instrumentos}
        sx={darkTextFieldStyles}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "row" },
          gap: { xs: 1, sm: 2 },
          justifyContent: { xs: "space-between", sm: "center" },
          alignItems: "center",
          mb: 2,
          flexWrap: { xs: "wrap", sm: "nowrap" },
          width: "100%",
          "& .MuiFormControlLabel-root": {
            "& .MuiFormControlLabel-label": {
              color: "#ffffff !important",
              fontSize: "1rem !important",
              fontWeight: "400 !important",
              opacity: "1 !important",
            },
          },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={values.conocimientosPrevios}
              onChange={onChange}
              name="conocimientosPrevios"
              sx={{
                color: "#aaaaaa",
                "&.Mui-checked": {
                  color: "#2196f3",
                },
              }}
            />
          }
          label="Conocimientos Previos"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={values.condicionAprendizaje}
              onChange={onChange}
              name="condicionAprendizaje"
              sx={{
                color: "#aaaaaa",
                "&.Mui-checked": {
                  color: "#2196f3",
                },
              }}
            />
          }
          label="Condición de Aprendizaje"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={values.condicionMedica}
              onChange={onChange}
              name="condicionMedica"
              sx={{
                color: "#aaaaaa",
                "&.Mui-checked": {
                  color: "#2196f3",
                },
              }}
            />
          }
          label="Condición Médica"
        />
      </Box>
      {values.condicionAprendizaje && (
        <TextField
          label="Detalle Condición de Aprendizaje"
          name="detalleCondicionAprendizaje"
          value={values.detalleCondicionAprendizaje}
          onChange={onChange}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={darkTextFieldStyles}
        />
      )}
      {values.condicionMedica && (
        <TextField
          label="Detalle Condición Médica"
          name="detalleCondicionMedica"
          value={values.detalleCondicionMedica}
          onChange={onChange}
          fullWidth
          margin="normal"
          variant="outlined"
          sx={darkTextFieldStyles}
        />
      )}
      <TextField
        label="Observaciones"
        name="observaciones"
        value={values.observaciones}
        onChange={onChange}
        multiline
        rows={4}
        fullWidth
        margin="normal"
        variant="outlined"
        sx={darkTextFieldStyles}
      />
    </Box>
  );
}

export default OtrosDatos;
