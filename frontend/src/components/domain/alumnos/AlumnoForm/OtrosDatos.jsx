// Subcomponente: otros datos y observaciones
import React from "react";
import { TextField, Box, Checkbox, FormControlLabel } from "@mui/material";
import styles from "./AlumnoForm.module.css";

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
      />
      <TextField
        label="Referente Musical"
        name="referenteMusical"
        value={values.referenteMusical}
        onChange={onChange}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', sm: 'row' },
          gap: { xs: 1, sm: 2 },
          justifyContent: { xs: 'space-between', sm: 'center' },
          alignItems: 'center',
          mb: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          width: '100%',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={values.conocimientosPrevios}
              onChange={onChange}
              name="conocimientosPrevios"
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
      />
    </Box>
  );
}

export default OtrosDatos;
