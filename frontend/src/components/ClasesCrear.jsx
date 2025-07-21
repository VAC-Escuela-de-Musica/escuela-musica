import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ArrowCircleLeftOutlined } from "@mui/icons-material";

const API_URL = `${import.meta.env.VITE_API_URL}/clases`;

export default function ClasesCrear({ setActiveModule }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sala, setSala] = useState("");
  const [profesor, setProfesor] = useState("");
  const [listaProfesores, setListaProfesores] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [autorizado, setAutorizado] = useState(true);

  const currentYear = new Date().getFullYear();
  const maxDate = new Date(currentYear +1, 11, 31);
  const minDate = new Date(currentYear, 0, 1);

  useEffect(() => {
    const cargarProfesores = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/profesores`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Error al obtener profesores");
        }
        const data = await response.json();
        setListaProfesores(data.data);
      } catch (error) {
        console.error("Error al cargar profesores:", error);
        setMensajeError("No se pudieron cargar los profesores.");
      }
    };

    cargarProfesores();
  }, []);

  const handleGuardarClase = async () => {
    if (!titulo || !descripcion || !sala || !selectedDate || !horaInicio || !horaFin) {
      setMensajeError("Complete todos los campos.");
      return;
    }
    if (horaInicio >= horaFin) {
      setMensajeError("La hora de inicio debe ser menor que la hora de término.");
      return;
    }

    const nuevaClase = {
      titulo,
      descripcion,
      sala,
      profesor: profesor,
      horarios: [
        {
          dia: selectedDate
            ? `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`
            : null,
          horaInicio: horaInicio
            ? `${horaInicio.getHours().toString().padStart(2, "0")}:${horaInicio.getMinutes().toString().padStart(2, "0")}`
            : null,
          horaFin: horaFin
            ? `${horaFin.getHours().toString().padStart(2, "0")}:${horaFin.getMinutes().toString().padStart(2, "0")}`
            : null,
        }
      ]
    };

    try {
      console.log("Enviando al backend:", nuevaClase);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaClase),
      });

      if (response.status === 403) {
        setAutorizado(false);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Detalles del error:", errorText);
        const parsedError = JSON.parse(errorText);
        setMensajeError(parsedError.message || "Error al guardar la clase.");
        return;
      }

      setMensajeExito("Clase creada con éxito");
      setTitulo("");
      setDescripcion("");
      setSala("");
      setProfesor("");
      setSelectedDate(null);
      setHoraInicio(null);
      setHoraFin(null);
    } catch (error) {
      console.error("Error al guardar la clase:", error);
    }
  };

  if (!autorizado) {
    return (
      <Box sx={{ backgroundColor: "#222222", minHeight: "100vh", color: "white", p: 4 }}>
        <Typography variant="h5" gutterBottom>
          No tienes permisos para acceder a esta sección.
        </Typography>
        <Typography>
          Puedes navegar a otro módulo desde el menú lateral.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{backgroundColor: "#222222", minHeight: "100vh", color: "white" }}>
      <Button 
        variant="outlined" 
        sx={{ borderColor: "#ffffff", color: "#ffffff", mb: 2 }}
        startIcon={<ArrowCircleLeftOutlined />}
        onClick={() => setActiveModule("clases")}
      >
        Volver a Clases
      </Button>
      <Typography variant="h4" mb={3}>Crear Nueva Clase</Typography>

      <Box sx={{ backgroundColor: "#222222", p: 3, borderRadius: 2 }}>
        <TextField
          label="Título"
          required
          fullWidth
          variant="filled"
          margin="dense"
          InputProps={{ style: { backgroundColor: "#333", color: "white" } }}
          InputLabelProps={{ style: { color: "white" } }}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <TextField
          label="Descripción"
          required
          fullWidth
          variant="filled"
          margin="dense"
          InputProps={{ style: { backgroundColor: "#333", color: "white" } }}
          InputLabelProps={{ style: { color: "white" } }}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <TextField
          label="Profesor"
          select
          required
          fullWidth
          variant="filled"
          margin="dense"
          value={profesor}
          onChange={(e) => setProfesor(e.target.value)}
          InputProps={{ 
            style: { backgroundColor: "#333", color: "white" },
            sx: {
              "& .MuiSvgIcon-root": {
                color: "white"
              }
            }
         }}
          InputLabelProps={{ style: { color: "white" }}}
          SelectProps={{
            native: false,
            MenuProps: {
              PaperProps: {
                style: {
                  backgroundColor: "#333",
                  color: "white",
                }
              }
            }
          }}
        >
          <MenuItem disabled value="" sx={{ color: "white" }}>Elegir profesor</MenuItem>
          {listaProfesores.map((prof) => (
            <MenuItem key={prof._id} value={prof._id}>
              {prof.username}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Sala"
          select
          required
          fullWidth
          variant="filled"
          margin="dense"
          value={sala}
          onChange={(e) => setSala(e.target.value)}
          InputProps={{
            style: { backgroundColor: "#333", color: "white" },
            sx: {
              "& .MuiSvgIcon-root": {
                color: "white"
              }
            }
          }}
          InputLabelProps={{ style: { color: "white" }}}
          SelectProps={{
            native: false,
            MenuProps: {
              PaperProps: {
                style: {
                  backgroundColor: "#333",
                  color: "white",
                }
              }
            }
          }}
        >
          <MenuItem disabled value="" sx={{ color: "white" }}>Elegir sala</MenuItem>
          <MenuItem value="Sala 1">Sala 1</MenuItem>
          <MenuItem value="Sala 2">Sala 2</MenuItem>
          <MenuItem value="Sala 3">Sala 3</MenuItem>
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box marginTop={1} display="flex" gap={1} >
            <DatePicker
              label="Fecha"
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "filled",
                  required: true,
                      InputProps: {
                        style: { backgroundColor: "#333", color: "white" }
                      },
                      InputLabelProps: { style: { color: "white" } },
                  sx: {
                    input: { color: "white" },
                    label: { color: "white" },
                    "& .MuiFilledInput-root": {
                      backgroundColor: "#333",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "white"
                    }
                  }
                }
              }}
            />

            <TimePicker
                label="Hora Inicio"
                value={horaInicio}
                onChange={setHoraInicio}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "filled",
                    required: true,
                    InputProps: {
                      style: { backgroundColor: "#333", color: "white" }
                    },
                    InputLabelProps: { style: { color: "white" } },
                    sx: {
                      input: { color: "white" },
                      label: { color: "gray" },
                      "& .MuiFilledInput-root": {
                        backgroundColor: "#333"
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white"
                      }
                    }
                  }
                }}
              />

              <TimePicker
                label="Hora Fin"
                value={horaFin}
                onChange={setHoraFin}
                ampm={false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "filled",
                    required: true,
                    InputProps: {
                      style: { backgroundColor: "#333", color: "white" }
                    },
                    InputLabelProps: { style: { color: "white" } },
                    sx: {
                      input: { color: "white" },
                      label: { color: "gray" },
                      "& .MuiFilledInput-root": {
                        backgroundColor: "#333"
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white"
                      }
                    }
                  }
                }}
              />
          </Box>
        </LocalizationProvider>

        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleGuardarClase} sx={{ backgroundColor: "#4CAF50" }}>
            Guardar Clase
          </Button>
        </Box>
      </Box>

      <Snackbar 
        open={!!mensajeExito} 
        autoHideDuration={3000} 
        onClose={() => setMensajeExito("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setMensajeExito("")} severity="success" sx={{ width: '100%' }}>
          {mensajeExito}
        </Alert>
      </Snackbar>

      <Snackbar
              open={!!mensajeError}
              autoHideDuration={3000}
              onClose={() => setMensajeError("")}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert severity="error" onClose={() => setMensajeError("")} sx={{ width: "100%" }}>
                {mensajeError}
              </Alert>
            </Snackbar>
    </Box>
  );
}
