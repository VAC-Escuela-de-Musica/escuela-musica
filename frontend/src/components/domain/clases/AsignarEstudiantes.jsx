import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Grid,
  Avatar,
  Tooltip,
  CircularProgress
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  Group as GroupIcon
} from "@mui/icons-material";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export default function AsignarEstudiantes({ clase, open, onClose, onSuccess }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesAsignados, setEstudiantesAsignados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAsignacion, setLoadingAsignacion] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "success" });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [dialogAsignar, setDialogAsignar] = useState(false);
  const [dialogEditar, setDialogEditar] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("activo");
  const [notas, setNotas] = useState("");

  // Fetch autenticado
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
      "Content-Type": "application/json",
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });

    return response;
  };

  // Cargar estudiantes disponibles
  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const response = await fetchAutenticado(`${API_URL}/alumnos`);
      if (response.ok) {
        const data = await response.json();
        setEstudiantes(data.data || []);
      } else {
        throw new Error("Error al cargar estudiantes");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al cargar estudiantes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cargar estudiantes asignados a la clase
  const cargarEstudiantesAsignados = async () => {
    if (!clase?._id) return;
    
    try {
      setLoading(true);
      const response = await fetchAutenticado(`${API_URL}/clases/${clase._id}/estudiantes`);
      if (response.ok) {
        const data = await response.json();
        setEstudiantesAsignados(data.data || []);
      } else if (response.status === 204) {
        setEstudiantesAsignados([]);
      } else {
        throw new Error("Error al cargar estudiantes asignados");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al cargar estudiantes asignados", "error");
    } finally {
      setLoading(false);
    }
  };

  // Asignar estudiante a la clase
  const asignarEstudiante = async () => {
    if (!estudianteSeleccionado) return;

    try {
      setLoadingAsignacion(true);
      const response = await fetchAutenticado(`${API_URL}/clases/${clase._id}/estudiantes`, {
        method: "POST",
        body: JSON.stringify({
          alumnoId: estudianteSeleccionado._id,
          estado: estadoSeleccionado,
          notas: notas
        })
      });

      if (response.ok) {
        mostrarMensaje("Estudiante asignado exitosamente", "success");
        setDialogAsignar(false);
        setEstudianteSeleccionado(null);
        setEstadoSeleccionado("activo");
        setNotas("");
        await cargarEstudiantesAsignados();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al asignar estudiante");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje(error.message, "error");
    } finally {
      setLoadingAsignacion(false);
    }
  };

  // Desasignar estudiante de la clase
  const desasignarEstudiante = async (alumnoId) => {
    try {
      setLoadingAsignacion(true);
      const response = await fetchAutenticado(`${API_URL}/clases/${clase._id}/estudiantes/${alumnoId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        mostrarMensaje("Estudiante desasignado exitosamente", "success");
        await cargarEstudiantesAsignados();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al desasignar estudiante");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje(error.message, "error");
    } finally {
      setLoadingAsignacion(false);
    }
  };

  // Actualizar estado del estudiante
  const actualizarEstadoEstudiante = async () => {
    if (!estudianteSeleccionado) return;

    try {
      setLoadingAsignacion(true);
      const response = await fetchAutenticado(`${API_URL}/clases/${clase._id}/estudiantes/${estudianteSeleccionado.alumno._id}`, {
        method: "PUT",
        body: JSON.stringify({
          estado: estadoSeleccionado,
          notas: notas
        })
      });

      if (response.ok) {
        mostrarMensaje("Estado actualizado exitosamente", "success");
        setDialogEditar(false);
        setEstudianteSeleccionado(null);
        setEstadoSeleccionado("activo");
        setNotas("");
        await cargarEstudiantesAsignados();
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar estado");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje(error.message, "error");
    } finally {
      setLoadingAsignacion(false);
    }
  };

  // Mostrar mensaje
  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setOpenSnackbar(true);
  };

  // Obtener estudiantes no asignados
  const estudiantesNoAsignados = estudiantes.filter(estudiante => 
    !estudiantesAsignados.some(asignado => 
      asignado.alumno._id === estudiante._id
    )
  );

  // Obtener color del estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "activo": return "success";
      case "inactivo": return "warning";
      case "suspendido": return "error";
      default: return "default";
    }
  };

  // Obtener texto del estado
  const getEstadoText = (estado) => {
    switch (estado) {
      case "activo": return "Activo";
      case "inactivo": return "Inactivo";
      case "suspendido": return "Suspendido";
      default: return estado;
    }
  };

  // Efectos
  useEffect(() => {
    if (open && clase) {
      cargarEstudiantes();
      cargarEstudiantesAsignados();
    }
  }, [open, clase]);

  if (!clase) return null;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon color="primary" />
            <Typography variant="h6">
              Gestionar Estudiantes - {clase.titulo}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Estudiantes Asignados */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <GroupIcon color="primary" />
                      <Typography variant="h6">
                        Estudiantes Asignados ({estudiantesAsignados.length})
                      </Typography>
                    </Box>

                    {estudiantesAsignados.length === 0 ? (
                      <Typography color="textSecondary" align="center" py={2}>
                        No hay estudiantes asignados a esta clase
                      </Typography>
                    ) : (
                      <List>
                        {estudiantesAsignados.map((asignacion, index) => (
                          <React.Fragment key={asignacion.alumno._id}>
                            <ListItem>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                    {asignacion.alumno.nombreAlumno?.charAt(0) || 'E'}
                              </Avatar>
                              <ListItemText
                                primary={asignacion.alumno.nombreAlumno || 'Sin nombre'}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      {asignacion.alumno.rutAlumno} • {asignacion.alumno.email}
                                    </Typography>
                                    <Box mt={1}>
                                      <Chip 
                                        label={getEstadoText(asignacion.estado)}
                                        color={getEstadoColor(asignacion.estado)}
                                        size="small"
                                      />
                                      {asignacion.notas && (
                                        <Typography variant="caption" display="block" mt={0.5}>
                                          Notas: {asignacion.notas}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Editar estado">
                                  <IconButton
                                    edge="end"
                                    onClick={() => {
                                      setEstudianteSeleccionado(asignacion);
                                      setEstadoSeleccionado(asignacion.estado);
                                      setNotas(asignacion.notas || "");
                                      setDialogEditar(true);
                                    }}
                                    disabled={loadingAsignacion}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Desasignar">
                                  <IconButton
                                    edge="end"
                                    onClick={() => desasignarEstudiante(asignacion.alumno._id)}
                                    disabled={loadingAsignacion}
                                    color="error"
                                  >
                                    <PersonRemoveIcon />
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < estudiantesAsignados.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Estudiantes Disponibles */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PersonAddIcon color="primary" />
                      <Typography variant="h6">
                        Estudiantes Disponibles ({estudiantesNoAsignados.length})
                      </Typography>
                    </Box>

                    {estudiantesNoAsignados.length === 0 ? (
                      <Typography color="textSecondary" align="center" py={2}>
                        Todos los estudiantes están asignados
                      </Typography>
                    ) : (
                      <List>
                        {estudiantesNoAsignados.map((estudiante, index) => (
                          <React.Fragment key={estudiante._id}>
                            <ListItem>
                              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                                {estudiante.nombreAlumno?.charAt(0) || 'E'}
                              </Avatar>
                              <ListItemText
                                primary={estudiante.nombreAlumno || 'Sin nombre'}
                                secondary={`${estudiante.rutAlumno} • ${estudiante.email}`}
                              />
                              <ListItemSecondaryAction>
                                <Tooltip title="Asignar a la clase">
                                  <IconButton
                                    edge="end"
                                    onClick={() => {
                                      setEstudianteSeleccionado(estudiante);
                                      setDialogAsignar(true);
                                    }}
                                    disabled={loadingAsignacion}
                                    color="primary"
                                  >
                                    <PersonAddIcon />
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < estudiantesNoAsignados.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para asignar estudiante */}
      <Dialog open={dialogAsignar} onClose={() => setDialogAsignar(false)}>
        <DialogTitle>Asignar Estudiante</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Typography variant="body1" mb={2}>
              Asignar: <strong>{estudianteSeleccionado?.nombreAlumno}</strong>
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                label="Estado"
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="suspendido">Suspendido</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Notas (opcional)"
              multiline
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAsignar(false)} disabled={loadingAsignacion}>
            Cancelar
          </Button>
          <Button 
            onClick={asignarEstudiante} 
            variant="contained" 
            disabled={loadingAsignacion}
            startIcon={loadingAsignacion ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para editar estado */}
      <Dialog open={dialogEditar} onClose={() => setDialogEditar(false)}>
        <DialogTitle>Editar Estado del Estudiante</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <Typography variant="body1" mb={2}>
              Estudiante: <strong>{estudianteSeleccionado?.alumno?.nombreAlumno}</strong>
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                label="Estado"
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="suspendido">Suspendido</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Notas (opcional)"
              multiline
              rows={3}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEditar(false)} disabled={loadingAsignacion}>
            Cancelar
          </Button>
          <Button 
            onClick={actualizarEstadoEstudiante} 
            variant="contained" 
            disabled={loadingAsignacion}
            startIcon={loadingAsignacion ? <CircularProgress size={20} /> : <EditIcon />}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensajes */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={mensaje.tipo}
          sx={{ width: '100%' }}
        >
          {mensaje.texto}
        </Alert>
      </Snackbar>
    </>
  );
} 