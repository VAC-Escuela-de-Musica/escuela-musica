import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ArrowCircleLeftOutlined } from "@mui/icons-material";


const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

const fetchAutenticado = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const csrfRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/csrf-token`, {
    credentials: "include"
  });
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;

  const headers = {
    "Authorization": `Bearer ${token}`,
    "x-csrf-token": csrfToken,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include"
  });

  return response;
};

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
  const [repetirClase, setRepetirClase] = useState("");
  const [repeticiones, setRepeticiones] = useState([]);
  const [mismaHora, setMismaHora] = useState(false);
  const [mismaSala, setMismaSala] = useState(false);

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

    // Si hay repeticiones y mismaHora está activado, actualiza las horas de todas las repeticiones
    let repeticionesFinal = repeticiones;
    if (repeticiones.length > 0 && mismaHora) {
      repeticionesFinal = repeticiones.map(r => ({
        ...r,
        horaInicio: horaInicio,
        horaFin: horaFin,
      }));
    }

    const clasesParaEnviar = [
      {
        titulo,
        descripcion,
        sala,
        profesor,
        horarios: [{
          dia: selectedDate
            ? `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`
            : null,
          horaInicio: horaInicio
            ? `${horaInicio.getHours().toString().padStart(2, "0")}:${horaInicio.getMinutes().toString().padStart(2, "0")}`
            : null,
          horaFin: horaFin
            ? `${horaFin.getHours().toString().padStart(2, "0")}:${horaFin.getMinutes().toString().padStart(2, "0")}`
            : null,
        }]
      },
      ...repeticionesFinal.map(r => ({
        titulo,
        descripcion,
        sala,
        profesor,
        horarios: [{
          dia: r.fecha
            ? `${r.fecha.getDate().toString().padStart(2, '0')}-${(r.fecha.getMonth() + 1).toString().padStart(2, '0')}-${r.fecha.getFullYear()}`
            : null,
          horaInicio: r.horaInicio
            ? `${r.horaInicio.getHours().toString().padStart(2, "0")}:${r.horaInicio.getMinutes().toString().padStart(2, "0")}`
            : null,
          horaFin: r.horaFin
            ? `${r.horaFin.getHours().toString().padStart(2, "0")}:${r.horaFin.getMinutes().toString().padStart(2, "0")}`
            : null,
        }]
      }))
    ];

    try {
      console.log("Clases a enviar:", JSON.stringify(clasesParaEnviar, null, 2));
      console.log("Enviando al backend:", clasesParaEnviar);
      const response = await fetchAutenticado(`${API_URL}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(clasesParaEnviar)
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
      setRepeticiones([]);
      setRepetirClase("");
    } catch (error) {
      console.error("Error al guardar la clase:", error);
    }
  };

  useEffect(() => {
    const cantidad = parseInt(repetirClase);
    if (cantidad > 0) {
      const nuevasRepeticiones = Array.from({ length: cantidad }, (_, i) => {
        if (!selectedDate) {
          return {
            fecha: null,
            horaInicio: mismaHora ? horaInicio : null,
            horaFin: mismaHora ? horaFin : null,
            sala: mismaSala ? sala : repeticiones[i]?.sala || "",
          };
        }
        const nuevaFecha = new Date(selectedDate.getTime());
        nuevaFecha.setDate(nuevaFecha.getDate() + 7 * (i + 1));
        return {
          fecha: nuevaFecha,
          horaInicio: mismaHora ? horaInicio : null,
          horaFin: mismaHora ? horaFin : null,
          sala: mismaSala ? sala : repeticiones[i]?.sala || "",
        };
      });
      setRepeticiones(nuevasRepeticiones);
    }
  }, [selectedDate, repetirClase, mismaHora, mismaSala, sala]);

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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Crear Nueva Clase</Typography>
        <Button variant="contained" onClick={handleGuardarClase} sx={{ backgroundColor: "#4CAF50", mr: 3 }}>
          Guardar Clase
        </Button>
      </Box>
      

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
              {prof.nombreCompleto}
            </MenuItem>
          ))}
        </TextField>
        

        <TextField
          label="¿Repetir clase semanalmente?"
          select
          required
          fullWidth
          variant="filled"
          margin="dense"
          value={repetirClase}
          onChange={(e) => {
            const valor = e.target.value;
            setRepetirClase(valor);
            setMismaHora(parseInt(valor) > 0); // Activa el switch por defecto si se repite al menos una vez
          }}
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
          <MenuItem disabled value="" sx={{ color: "white" }}>Elegir opción</MenuItem>
          <MenuItem value="0">No repetir</MenuItem>
          <MenuItem value="1">Repetir una vez</MenuItem>
          <MenuItem value="2">Repetir dos veces</MenuItem>
          <MenuItem value="3">Repetir tres veces</MenuItem>
          <MenuItem value="4">Repetir cuatro veces</MenuItem>
        </TextField>
        
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Box marginTop={1} display="flex" gap={1} alignItems="center">
            <DatePicker
              label="¿Qué día empezará la clase?"
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
          </Box>
          {/* Switch para misma hora en repeticiones */}
          {parseInt(repetirClase) > 0 && (
            <FormControlLabel
              control={
                <Switch
                  checked={mismaHora}
                  onChange={(e) => setMismaHora(e.target.checked)}
                  color="primary"
                />
              }
              label="¿Utilizar el mismo horario para todas las semanas?"
              sx={{ mt: 2 }}
            />
          )}
          {/* Switch para misma sala en repeticiones */}
          {parseInt(repetirClase) > 0 && (
            <FormControlLabel
              control={
                <Switch
                  checked={mismaSala}
                  onChange={(e) => setMismaSala(e.target.checked)}
                  color="primary"
                />
              }
              label="¿Utilizar la misma sala para todas las semanas?"
              sx={{ mt: 1 }}
            />
          )}
          {parseInt(repetirClase) > 0 && repeticiones.map((r, i) => (
            <Box key={i} display="flex" gap={1} mt={2} alignItems="center">
              <DatePicker
                label={`Fecha ${i + 1}`}
                value={r.fecha}
                onChange={(date) => {
                  const nuevas = [...repeticiones];
                  nuevas[i].fecha = date;
                  setRepeticiones(nuevas);
                }}
                minDate={minDate}
                maxDate={maxDate}
                disabled={mismaHora}
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
              <>
                <TimePicker
                  label="Inicio"
                  value={mismaHora ? horaInicio : r.horaInicio}
                  onChange={(time) => {
                    if (mismaHora) {
                      setHoraInicio(time);
                      const nuevas = repeticiones.map(rep => ({ ...rep, horaInicio: time }));
                      setRepeticiones(nuevas);
                    } else {
                      const nuevas = [...repeticiones];
                      nuevas[i].horaInicio = time;
                      setRepeticiones(nuevas);
                    }
                  }}
                  ampm={false}
                  disabled={mismaHora}
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
                  label="Fin"
                  value={mismaHora ? horaFin : r.horaFin}
                  onChange={(time) => {
                    if (mismaHora) {
                      setHoraFin(time);
                      const nuevas = repeticiones.map(rep => ({ ...rep, horaFin: time }));
                      setRepeticiones(nuevas);
                    } else {
                      const nuevas = [...repeticiones];
                      nuevas[i].horaFin = time;
                      setRepeticiones(nuevas);
                    }
                  }}
                  ampm={false}
                  disabled={mismaHora}
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
              </>
              <TextField
                label="Sala"
                select
                required
                fullWidth
                variant="filled"
                margin="dense"
                value={mismaSala ? sala : r.sala}
                disabled={mismaSala}
                onChange={(e) => {
                  if (!mismaSala) {
                    const nuevas = [...repeticiones];
                    nuevas[i].sala = e.target.value;
                    setRepeticiones(nuevas);
                  }
                }}
                InputProps={{
  style: { backgroundColor: "#333", color: "white" },
  sx: {
    color: "white",
    "&.Mui-disabled": {
      color: "white"
    },
    "& .MuiSelect-icon": {
      color: "white"
    }
  }
}}
InputLabelProps={{
  style: { color: "white" },
  sx: {
    "&.Mui-disabled": {
      color: "white"
    }
  }
}}
                SelectProps={{
                  native: false,
                  sx: {
                    color: "white",
                    "& .MuiSelect-icon": {
                      color: "white"
                    }
                  },
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
            </Box>
          ))}
        </LocalizationProvider>

        
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
  