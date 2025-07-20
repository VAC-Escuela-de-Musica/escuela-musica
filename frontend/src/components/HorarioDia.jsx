import { Box, TextField, Button, Typography, MenuItem, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";

const API_URL = `${import.meta.env.VITE_API_URL}/clases`;

export default function HorarioDia() {
  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [sala, setSala] = useState("0"); 
  const [clasesFiltradas, setClasesFiltradas] = useState([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fechaCompleta = fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });


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

      try {
        const response = await fetch(`${API_URL}/horario/dia?${queryParams.toString()}`);
        const data = await response.json();
        console.log("Datos recibidos:", data);
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
  }, [fecha, horaInicio, horaFin, sala]);

  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear, 0, 1); 
  const maxDate = new Date(currentYear + 1, 11, 31); 

  return (
    <>
      <Box sx={{ padding: 2, backgroundColor: "#333", color: "white" }}>
      <Box display={"flex"} justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom>
          Filtros:
        </Typography>

        <Box display="flex" gap={2} alignItems="flex-end">
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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
                    "& .MuiSvgIcon-root": { color: "white" },
                  }
                }
              }}
            />

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
      
      <Typography variant="h6" align="center" sx={{ mb: 3, textTransform: "capitalize" }}>
        {fechaCompleta}
      </Typography>

      <Box mt={3}>
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
                <Typography variant="h6">{clase.titulo}</Typography>
                <Typography variant="body2">{clase.sala}</Typography>
                <Typography variant="body2">
                  Hora: {clase.horarios[0].horaInicio} – {clase.horarios[0].horaFin}
                </Typography>
              </Box>
              <Box>
                {/* <Button
                  variant="outlined"
                  sx={{ color: "#ffffff", borderColor: "#ffffff", height: "fit-content" }}

                >
                  Detalles
                </Button> */}
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