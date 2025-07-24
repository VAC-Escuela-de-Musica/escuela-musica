import { formatearHora, esHoraValida } from "./utils";
// Subcomponente: datos de clase
import React from "react";
import { TextField, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { tipoCursoOpciones, modalidadOpciones, diasSemana } from "./constants";

function ClaseDatos({ values, errors, onChange, onSelectChange }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          label="Curso"
          name="curso"
          value={values.curso}
          onChange={onChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.curso}
          helperText={errors.curso}
          sx={{ flex: 1 }}
        />
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }} error={!!errors.tipoCurso}>
          <InputLabel id="tipoCurso-label">Tipo de Curso</InputLabel>
          <Select
            labelId="tipoCurso-label"
            name="tipoCurso"
            value={values.tipoCurso}
            onChange={onSelectChange}
            required
            label="Tipo de Curso"
            error={!!errors.tipoCurso}
          >
            {tipoCursoOpciones.map((op) => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>
          {errors.tipoCurso && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px'}}>{errors.tipoCurso}</div>}
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }} error={!!errors.modalidadClase}>
          <InputLabel id="modalidadClase-label">Modalidad de Clase</InputLabel>
          <Select
            labelId="modalidadClase-label"
            name="modalidadClase"
            value={values.modalidadClase}
            onChange={onSelectChange}
            required
            label="Modalidad de Clase"
            error={!!errors.modalidadClase}
          >
            {modalidadOpciones.map((op) => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>
          {errors.modalidadClase && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px'}}>{errors.modalidadClase}</div>}
        </FormControl>
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }} error={!!errors.dia}>
          <InputLabel id="dia-label">Día</InputLabel>
          <Select
            labelId="dia-label"
            name="dia"
            value={values.dia}
            onChange={onSelectChange}
            required
            label="Día"
            error={!!errors.dia}
          >
            {diasSemana.map((dia) => (
              <MenuItem key={dia} value={dia}>{dia}</MenuItem>
            ))}
          </Select>
          {errors.dia && <div style={{color: '#d32f2f', fontSize: '0.75rem', marginTop: '3px', marginLeft: '14px'}}>{errors.dia}</div>}
        </FormControl>
        <TextField
          label="Hora (HH:MM)"
          name="hora"
          value={values.hora}
          onChange={e => {
            const formatted = formatearHora(e.target.value);
            // Llama al handler original con el valor formateado
            onChange({
              target: {
                name: "hora",
                value: formatted
              }
            });
          }}
          placeholder="Ej: 16:00"
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={values.hora && !esHoraValida(values.hora)}
          helperText={values.hora && !esHoraValida(values.hora) ? "Hora no válida (HH:MM)" : ""}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>
  );
}

export default ClaseDatos;
