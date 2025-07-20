import { useEffect, useState } from "react";
import { Box, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Snackbar, Alert } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import { parse } from "date-fns";

const API_URL = `${import.meta.env.VITE_API_URL}/clases`;

export default function HorarioMes() {
    const [fecha, setFecha] = useState(new Date());
    const [clasesMes, setClasesMes] = useState([]);
    const [ horaInicio, setHoraInicio ] = useState(null);
    const [ horaFin, setHoraFin ] = useState(null);
    const [ sala, setSala ] = useState("0"); 
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Validación: la hora de inicio no puede ser mayor a la de fin
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

                const response = await fetch(`${API_URL}/horario/mes?${queryParams.toString()}`);

                if (response.ok) {
                    const data = await response.json();
                    setClasesMes(data.data || []);
                } else {
                    setClasesMes([]);
                }
            } catch {
                setClasesMes([]);
            }
        };
        fetchClasesMes();
    }, [fecha, horaInicio, horaFin, sala]);

    const mesAno = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

    const noHayClases = clasesMes.length === 0;

    return (
        <Box sx={{ padding: 2, backgroundColor: "#333", color: "white" }}>
            
            <Box display={"flex"} justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" gutterBottom>
                    Filtros:
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                    <FormControl sx={{ minWidth: 120 }}>
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

                    <FormControl sx={{ minWidth: 120 }}>
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
                            InputProps: { style: { backgroundColor: "#333", color: "white"} },
                            InputLabelProps: { style: { color: "white" } },
                            sx: {
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
                                    height: "52px",
                                    width: '170px',
                                    color: "white",
                                    "& .MuiSelect-icon": {
                                      color: "white"
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

                    
                </Box>
            </Box>


            <Typography variant="h6" align="center" sx={{ textTransform: "capitalize", mb: 2 }}>
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
                    if (diaSemana === 0 || diaSemana === 6) return acc; // Excluir domingo (0) y sábado (6)
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
                          <Typography variant="body2">{clase.descripcion}</Typography>
                          <Typography variant="body2">Sala: {clase.sala}</Typography>
                          <Typography variant="body2">Horario: {clase.horario.horaInicio} - {clase.horario.horaFin}</Typography>
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