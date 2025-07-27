import { useState, useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Grid } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";

const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const currentYear = new Date().getFullYear();
const minDate = new Date(currentYear, 0, 1); 
const maxDate = new Date(currentYear + 1, 11, 31); 

export default function HorarioSemana() {
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

  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [sala, setSala] = useState("0"); 
  const [clasesSemana, setClasesSemana] = useState([]);
  const [autorizado, setAutorizado] = useState(true);
  const [nombresProfesores, setNombresProfesores] = useState({});
  const [profesor, setProfesor] = useState("0");
  const [listaProfesores, setListaProfesores] = useState([]);

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
    const fetchClasesSemana = async () => {
      try {
        const params = {
          fecha: fecha.toLocaleDateString("es-CL"),
          sala,
        };

        if (horaInicio) {
          params.horaInicio = horaInicio.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }

        if (horaFin) {
          params.horaFin = horaFin.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
        if (profesor && profesor !== "0") {
          params.profesor = profesor;
        }
        const queryString = new URLSearchParams(params).toString();
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/horario/semana?${queryString}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 403) {
          setAutorizado(false);
          return;
        }
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        setClasesSemana(data.data);
        data.data.forEach(clase => {
          if (clase.profesor && !nombresProfesores[clase.profesor]) {
            obtenerNombreProfesor(clase.profesor);
          }
        });
      } catch (error) {
        console.error("Error al obtener clases semanales:", error);
      }
    };

    fetchClasesSemana();
  }, [fecha, sala, horaInicio, horaFin, profesor]);

  useEffect(() => {
    const cargarProfesores = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/profesores`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Error al obtener profesores");
        const data = await response.json();
        setListaProfesores(data.data);
      } catch (error) {
        console.error("Error al cargar profesores:", error);
      }
    };
    cargarProfesores();
  }, []);

  const mesAno = fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const noHayClases = !clasesSemana || clasesSemana.length === 0;
  
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
            InputProps: { style: { backgroundColor: "#333", color: "white" } },
            InputLabelProps: { style: { color: "white" } },
            sx: { 
              width: "200px !important",
              "& .MuiSvgIcon-root": { color: "white" } }
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
            InputProps: { style: { backgroundColor: "#333", color: "white" } },
            InputLabelProps: { style: { color: "white" } },
            sx: { 
              width: "160px !important",
              "& .MuiSvgIcon-root": { color: "white" } }
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
        IconComponent: (props) => <ArrowDropDownIcon {...props} sx={{ color: "white" }} />,
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
            {mesAno}
          </Typography>

      <Grid container columns={5} spacing={2}>
        {diasSemana.map((dia) => {
          const index = diasSemana.indexOf(dia);
          const lunes = new Date(fecha);
          const offset = (lunes.getDay() === 0 ? -6 : 1 - lunes.getDay());
          lunes.setDate(lunes.getDate() + offset + index);
          const numeroDia = lunes.getDate().toString().padStart(2, "0");
          return (
            <Grid key={dia} sx={{ display: "flex", justifyContent: "center" }}>
              <Box
                sx={{
                  backgroundColor: "#444",
                  color: "white",
                  padding: 1,
                  borderRadius: 2,
                  minHeight: "150px",
                  textAlign: "center",
                  width: "210px"
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "#bbb" }}>{numeroDia}</Typography>
                <Typography variant="h6">{dia}</Typography>
                {Array.isArray(clasesSemana) &&
                  clasesSemana
                    .filter((clase) =>
                      clase.horarios?.some((h) => {
                        const [diaFecha, mesFecha, anioFecha] = h.dia.split("-");
                        const fechaClase = `${diaFecha}-${mesFecha}-${anioFecha}`;

                        const diaIndex = diasSemana.indexOf(dia);
                        const base = new Date(fecha);
                        const offset = (base.getDay() === 0 ? -6 : 1 - base.getDay());
                        base.setDate(base.getDate() + offset + diaIndex);
                        const diaColumna = base.toLocaleDateString("es-CL").split("/").map(n => n.padStart(2, '0')).join("-");

                        return fechaClase === diaColumna;
                      })
                    )
                    .sort((a, b) => {
                      const horaA = a.horarios[0].horaInicio;
                      const horaB = b.horarios[0].horaInicio;
                      return horaA.localeCompare(horaB);
                    })
                    .map((clase) => (
                      <Box
                        key={clase._id}
                        sx={{
                          backgroundColor: "#555",
                          borderRadius: 1,
                          padding: 1,
                          marginTop: 1,
                          textAlign: "left",
                        }}
                      >
                        <Typography variant="h7" sx={{ fontWeight: "bold" }}>{clase.titulo}</Typography><br />
                        <Typography variant="caption">{nombresProfesores[clase.profesor] || "Cargando nombre del profesor..."}</Typography><br />
                        { !nombresProfesores[clase.profesor] && obtenerNombreProfesor(clase.profesor) }
                        <Typography variant="caption">{clase.sala}</Typography><br />
                        <Typography variant="caption">
                          {clase.horarios[0].horaInicio} - {clase.horarios[0].horaFin}
                        </Typography>
                      </Box>
                    ))}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {noHayClases && (
          <Typography variant="h6" sx={{ textAlign: "center", mt: 4, color: "#ccc" }}>
            No hay clases para el filtro seleccionado.
          </Typography>
        )}
    </Box>
  );
}