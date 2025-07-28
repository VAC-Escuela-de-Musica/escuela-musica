import { formatearRut } from "./utils/rutUtils";
// Subcomponente: datos del apoderado
import React from "react";
import { TextField, Box } from "@mui/material";

// Estilos oscuros para los TextField
const darkTextFieldStyles = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#333333",
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

function ApoderadoDatos({ values, errors, onChange, gridField }) {
  if (gridField === "nombreApoderado") {
    return (
      <TextField
        label="Nombre Apoderado"
        name="nombreApoderado"
        value={values.nombreApoderado}
        onChange={onChange}
        fullWidth
        required
        margin="normal"
        variant="outlined"
        error={!!errors.nombreApoderado}
        helperText={errors.nombreApoderado}
        sx={darkTextFieldStyles}
      />
    );
  }
  if (gridField === "rutApoderado") {
    const handleRutChange = (e) => {
      const val = e.target.value;
      const formatted = formatearRut(val);
      onChange({
        target: {
          name: "rutApoderado",
          value: formatted,
        },
      });
    };
    return (
      <TextField
        label="RUT Apoderado"
        name="rutApoderado"
        value={values.rutApoderado}
        onChange={handleRutChange}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.rutApoderado}
        helperText={
          errors.rutApoderado
            ? "El RUT no es válido. Debe tener puntos y guion."
            : ""
        }
        placeholder="Ejemplo: 12.345.678-9"
        sx={darkTextFieldStyles}
      />
    );
  }
  if (gridField === "telefonoApoderado") {
    return (
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          label="Código País"
          name="codigoPaisApoderado"
          value={values.codigoPaisApoderado || "+56"}
          onChange={onChange}
          margin="normal"
          variant="outlined"
          sx={{ ...darkTextFieldStyles, width: 100 }}
          inputProps={{ maxLength: 4 }}
        />
        <TextField
          label="Teléfono Apoderado"
          name="telefonoApoderado"
          value={values.telefonoApoderado}
          onChange={onChange}
          fullWidth
          required
          margin="normal"
          variant="outlined"
          inputProps={{ maxLength: 9 }}
          error={!!errors.telefonoApoderado}
          helperText={errors.telefonoApoderado}
          placeholder="Ejemplo: 912345678"
          sx={darkTextFieldStyles}
        />
      </Box>
    );
  }
  if (gridField === "direccion") {
    return (
      <TextField
        label="Dirección"
        name="direccion"
        value={values.direccion}
        onChange={onChange}
        fullWidth
        required
        margin="normal"
        variant="outlined"
        placeholder="Ejemplo: Av. Siempre Viva 123"
        sx={darkTextFieldStyles}
      />
    );
  }
  if (gridField === "emailApoderado") {
    return (
      <TextField
        label="Email Apoderado"
        name="emailApoderado"
        value={values.emailApoderado}
        onChange={onChange}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.emailApoderado}
        helperText={errors.emailApoderado}
        placeholder="Ejemplo: apoderado@email.com"
        sx={darkTextFieldStyles}
      />
    );
  }
  if (
    gridField === "rutAlumno" ||
    gridField === "edadAlumno" ||
    gridField === "telefonoAlumno" ||
    gridField === "email" ||
    gridField === "fechaIngreso"
  ) {
    // Para mantener la simetría, si la columna de apoderado no tiene campo equivalente, retorna un div vacío
    return <div />;
  }
  return null;
}

export default ApoderadoDatos;
