import { Box, TextField, Button, Typography, MenuItem, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";

const fetchAutenticado = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
};

const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

export default function HorarioDia() {
  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [sala, setSala] = useState("0"); 
  const [clasesFiltradas, setClasesFiltradas] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fechaCompleta = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const [autorizado, setAutorizado] = useState(true);
  const [nombresProfesores, setNombresProfesores] = useState({});
  const [listaProfesores, setListaProfesores] = useState([]);
  const [profesor, setProfesor] = useState("0");

  const obtenerNombreProfesor = async (id) => {
    if (nombresProfesores[id]) return nombresProfesores[id];
    try {
      const response = await fetchAutenticado(`${API_URL}/profesor/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombresProfesores(prev => ({ ...prev, [id]: data.data.nombreCompleto }));
        return data.data.nombreCompleto;
      }
    } catch (error) {
      console.error("Error al obtener nombre del profesor:", error);
    }
    return id;
  };

  useEffect(() => {
    const fetchClases = async () => {
      if (!fecha) return;

      if (fecha.getDay() === 0 || fecha.getDay() === 6) {
        setClasesFiltradas([]);
        return;
      }

      if (horaInicio && horaFin && horaInicio > horaFin) {
        setErrorMessage("La hora de inicio no puede ser mayor que la hora de fin.");
        setShowError(true);
        return;
      }

      const pad = (n) => n.toString().padStart(2, "0");

      const formattedFecha = `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()}`;
      const queryParams = new URLSearchParams();
      queryParams.append("fecha", formattedFecha);

      if (horaInicio) {
        queryParams.append("horaInicio", `${pad(horaInicio.getHours())}:${pad(horaInicio.getMinutes())}`);
      }
      if (horaFin) {
        queryParams.append("horaFin", `${pad(horaFin.getHours())}:${pad(horaFin.getMinutes())}`);
      }
      if (sala && sala !== "0") {
        queryParams.append("sala", sala);
      }
      if (profesor && profesor !== "0") {
        queryParams.append("profesor", profesor);
      }

      try {
        const response = await fetchAutenticado(`${API_URL}/horario/dia?${queryParams.toString()}`);
        if (response.status === 403) {
          setAutorizado(false);
          return;
        }
        const data = await response.json();
        setClasesFiltradas(
          (data.data || []).sort((a, b) => {
            const h1 = a.horarios[0]?.horaInicio || "";
            const h2 = b.horarios[0]?.horaInicio || "";
            return h1.localeCompare(h2);
          })
        );
      } catch (error) {
        console.error("Error al obtener clases filtradas:", error);
      }
    };

    fetchClases();
  }, [fecha, horaInicio, horaFin, sala, profesor]);

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
        setErrorMessage("No se pudieron cargar los profesores.");
        setShowError(true);
      }
    };

  const cargarNombresFaltantes = async () => {
    if (!clasesFiltradas.length) return;

    const idsFaltantes = clasesFiltradas
      .map(clase => clase.profesor)
      .filter(id => id && !nombresProfesores[id]);

    for (const id of idsFaltantes) {
      await obtenerNombreProfesor(id);
    }
  };

  cargarNombresFaltantes();
    cargarProfesores();
}, [clasesFiltradas]);

  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear, 0, 1); 
  const maxDate = new Date(currentYear + 1, 11, 31); 

  if (!autorizado) {
    return (
      <Box sx={{ backgroundColor: "#222222", minHeight: "100vh", color: "white" }}>
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
    <>
      <Box sx={{ padding: 2, backgroundColor: "#333", color: "white" }}>
        
        <Box display="flex" alignItems="center" justifyContent="start" gap={2}>
          <Typography variant="h6" marginRight={3}>
            Filtros:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <div className="horario-datepicker">
              <DatePicker
                label="Selecciona una fecha"
                format="dd/MM/yyyy"
                value={fecha}
                onChange={setFecha}
                minDate={minDate}
                maxDate={maxDate}
                slotProps={{
                  textField: {
                    variant: "filled",
                    InputProps: { style: { backgroundColor: "#333", color: "white"} },
                    InputLabelProps: { style: { color: "white" } },
                    sx: {
                      width: "200px !important",
                      "& .MuiSvgIcon-root": { color: "white" },
                    }
                  }
                }}
              />
            </div>
            

            <TimePicker
              label="Hora de inicio"
              ampm={false}
              value={horaInicio}
              onChange={setHoraInicio}
              slotProps={{
                textField: {
                  variant: "filled",
                  InputProps: { style: { backgroundColor: "#333", color: "white"} },
                  InputLabelProps: { style: { color: "white" } },
                  sx: {
                    width: "160px !important",
                    "& .MuiSvgIcon-root": { color: "white" },
                  }
                }
              }}
            />

            <TimePicker
              label="Hora de fin"
              ampm={false}
              value={horaFin}
              onChange={setHoraFin}
              slotProps={{
                textField: {
                  variant: "filled",
                  InputProps: { style: { backgroundColor: "#333", color: "white"} },
                  InputLabelProps: { style: { color: "white" } },
                  sx: {
                    width: "160px !important",
                    "& .MuiSvgIcon-root": { color: "white" },
                  }
                }
              }}
            />
          </LocalizationProvider>
          <TextField
              label="Sala"
              select
              value={sala}
              onChange={e => setSala(e.target.value)}
              sx={{
                minWidth: 130,
                width: '170px',
                color: "white",
                "& .MuiSelect-icon": { color: "white" },
                "& .MuiFilledInput-root": {
                  height: "52px",
                  display: "flex",
                  alignItems: "center"
                }
              }}
              variant="filled"
              margin="dense"
              InputProps={{
                style: { backgroundColor: "#333", color: "white" }
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
              <MenuItem value="0">Todas las salas</MenuItem>
              <MenuItem value="Sala 1">Sala 1</MenuItem>
              <MenuItem value="Sala 2">Sala 2</MenuItem>
              <MenuItem value="Sala 3">Sala 3</MenuItem>
            </TextField>
            <TextField
                      label="Profesor"
                      select
                      fullWidth
                      variant="filled"
                      margin="dense"
                      value={profesor}
                      onChange={(e) => setProfesor(e.target.value)}
                      sx={{
                        minWidth: 130,
                        width: "220px",
                        color: "white",
                        "& .MuiSelect-icon": { color: "white" },
                        "& .MuiFilledInput-root": {
                          height: "52px",
                          display: "flex",
                          alignItems: "center"
                        }
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
                      <MenuItem value="0" sx={{ color: "white" }}>Todos los profesores</MenuItem>
                      {listaProfesores.map((prof) => (
                        <MenuItem key={prof._id} value={prof._id}>
                          {prof.nombreCompleto}
                        </MenuItem>
                      ))}
                    </TextField>
        
      </Box>
      
      <Typography variant="h6" align="center" sx={{ mt: 3, mb: 3 }}>
        {fechaCompleta}
      </Typography>

      <Box>
        {clasesFiltradas.length === 0 ? (
          <Typography
          variant="h6" sx={{ textAlign: "center", mt: 4, color: "#ccc" }}
          >No hay clases para el filtro seleccionado.</Typography>
        ) : (
          clasesFiltradas.map((clase, index) => (
            <Box 
              display={"flex"} justifyContent={"space-between"} alignItems={"center"} 
              key={clase._id || index} sx={{ p: 2, mb: 2, border: "1px solid #555", borderRadius: 2, backgroundColor: "#444" }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>{clase.titulo}</Typography>
                <Typography variant="body2">{nombresProfesores[clase.profesor] || "Cargando nombre del profesor..."}</Typography>
                <Typography variant="body2">{clase.sala}</Typography>
                <Typography variant="body2">
                  {clase.horarios[0].horaInicio} – {clase.horarios[0].horaFin}
                </Typography>
              </Box>
              <Box>
              </Box>
              
            </Box>
          ))
        )}
      </Box>
      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" sx={{ width: '100%' }} onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>
      </Box>
      
    </>
  )
}