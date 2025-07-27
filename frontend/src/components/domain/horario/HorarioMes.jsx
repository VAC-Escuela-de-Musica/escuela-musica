import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Snackbar, Alert } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import { parse } from "date-fns";

const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

export default function HorarioMes() {
    const [fecha, setFecha] = useState(new Date());
    const [clasesMes, setClasesMes] = useState([]);
    const [horaInicio, setHoraInicio] = useState(null);
    const [horaFin, setHoraFin] = useState(null);
    const [sala, setSala] = useState("0"); 
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [autorizado, setAutorizado] = useState(true);
    const [nombresProfesores, setNombresProfesores] = useState({});
    const [profesor, setProfesor] = useState("0");
    const [listaProfesores, setListaProfesores] = useState([]);

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

    const obtenerNombreProfesor = async (id) => {
    if (nombresProfesores[id]) return nombresProfesores[id];
    try {
      const response = await fetchAutenticado(`${API_URL}/profesor/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombresProfesores(prev => ({ ...prev, [id]: data.data.username }));
        return data.data.username;
      }
    } catch (error) {
      console.error("Error al obtener nombre del profesor:", error);
    }
    return id;
  };

    useEffect(() => {
        if (horaInicio && horaFin && horaInicio > horaFin) {
            setErrorMessage("La hora de inicio no puede ser mayor que la hora de fin.");
            setShowError(true);
            return;
        }
        const fetchClasesMes = async () => {
            const pad = (n) => n.toString().padStart(2, "0");
            let horaInicioStr = "";
            let horaFinStr = "";
            if (horaInicio) horaInicioStr = `${pad(horaInicio.getHours())}:${pad(horaInicio.getMinutes())}`;
            if (horaFin) horaFinStr = `${pad(horaFin.getHours())}:${pad(horaFin.getMinutes())}`;

            try {
                const queryParams = new URLSearchParams({
                  mes: (fecha.getMonth() + 1).toString(),
                  year: fecha.getFullYear().toString()
                });

                if (horaInicioStr) queryParams.append("horaInicio", horaInicioStr);
                if (horaFinStr) queryParams.append("horaFin", horaFinStr);
                if (sala && sala !== "0") queryParams.append("sala", sala);
                if (profesor && profesor !== "0") {
                  queryParams.append("profesor", profesor);
                }

                const token = localStorage.getItem("token");
                const response = await fetch(`${API_URL}/horario/mes?${queryParams.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.status === 403) {
                    setAutorizado(false);
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    setClasesMes(data.data || []);
                    if (data.data) {
                      const idsFaltantes = data.data
                        .map(clase => clase.profesor)
                        .filter(id => id && !nombresProfesores[id]);
                      for (const id of idsFaltantes) {
                        await obtenerNombreProfesor(id);
                      }
                    }
                } else {
                    setClasesMes([]);
                }
            } catch {
                setClasesMes([]);
            }
        };
        fetchClasesMes();
    }, [fecha, horaInicio, horaFin, sala, profesor]);

    useEffect(() => {
      const cargarProfesores = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_URL}/profesores`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Error al obtener profesores");
          }
          const data = await response.json();
          setListaProfesores(data.data);
        } catch (error) {
          console.error("Error al cargar profesores:", error);
        }
      };
      cargarProfesores();
    }, []);

    const mesAno = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    const noHayClases = clasesMes.length === 0;

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
        <Box sx={{ padding: 2, backgroundColor: "#333", color: "white" }}>
            
            <Box display="flex" alignItems="center" justifyContent="start" gap={2}>
              <Typography variant="h6" marginRight={3}>
                Filtros:
              </Typography>

              <FormControl>
                <InputLabel sx={{ color: "white" }}>Mes</InputLabel>
                <Select
                  value={fecha.getMonth()}
                  label="Mes"
                  onChange={(e) => {
                    const nuevaFecha = new Date(fecha);
                    nuevaFecha.setMonth(e.target.value);
                    setFecha(new Date(nuevaFecha));
                  }}
                  sx={{
                    color: "white",
                    width: 140,
                    "& .MuiSelect-icon": {
                      color: "white"
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#333",
                        color: "white"
                      }
                    }
                  }}
                >
                  {[
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                  ].map((mes, idx) => (
                    <MenuItem key={mes} value={idx}>
                      {mes}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel sx={{ color: "white" }}>Año</InputLabel>
                <Select
                  value={fecha.getFullYear()}
                  label="Año"
                  onChange={(e) => {
                    const nuevaFecha = new Date(fecha);
                    nuevaFecha.setFullYear(e.target.value);
                    setFecha(new Date(nuevaFecha));
                  }}
                  sx={{
                    color: "white",
                    width: 90,
                    "& .MuiSelect-icon": {
                      color: "white"
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#333",
                        color: "white"
                      }
                    }
                  }}
                >
                  {[new Date().getFullYear(), new Date().getFullYear() + 1].map((año) => (
                    <MenuItem key={año} value={año}>
                      {año}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <TimePicker
                  label="Hora de inicio"
                  ampm={false}
                  value={horaInicio}
                  onChange={setHoraInicio}
                  slotProps={{
                    textField: {
                      variant: "filled",
                      InputProps: { style: { backgroundColor: "#333", color: "white" } },
                      InputLabelProps: { style: { color: "white" } },
                      sx: { 
                        width: "160px !important",
                        "& .MuiSvgIcon-root": { color: "white" } },
                      style: { width: "160px" }
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
                      InputProps: { style: { backgroundColor: "#333", color: "white" } },
                      InputLabelProps: { style: { color: "white" } },
                      sx: { 
                        width: "160px !important",
                        "& .MuiSvgIcon-root": { color: "white" } },
                      style: { width: "160px" }
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
                InputProps={{ style: { backgroundColor: "#333", color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
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
                    {prof.username}
                  </MenuItem>
                ))}
              </TextField>
            </Box>


            <Typography variant="h6" align="center" sx={{ mt: 3, mb: 3 }}>
                {mesAno}
            </Typography>

            {noHayClases && (
              <Typography variant="h6" align="center" sx={{ mt: 4, color: "#ccc" }}>
                No hay clases para el filtro seleccionado.
              </Typography>
            )}

            <Box>
              {Object.entries(
                clasesMes
                  .flatMap(clase => clase.horarios.map(h => ({ ...clase, horario: h })))
                  .reduce((acc, clase) => {
                    const fechaClase = parse(clase.horario.dia, "dd-MM-yyyy", new Date());
                    const diaSemana = fechaClase.getDay();
                    if (diaSemana === 0 || diaSemana === 6) return acc;
                    if (!acc[clase.horario.dia]) acc[clase.horario.dia] = [];
                    acc[clase.horario.dia].push(clase);
                    return acc;
                  }, {})
              )
                .sort(([diaA], [diaB]) => {
                  const [dA, mA, yA] = diaA.split("-").map(Number);
                  const [dB, mB, yB] = diaB.split("-").map(Number);
                  return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
                })
                .map(([dia, clases], idx) => {
                  const fecha = parse(dia, "dd-MM-yyyy", new Date());
                  if (fecha.getDay() === 0 || fecha.getDay() === 6) return null;

                  return (
                    <Box key={idx} sx={{ mb: 2, backgroundColor: "#444", padding: 2, borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                      </Typography>
                      {clases.map((clase, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>{clase.titulo}</Typography>
                          <Typography variant="body2">
                            {nombresProfesores[clase.profesor] || "Cargando nombre del profesor..."}
                          </Typography>
                          <Typography variant="body2">{clase.sala}</Typography>
                          <Typography variant="body2">{clase.horario.horaInicio} - {clase.horario.horaFin}</Typography>
                        </Box>
                      ))}
                    </Box>
                  );
                })}
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
    );
}