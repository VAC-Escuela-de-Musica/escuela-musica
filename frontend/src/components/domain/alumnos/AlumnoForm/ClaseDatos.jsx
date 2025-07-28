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

// Estilos oscuros para los TextField y Select
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

const darkSelectStyles = {
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
    "& .MuiSelect-select": {
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
  "& .MuiFormHelperText-root": {
    color: "#aaaaaa",
    "&.Mui-error": {
      color: "#f44336",
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
          sx={{ ...darkTextFieldStyles, flex: 1 }}
        />
        <FormControl
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ ...darkSelectStyles, flex: 1 }}
          error={!!errors.tipoCurso}
        >
          <InputLabel id="tipoCurso-label">Tipo de Curso</InputLabel>
          <Select
            labelId="tipoCurso-label"
            name="tipoCurso"
            value={values.tipoCurso}
            onChange={onSelectChange}
            required
            label="Tipo de Curso"
            error={!!errors.tipoCurso}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                },
              },
            }}
          >
            {tipoCursoOpciones.map((op) => (
              <MenuItem
                key={op}
                value={op}
                sx={{
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#444444",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#2196f3",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                }}
              >
                {op}
              </MenuItem>
            ))}
          </Select>
          {errors.tipoCurso && (
            <div
              style={{
                color: "#f44336",
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
          sx={{ ...darkSelectStyles, flex: 1 }}
          error={!!errors.modalidadClase}
        >
          <InputLabel id="modalidadClase-label">Modalidad de Clase</InputLabel>
          <Select
            labelId="modalidadClase-label"
            name="modalidadClase"
            value={values.modalidadClase}
            onChange={onSelectChange}
            required
            label="Modalidad de Clase"
            error={!!errors.modalidadClase}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                },
              },
            }}
          >
            {modalidadOpciones.map((op) => (
              <MenuItem
                key={op}
                value={op}
                sx={{
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#444444",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#2196f3",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                }}
              >
                {op}
              </MenuItem>
            ))}
          </Select>
          {errors.modalidadClase && (
            <div
              style={{
                color: "#f44336",
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
          sx={{ ...darkSelectStyles, flex: 1 }}
          error={!!errors.dia}
        >
          <InputLabel id="dia-label">Día</InputLabel>
          <Select
            labelId="dia-label"
            name="dia"
            value={values.dia}
            onChange={onSelectChange}
            required
            label="Día"
            error={!!errors.dia}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                },
              },
            }}
          >
            {diasSemana.map((dia) => (
              <MenuItem
                key={dia}
                value={dia}
                sx={{
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#444444",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#2196f3",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                  },
                }}
              >
                {dia}
              </MenuItem>
            ))}
          </Select>
          {errors.dia && (
            <div
              style={{
                color: "#f44336",
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
          sx={{ ...darkTextFieldStyles, flex: 1 }}
        />
      </Box>
    </Box>
  );
}

export default ClaseDatos;
