import React, { useState, useEffect } from "react";
import { 
    Box,
    Typography,
    Button,
    Snackbar,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem
  } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { es } from "date-fns/locale";
import AsignarEstudiantes from "./AsignarEstudiantes.jsx";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

export default function Clases({ setActiveModule }) {
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [clases, setClases] = useState([]);
  const [editarClase, setEditarClase] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [profesor, setProfesor] = useState("");
  const [sala, setSala] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFin, setHoraFin] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  const [claseAEliminar, setClaseAEliminar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("hoy");
  const [autorizado, setAutorizado] = useState(true);
  const [listaProfesores, setListaProfesores] = useState([]);
  const [nombresProfesores, setNombresProfesores] = useState({});
  const [openAsignarEstudiantes, setOpenAsignarEstudiantes] = useState(false);
  const [claseSeleccionadaParaAsignar, setClaseSeleccionadaParaAsignar] = useState(null);

  const obtenerNombreProfesor = async (id) => {
    if (nombresProfesores[id]) return nombresProfesores[id];
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/profesor/${id}`);
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

  const fetchAutenticado = async (url, options = {}) => {
    const token = localStorage.getItem("token");

    const csrfRes = await fetch(`${API_URL}/csrf-token`, {
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

  const fetchTodayClases = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/today`);
      if (response.status === 403) {
        setAutorizado(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Error al obtener las clases de hoy");
      }
      const data = await response.json();
      setClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setMensajeError("Error al obtener las clases de hoy");
    }
  };

  const fetchNextClases = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/next`);
      if (response.status === 403) {
        setAutorizado(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Error al obtener las próximas clases");
      }
      const data = await response.json();
      console.log("Clases próximas recibidas:", data.data);
      setClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setMensajeError("Error al obtener las próximas clases");
    }
  };

  const fetchAllClases = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/programadas`);
      if (response.status === 403) {
        setAutorizado(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Error al obtener todas las clases");
      }
      const data = await response.json();
      setClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setMensajeError("Error al obtener todas las clases");
    }
  };

  const fetchPreviousClases = async () => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/previous`);
      if (response.status === 403) {
        setAutorizado(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Error al obtener las clases anteriores");
      }
      const data = await response.json();
      setClases(data.data);
      data.data.forEach(clase => obtenerNombreProfesor(clase.profesor));
    } catch (error) {
      console.error(error);
      setMensajeError("Error al obtener las clases anteriores");
    }
  };

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        const response = await fetchAutenticado(`${API_URL}/clases/profesores`);
        if (response.ok) {
          const data = await response.json();
          setListaProfesores(data.data);
        }
      } catch (error) {
        console.error("Error al cargar los profesores:", error);
      }
    };
    fetchTodayClases();
    fetchProfesores();
  }, []);

  const handleGuardarClase = async () => {
    if (!titulo || !descripcion || !profesor || !sala || !selectedDate || !horaInicio || !horaFin) {
      setMensajeError("Complete todos los campos.");
      return;
    }
    if (horaInicio >= horaFin) {
      setMensajeError("La hora de inicio debe ser menor que la hora de término.");
      return;
    }

    const pad = n => n.toString().padStart(2, "0");
    const dia = `${pad(selectedDate.getDate())}-${pad(selectedDate.getMonth()+1)}-${selectedDate.getFullYear()}`;
    const formatHora = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const nuevaClase = {
      titulo,
      descripcion,
      sala,
      profesor,
      horarios: [
        {
          dia,
          horaInicio: formatHora(horaInicio),
          horaFin: formatHora(horaFin)
        }
      ]
    };

    try {
      let response;
      if (editarClase) {
        console.log("Enviando datos al backend para actualizar:", nuevaClase);
        console.log("ID de la clase:", editarClase._id);

        response = await fetchAutenticado(`${API_URL}/clases/update/${editarClase._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaClase)
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const parsedError = JSON.parse(errorText);
          setMensajeError(parsedError.message || "Error al actualizar la clase");
        } catch {
          setMensajeError("Error al actualizar la clase");
        }
        return;
      }

      setMensajeExito("Clase actualizada con éxito");
      setTitulo("");
      setDescripcion("");
      setSala("");
      setProfesor("");
      setSelectedDate(null);
      setHoraInicio(null);
      setHoraFin(null);
      setEditarClase(null);
      setOpenDialog(false);
      if (filtroActivo === "hoy") {
        fetchTodayClases();
      } else if (filtroActivo === "proximas") {
        fetchNextClases();
      } else if (filtroActivo === "todas") {
        fetchAllClases();
      } else {
        fetchPreviousClases();
      }
    } catch (error) {
      console.error(error);
      setMensajeError("Error al actualizar la clase");
    }
  };

  const handleCancelarClase = async (id, motivo = "") => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/cancel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          estado: "cancelada",
          motivo: motivo.trim() || undefined
        }),
      });
      if (!response.ok) {
        throw new Error("Error al cancelar la clase");
      }
      setMensajeExito("Clase cancelada con éxito. Se han enviado notificaciones a los estudiantes.");
      setMotivoCancelacion(""); // Limpiar el campo de motivo
      if (filtroActivo === "hoy") {
        fetchTodayClases();
      } else if (filtroActivo === "proximas") {
        fetchNextClases();
      } else if (filtroActivo === "todas") {
        fetchAllClases();
      } else {
        fetchPreviousClases();
      }
    } catch (error) {
      console.error(error);
      setMensajeError("Error al cancelar la clase");
    }
  };

  const handleEditar = (clase) => {
    setTitulo(clase.titulo);
    setDescripcion(clase.descripcion);
    setProfesor(clase.profesor);
    setSala(clase.sala);
    const [day, month, year] = clase.horarios[0].dia.split("-");
    setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    const horaToDate = (horaStr) => {
      const [hh, mm] = horaStr.split(":").map(Number);
      return new Date(2000, 0, 1, hh, mm);
    };
    setHoraInicio(horaToDate(clase.horarios[0].horaInicio));
    setHoraFin(horaToDate(clase.horarios[0].horaFin));
    setEditarClase(clase);
    setOpenDialog(true);
  };

  const handleEliminarClase = async (id) => {
    try {
      const response = await fetchAutenticado(`${API_URL}/clases/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const parsedError = JSON.parse(errorText);
          setMensajeError(parsedError.message || "Error al eliminar la clase");
        } catch {
          setMensajeError("Error al eliminar la clase");
        }
        return;
      }
      
      setMensajeExito("Clase eliminada permanentemente");
      setOpenDeleteDialog(false);
      setClaseAEliminar(null);
      
      // Refrescar la lista según el filtro activo
      if (filtroActivo === "hoy") {
        fetchTodayClases();
      } else if (filtroActivo === "proximas") {
        fetchNextClases();
      } else if (filtroActivo === "todas") {
        fetchAllClases();
      } else {
        fetchPreviousClases();
      }
    } catch (error) {
      console.error(error);
      setMensajeError("Error al eliminar la clase");
    }
  };

  const currentYear = new Date().getFullYear();
  const minDate = new Date(currentYear, 0, 1); 
  const maxDate = new Date(currentYear + 1, 11, 31); 

  if (!autorizado) {
    return (
      <Box sx={{ color: "white", marginLeft: 3, marginRight: 3 }}>
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
    <Box sx={{ color: "white", marginLeft: 3, marginRight: 3 }}>
      <Box display={"flex"} justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Gestión de las clases
        </Typography>

        <Box display="flex" gap={1} marginRight={3}>
          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("anteriores");
              fetchPreviousClases();
            }}
            sx={{ color:"#ffffff", borderColor: "#ffffff", height: "fit-content", width: '125px' }}
            disabled={filtroActivo === "anteriores"}
          >
            Anteriores
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("hoy");
              fetchTodayClases();
            }}
            disabled={filtroActivo === "hoy"}
            sx={{ color:"#ffffff", borderColor: "#ffffff", height: "fit-content", width: '125px' }}
          >
            Hoy
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("proximas");
              fetchNextClases();
            }}
            disabled={filtroActivo === "proximas"}
            sx={{ color:"#ffffff", borderColor: "#ffffff", height: "fit-content", width: '125px' }}
          >
            Próximas
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setFiltroActivo("todas");
              fetchAllClases();
            }}
            disabled={filtroActivo === "todas"}
            sx={{ color:"#ffffff", borderColor: "#ffffff", height: "fit-content", width: '125px' }}
          >
            Todas
          </Button>
        </Box>
      </Box>
      

      <Box display={"flex"} justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          {filtroActivo === "hoy" && "Clases de hoy"}
          {filtroActivo === "proximas" && "Próximas clases"}
          {filtroActivo === "todas" && "Todas las clases"}
          {filtroActivo === "anteriores" && "Clases anteriores"}
        </Typography>
        
      </Box>

      <Box>
        {clases.length === 0 ? (
          <Typography>
            {filtroActivo === "hoy" && "No hay clases programadas para hoy."}
            {filtroActivo === "proximas" && "No hay próximas clases programadas."}
            {filtroActivo === "todas" && "No hay clases disponibles."}
            {filtroActivo === "anteriores" && "No hay clases anteriores registradas."}
          </Typography>
        ) : (
          clases.map((clase, index) => (
            <Box display="flex" justifyContent="space-between" alignItems="center"
              key={index} sx={{ p: 2, mb: 2, border: "1px solid #ffffff", borderRadius: 2 }}>
                  <Box> 
                    <Typography><strong>Título:</strong> {clase.titulo}</Typography>
                    <Typography><strong>Descripción:</strong> {clase.descripcion}</Typography>
                    <Typography><strong>Estado:</strong> {clase.estado}</Typography>
                    <Typography><strong>Profesor:</strong> {nombresProfesores[clase.profesor]}</Typography>
                    {Array.isArray(clase.horarios) && clase.horarios.map((h, i) => (
                      <Box key={i} sx={{ pl: 1, borderLeft: '2px solid white' }}>
                        <Typography><strong>Horario</strong></Typography>
                        <Typography><strong>Fecha:</strong> {h.dia}</Typography>
                        <Typography><strong>Hora Inicio:</strong> {h.horaInicio}</Typography>
                        <Typography><strong>Hora Fin:</strong> {h.horaFin}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<GroupIcon />}
                      sx={{ color:"#2196F3", borderColor: "#2196F3", height: "fit-content" }}
                      onClick={() => {
                        setClaseSeleccionadaParaAsignar(clase);
                        setOpenAsignarEstudiantes(true);
                      }}
                    >
                      Estudiantes
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      sx={{ color:"#4CAF50", borderColor: "#4CAF50", height: "fit-content" }}
                      onClick={() => handleEditar(clase)}
                    >
                      Editar
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<CancelIcon />}
                      sx={{ backgroundColor: "#F75C03", color: "#ffffff"}}
                      disabled={clase.estado === "cancelada"}
                      onClick={() => {
                        setClaseSeleccionada(clase);
                        setOpenConfirmDialog(true);
                      }}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<DeleteIcon />}
                      sx={{ backgroundColor: "#d32f2f", color: "#ffffff"}}
                      onClick={() => {
                        setClaseAEliminar(clase);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      Eliminar
                    </Button>
                  </Box>
            </Box>
          ))
        )}
      </Box>

      <>
        {/* Formulario para editar clase */}
        {editarClase && (
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ backgroundColor: "#222", color: "white" }}>
              {editarClase ? "Editar Clase" : "Crear Nueva Clase"}
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: "#222" }}>
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                noValidate
                autoComplete="off"
                onSubmit={e => {
                  e.preventDefault();
                  handleGuardarClase();
                }}
              >
                <TextField
                  label="Título"
                  variant="filled"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  InputProps={{ style: { backgroundColor: "#333", color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                  required
                />
                <TextField
                  label="Descripción"
                  variant="filled"
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  multiline
                  rows={3}
                  InputProps={{ style: { backgroundColor: "#333", color: "white" } }}
                  InputLabelProps={{ style: { color: "white" } }}
                  required
                />
                <TextField
                  label="Profesor"
                  select
                  required
                  fullWidth
                  variant="filled"
                  margin="dense"
                  value={profesor}
                  onChange={e => setProfesor(e.target.value)}
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
                  <MenuItem disabled value="" sx={{ color: "white" }}>Escoger profesor</MenuItem>
                  {listaProfesores.map((prof) => (
                    <MenuItem key={prof._id} value={prof._id}>
                      {prof.nombreCompleto}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Sala"
                  required
                  variant="filled"
                  value={sala}
                  onChange={e => setSala(e.target.value)}
                  InputProps={{
                    style: { backgroundColor: "#333", color: "white" },
                    sx: {
                      "& .MuiSvgIcon-root": {
                        color: "white"
                      }
                    }
                  }}
                  InputLabelProps={{ style: { color: "white" } }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          backgroundColor: "#333",
                          color: "white",
                        },
                      },
                    }
                  }}
                >
                  <MenuItem value="Sala 1">Sala 1</MenuItem>
                  <MenuItem value="Sala 2">Sala 2</MenuItem>
                  <MenuItem value="Sala 3">Sala 3</MenuItem>
                </TextField>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <Box display="flex" gap={2}>
                    <DatePicker
                      label="Fecha"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      minDate={minDate}
                      maxDate={maxDate}
                      format="dd-MM-yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          required: true,
                          InputProps: { style: { backgroundColor: "#333", color: "white" } },
                          InputLabelProps: { style: { color: "white" } },
                          sx: {
                            "& .MuiSvgIcon-root": {
                              color: "white"
                            }
                          }
                        },
                      }}
                    />
                    <TimePicker
                      label="Hora Inicio"
                      value={horaInicio}
                      onChange={(newValue) => setHoraInicio(newValue)}
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          required: true,
                          InputProps: { style: { backgroundColor: "#333", color: "white" } },
                          InputLabelProps: { style: { color: "white" } },
                          sx: {
                            "& .MuiSvgIcon-root": {
                              color: "white"
                            }
                          }
                        },
                      }}
                    />
                    <TimePicker
                      label="Hora Fin"
                      value={horaFin}
                      onChange={(newValue) => setHoraFin(newValue)}
                      ampm={false}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: "filled",
                          required: true,
                          InputProps: { style: { backgroundColor: "#333", color: "white" } },
                          InputLabelProps: { style: { color: "white" } },
                          sx: {
                            "& .MuiSvgIcon-root": {
                              color: "white"
                            }
                          }
                        },
                      }}
                    />
                  </Box>
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#222" }}>
              <Button onClick={() => setOpenDialog(false)} sx={{ color: "white" }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" sx={{ backgroundColor: "#4CAF50" }} onClick={handleGuardarClase}>
                Actualizar Clase
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Dialog
          open={openConfirmDialog}
          onClose={() => {
            setOpenConfirmDialog(false);
            setMotivoCancelacion("");
          }}
          PaperProps={{
            sx: {
              backgroundColor: "#333333",
              color: "white",
              minWidth: "400px"
            }
          }}
        >
          <DialogTitle sx={{ color: "white" }}>
            🚫 Cancelar Clase
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "white", mb: 2 }}>
              ¿Está seguro de cancelar la clase "{claseSeleccionada?.titulo}"?
            </Typography>
            <Typography sx={{ color: "#cccccc", mb: 3, fontSize: "0.9rem" }}>
              Se enviarán notificaciones automáticas a todos los estudiantes inscritos.
            </Typography>
            <TextField
              fullWidth
              label="Motivo de la cancelación (opcional)"
              variant="outlined"
              multiline
              rows={3}
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#666666",
                  },
                  "&:hover fieldset": {
                    borderColor: "#888888",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2196F3",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#cccccc",
                },
                "& .MuiInputBase-input": {
                  color: "white",
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenConfirmDialog(false);
                setMotivoCancelacion("");
              }} 
              sx={{ color: "#cccccc" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                handleCancelarClase(claseSeleccionada._id, motivoCancelacion);
                setOpenConfirmDialog(false);
              }}
              color="error"
              variant="contained"
              sx={{ backgroundColor: "#F75C03" }}
            >
              Sí, cancelar clase
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => {
            setOpenDeleteDialog(false);
            setClaseAEliminar(null);
          }}
          PaperProps={{
            sx: {
              backgroundColor: "#333333",
              color: "white",
              minWidth: "400px"
            }
          }}
        >
          <DialogTitle sx={{ color: "white" }}>
            🗑️ Eliminar Clase Permanentemente
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "white", mb: 2 }}>
              ¿Está seguro de eliminar permanentemente la clase "{claseAEliminar?.titulo}"?
            </Typography>
            <Typography sx={{ color: "#ffeb3b", mb: 2, fontSize: "0.9rem", fontWeight: "bold" }}>
              ⚠️ ADVERTENCIA: Esta acción no se puede deshacer.
            </Typography>
            <Typography sx={{ color: "#cccccc", fontSize: "0.9rem" }}>
              La clase será eliminada completamente del sistema. Si solo desea cancelar temporalmente, use el botón "Cancelar" en su lugar.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenDeleteDialog(false);
                setClaseAEliminar(null);
              }} 
              sx={{ color: "#cccccc" }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleEliminarClase(claseAEliminar._id)}
              color="error"
              variant="contained"
              sx={{ backgroundColor: "#d32f2f" }}
            >
              Sí, eliminar permanentemente
            </Button>
          </DialogActions>
        </Dialog>
      </>

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

      {/* Componente para asignar estudiantes */}
      <AsignarEstudiantes
        clase={claseSeleccionadaParaAsignar}
        open={openAsignarEstudiantes}
        onClose={() => {
          setOpenAsignarEstudiantes(false);
          setClaseSeleccionadaParaAsignar(null);
        }}
        onSuccess={() => {
          // Recargar las clases para mostrar los cambios
          if (filtroActivo === "hoy") fetchTodayClases();
          else if (filtroActivo === "proximas") fetchNextClases();
          else if (filtroActivo === "todas") fetchAllClases();
          else if (filtroActivo === "anteriores") fetchPreviousClases();
        }}
      />
    </Box>
  );
}
