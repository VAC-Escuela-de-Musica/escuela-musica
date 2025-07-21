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
          sx={{ flex: 1 }}
        />
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
          <InputLabel id="tipoCurso-label">Tipo de Curso</InputLabel>
          <Select
            labelId="tipoCurso-label"
            name="tipoCurso"
            value={values.tipoCurso}
            onChange={onSelectChange}
            required
            label="Tipo de Curso"
          >
            {tipoCursoOpciones.map((op) => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
          <InputLabel id="modalidadClase-label">Modalidad de Clase</InputLabel>
          <Select
            labelId="modalidadClase-label"
            name="modalidadClase"
            value={values.modalidadClase}
            onChange={onSelectChange}
            required
            label="Modalidad de Clase"
          >
            {modalidadOpciones.map((op) => (
              <MenuItem key={op} value={op}>{op}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal" variant="outlined" sx={{ flex: 1 }}>
          <InputLabel id="dia-label">Día</InputLabel>
          <Select
            labelId="dia-label"
            name="dia"
            value={values.dia}
            onChange={onSelectChange}
            required
            label="Día"
          >
            {diasSemana.map((dia) => (
              <MenuItem key={dia} value={dia}>{dia}</MenuItem>
            ))}
          </Select>
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
