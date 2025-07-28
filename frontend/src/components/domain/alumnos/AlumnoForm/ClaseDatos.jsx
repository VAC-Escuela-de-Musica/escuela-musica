import { formatearHora, esHoraValida } from "./utils";
// Subcomponente: datos de clase
import React from "react";
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { tipoCursoOpciones, modalidadOpciones, diasSemana } from "./constants";

const darkTextFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: "#333333",
    color: "#ffffff",
    '& fieldset': {
      borderColor: "#555555",
    },
    '&:hover fieldset': {
      borderColor: "#777777",
    },
    '&.Mui-focused fieldset': {
      borderColor: "#2196f3",
    },
  },
  '& .MuiInputLabel-root': {
    color: "#aaaaaa",
    '&.Mui-focused': {
      color: "#2196f3",
    },
  },
  '& .MuiFormHelperText-root': {
    color: "#aaaaaa",
  },
};

const darkSelectStyles = {
  backgroundColor: "#333333",
  color: "#ffffff",
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: "#555555",
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: "#777777",
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: "#2196f3",
  },
  '& .MuiSvgIcon-root': {
    color: "#ffffff",
  },
};

const darkInputLabelStyles = {
  color: "#aaaaaa",
  '&.Mui-focused': {
    color: "#2196f3",
  },
};

const darkMenuItemStyles = {
  backgroundColor: "#333333",
  color: "#ffffff",
  '&:hover': {
    backgroundColor: "#444444",
  },
  '&.Mui-selected': {
    backgroundColor: "#2196f3",
  },
};

const darkMenuProps = {
  PaperProps: {
    sx: {
      backgroundColor: "#333333",
      color: "#ffffff",
      '& .MuiMenuItem-root': {
        backgroundColor: "#333333",
        color: "#ffffff",
        '&:hover': {
          backgroundColor: "#444444",
        },
        '&.Mui-selected': {
          backgroundColor: "#2196f3",
          '&:hover': {
            backgroundColor: "#1976d2",
          },
        },
      },
    },
  },
};

function ClaseDatos({ values, errors, onChange, onSelectChange }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
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
          sx={{ flex: 1, ...darkTextFieldStyles }}
        />
        <FormControl
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ flex: 1 }}
          error={!!errors.tipoCurso}
        >
          <InputLabel id="tipoCurso-label" sx={darkInputLabelStyles}>Tipo de Curso</InputLabel>
          <Select
            labelId="tipoCurso-label"
            name="tipoCurso"
            value={values.tipoCurso}
            onChange={onSelectChange}
            required
            label="Tipo de Curso"
            error={!!errors.tipoCurso}
            sx={darkSelectStyles}
          >
            {tipoCursoOpciones.map((op) => (
              <MenuItem key={op} value={op} sx={darkMenuItemStyles}>
                {op}
              </MenuItem>
            ))}
          </Select>
          {errors.tipoCurso && (
            <div
              style={{
                color: "#d32f2f",
                fontSize: "0.75rem",
                marginTop: "3px",
                marginLeft: "14px",
              }}
            >
              {errors.tipoCurso}
            </div>
          )}
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <FormControl
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ flex: 1 }}
          error={!!errors.modalidadClase}
        >
          <InputLabel id="modalidadClase-label" sx={darkInputLabelStyles}>Modalidad de Clase</InputLabel>
          <Select
            labelId="modalidadClase-label"
            name="modalidadClase"
            value={values.modalidadClase}
            onChange={onSelectChange}
            required
            label="Modalidad de Clase"
            error={!!errors.modalidadClase}
            sx={darkSelectStyles}
          >
            {modalidadOpciones.map((op) => (
              <MenuItem key={op} value={op} sx={darkMenuItemStyles}>
                {op}
              </MenuItem>
            ))}
          </Select>
          {errors.modalidadClase && (
            <div
              style={{
                color: "#d32f2f",
                fontSize: "0.75rem",
                marginTop: "3px",
                marginLeft: "14px",
              }}
            >
              {errors.modalidadClase}
            </div>
          )}
        </FormControl>
        <FormControl
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ flex: 1 }}
          error={!!errors.dia}
        >
          <InputLabel id="dia-label" sx={darkInputLabelStyles}>Día</InputLabel>
          <Select
            labelId="dia-label"
            name="dia"
            value={values.dia}
            onChange={onSelectChange}
            required
            label="Día"
            error={!!errors.dia}
            sx={darkSelectStyles}
          >
            {diasSemana.map((dia) => (
              <MenuItem key={dia} value={dia} sx={darkMenuItemStyles}>
                {dia}
              </MenuItem>
            ))}
          </Select>
          {errors.dia && (
            <div
              style={{
                color: "#d32f2f",
                fontSize: "0.75rem",
                marginTop: "3px",
                marginLeft: "14px",
              }}
            >
              {errors.dia}
            </div>
          )}
        </FormControl>
        <TextField
          label="Hora (HH:MM)"
          name="hora"
          value={values.hora}
          onChange={(e) => {
            const formatted = formatearHora(e.target.value);
            // Llama al handler original con el valor formateado
            onChange({
              target: {
                name: "hora",
                value: formatted,
              },
            });
          }}
          placeholder="Ej: 16:00"
          fullWidth
          margin="normal"
          variant="outlined"
          required
          error={!!errors.hora}
          helperText={errors.hora}
          sx={{ flex: 1, ...darkTextFieldStyles }}
        />
      </Box>
    </Box>
  );
}

export default ClaseDatos;
