import { format, parseISO, isValid } from 'date-fns';
import { formatearRut } from "./utils/rutUtils";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Subcomponente: datos del alumno
import React from "react";
import { TextField, Box, InputAdornment } from "@mui/material";

function AlumnoDatos({ values, errors, onChange, gridField }) {
  if (gridField === "nombreAlumno") {
    return (
      <TextField
        label="Nombre Alumno"
        name="nombreAlumno"
        value={values.nombreAlumno}
        onChange={onChange}
        required
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.nombreAlumno}
        helperText={errors.nombreAlumno}
        sx={{ mb: 0 }}
      />
    );
  }
  if (gridField === "rutAlumno") {
    const handleRutChange = (e) => {
      const val = e.target.value;
      const formatted = formatearRut(val);
      onChange({
        target: {
          name: "rutAlumno",
          value: formatted
        }
      });
    };
    return (
      <TextField
        label="RUT Alumno"
        name="rutAlumno"
        value={values.rutAlumno}
        onChange={handleRutChange}
        required
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.rutAlumno}
        helperText={errors.rutAlumno ? 'El RUT no es válido. Debe tener puntos y guion.' : ''}
        placeholder="Ejemplo: 12.345.678-9"
        sx={{ mb: 0 }}
      />
    );
  }
  if (gridField === "edadAlumno") {
    return (
      <TextField
        label="Edad Alumno"
        name="edadAlumno"
        value={values.edadAlumno}
        onChange={onChange}
        type="number"
        required
        fullWidth
        margin="normal"
        variant="outlined"
        inputProps={{ min: 1, max: 99 }}
        error={!!errors.edadAlumno}
        helperText={errors.edadAlumno}
        placeholder="Edad entre 1 y 99 años"
        sx={{ mb: 0 }}
      />
    );
  }
  if (gridField === "telefonoAlumno") {
    return (
      <Box className="telefonoBox" sx={{ display: 'flex', gap: 1, mb: 0 }}>
        <TextField
          label="Código País"
          name="codigoPaisAlumno"
          value={values.codigoPaisAlumno || "+56"}
          onChange={onChange}
          margin="normal"
          variant="outlined"
          sx={{ width: 100, mb: 0, minWidth: 0 }}
          inputProps={{ maxLength: 4 }}
          fullWidth={false}
        />
        <TextField
          label="Teléfono Alumno"
          name="telefonoAlumno"
          value={values.telefonoAlumno}
          onChange={onChange}
          fullWidth
          margin="normal"
          variant="outlined"
          inputProps={{ maxLength: 9 }}
          error={!!errors.telefonoAlumno}
          helperText={errors.telefonoAlumno}
          placeholder="Ejemplo: 912345678"
          sx={{ mb: 0, minWidth: 0 }}
        />
      </Box>
    );
  }
  if (gridField === "email") {
    return (
      <TextField
        label="Email Alumno"
        name="email"
        value={values.email}
        onChange={onChange}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.email}
        helperText={errors.email}
        placeholder="Ejemplo: alumno@email.com"
        sx={{ mb: 0 }}
      />
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
        margin="normal"
        variant="outlined"
        error={!!errors.direccion}
        helperText={errors.direccion}
        placeholder="Ejemplo: Calle 123, Ciudad"
        sx={{ mb: 0, mt: 2 }}
      />
    );
  }
  if (gridField === "fechaIngreso") {
    // Convertir string a Date solo si es string y válido
    let dateValue = null;
    if (values.fechaIngreso) {
      if (typeof values.fechaIngreso === 'string') {
        const parsed = parseISO(values.fechaIngreso);
        dateValue = isValid(parsed) ? parsed : null;
      } else if (values.fechaIngreso instanceof Date && isValid(values.fechaIngreso)) {
        dateValue = values.fechaIngreso;
      }
    }
    return (
      <div style={{ width: '100%', marginTop: 16 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            enableAccessibleFieldDOMStructure={false}
            label="Fecha de Ingreso"
            value={dateValue}
            onChange={newValue => {
              let stringValue = '';
              if (newValue && isValid(newValue)) {
                stringValue = format(newValue, 'yyyy-MM-dd');
              }
              onChange({
                target: {
                  name: 'fechaIngreso',
                  value: stringValue
                }
              });
            }}
            slots={{ textField: TextField }}
            slotProps={{
              textField: {
                name: "fechaIngreso",
                fullWidth: true,
                margin: "normal",
                variant: "outlined",
                error: !!errors.fechaIngreso,
                helperText: errors.fechaIngreso
              }
            }}
          />
        </LocalizationProvider>
      </div>
    );
  }
  // fallback vertical
  return null;
}

export default AlumnoDatos;
