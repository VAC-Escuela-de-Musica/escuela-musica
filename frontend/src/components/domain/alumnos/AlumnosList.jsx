import { useEffect, useState } from "react";
import {
  getAlumnos,
  updateAlumno,
  createAlumno,
  deleteAlumno,
} from "../../../services/alumnos.service";
import AlumnoForm from "./AlumnoForm/AlumnoForm";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  Tabs,
  Tab,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import { jsPDF } from "jspdf";
import { useAuth } from "../../../context/AuthContext.jsx";
import UnauthorizedAccess from "../../common/UnauthorizedAccess.jsx";

function AlumnosList() {
  const { isAdmin } = useAuth();

  // Verificar permisos de acceso (solo admin puede gestionar estudiantes)
  if (!isAdmin()) {
    return (
      <UnauthorizedAccess
        title="Gestión de Estudiantes"
        message="Solo administradores pueden gestionar la información de estudiantes."
        suggestion="Contacta al administrador si necesitas consultar o modificar datos de estudiantes."
        icon={<PersonIcon fontSize="large" />}
        color="error"
      />
    );
  }
  const [alumnos, setAlumnos] = useState([]);
  const [editingAlumno, setEditingAlumno] = useState(() => {
    const saved = localStorage.getItem("alumnos_editingAlumno");
    return saved ? JSON.parse(saved) : null;
  });
  const [showForm, setShowForm] = useState(() => {
    const saved = localStorage.getItem("alumnos_showForm");
    return saved === "true";
  });
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Modal ficha
  const [openFicha, setOpenFicha] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // Ordenamiento
  const [sortBy, setSortBy] = useState("nombreAlumno");
  const [sortOrder, setSortOrder] = useState("asc");

  // Estado para Tabs
  const [tabIndex, setTabIndex] = useState(0);

  const fetchAlumnos = () => {
    getAlumnos().then((res) => setAlumnos(res.data.data || res.data));
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleCreate = () => {
    setEditingAlumno(null);
    setShowForm(true);
    localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
    localStorage.setItem("alumnos_showForm", "true");
  };
  const handleEdit = (alumno) => {
    setEditingAlumno(alumno);
    setShowForm(true);
    localStorage.setItem("alumnos_editingAlumno", JSON.stringify(alumno));
    localStorage.setItem("alumnos_showForm", "true");
  };
  const handleDelete = async (alumno) => {
    if (window.confirm(`¿Eliminar a ${alumno.nombreAlumno}?`)) {
      try {
        await deleteAlumno(alumno._id);
        fetchAlumnos();
      } catch (err) {
        alert("Error al eliminar alumno");
      }
    }
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlumno(null);
    localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
    localStorage.setItem("alumnos_showForm", "false");
  };
  const handleSubmitForm = async (formData) => {
    // Función para obtener el valor de una cookie por nombre
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };

    const csrfToken = getCookie("csrf-token");

    if (editingAlumno && editingAlumno._id) {
      try {
        await updateAlumno(editingAlumno._id, formData, csrfToken);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
        localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
        localStorage.setItem("alumnos_showForm", "false");
        showNotification("Alumno actualizado exitosamente", "success");
      } catch (err) {
        throw err; // lanza el error para que el formulario lo capture
      }
    } else {
      try {
        await createAlumno(formData, csrfToken);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
        localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
        localStorage.setItem("alumnos_showForm", "false");
        showNotification("Alumno creado exitosamente", "success");
      } catch (err) {
        throw err; // Lanza el error para que el formulario lo capture
      }
    }
  };

  const alumnosArray = Array.isArray(alumnos) ? alumnos : [];
  const filteredAlumnos = alumnosArray.filter((alumno) => {
    const term = search.trim().toLowerCase();
    return (
      alumno.nombreAlumno?.toLowerCase().includes(term) ||
      alumno.rutAlumno?.toLowerCase().includes(term) ||
      alumno.email?.toLowerCase().includes(term) ||
      alumno.curso?.toLowerCase().includes(term) ||
      alumno.tipoCurso?.toLowerCase().includes(term)
    );
  });

  // Ordenar alumnos según columna y orden
  const sortedAlumnos = [...filteredAlumnos].sort((a, b) => {
    let aValue = a[sortBy] || "";
    let bValue = b[sortBy] || "";
    // Si es fecha, comparar como fecha
    if (sortBy === "fechaIngreso") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    // Comparar como texto
    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Función para cambiar orden y columna
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Helper para formatear fecha DD-MM-AAAA
  const formatFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (isNaN(d)) return fecha;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#2a2a2a",
        color: "#ffffff",
        p: 3,
      }}
    >
      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          color: "#2196f3",
          fontWeight: "bold",
          fontSize: { xs: "1.8rem", md: "2.5rem" },
          mb: 4,
        }}
      >
        Lista de Alumnos
      </Typography>

      {/* Barra de búsqueda y botón agregar en la misma línea */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 4,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <TextField
          placeholder="Buscar alumno por nombre, email, RUT o curso..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            maxWidth: { xs: "100%", sm: 600 },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#333333",
              color: "#ffffff",
              borderRadius: 2,
              "& fieldset": {
                borderColor: "#555555",
              },
              "&:hover fieldset": {
                borderColor: "#2196f3",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#2196f3",
              },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#aaaaaa",
              opacity: 1,
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            bgcolor: "#2196f3",
            color: "#fff",
            fontWeight: "bold",
            textTransform: "uppercase",
            px: { xs: 2, md: 3 },
            py: { xs: 1.2, md: 1.5 },
            borderRadius: 2,
            fontSize: { xs: "0.8rem", md: "1rem" },
            minWidth: { xs: "100%", sm: "auto" },
            whiteSpace: "nowrap",
            "&:hover": {
              bgcolor: "#1976d2",
            },
          }}
        >
          Agregar Alumno
        </Button>
      </Box>
      {/* Tabla de alumnos */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#3a3a3a",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        <Table
          sx={{
            minWidth: 650,
            "& .MuiTableCell-root": {
              color: "#ffffff",
              borderBottom: "1px solid #444444",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "#4a4a4a" }}>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                }}
              >
                N°
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                }}
              >
                {/* Avatar column */}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("nombreAlumno")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountCircleIcon sx={{ fontSize: "1.1rem" }} />
                  Nombre{" "}
                  {sortBy === "nombreAlumno"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("rutAlumno")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BadgeIcon sx={{ fontSize: "1.1rem" }} />
                  RUT{" "}
                  {sortBy === "rutAlumno"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("telefonoAlumno")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: "1.1rem" }} />
                  Teléfono{" "}
                  {sortBy === "telefonoAlumno"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("curso")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SchoolIcon sx={{ fontSize: "1.1rem" }} />
                  Curso{" "}
                  {sortBy === "curso" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  display: { xs: "none", sm: "table-cell" },
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("tipoCurso")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CategoryIcon sx={{ fontSize: "1.1rem" }} />
                  Tipo de Curso{" "}
                  {sortBy === "tipoCurso"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  display: { xs: "none", sm: "table-cell" },
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("modalidadClase")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LocationOnIcon sx={{ fontSize: "1.1rem" }} />
                  Modalidad{" "}
                  {sortBy === "modalidadClase"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                  display: { xs: "none", sm: "table-cell" },
                  "&:hover": { color: "#2196f3" },
                }}
                onClick={() => handleSort("fechaIngreso")}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon sx={{ fontSize: "1.1rem" }} />
                  Fecha Ingreso{" "}
                  {sortBy === "fechaIngreso"
                    ? sortOrder === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </Box>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  color: "#ffffff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <SettingsIcon sx={{ fontSize: "1.1rem" }} />
                  Acciones
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAlumnos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  align="center"
                  sx={{
                    color: "#aaaaaa",
                    fontStyle: "italic",
                    py: 4,
                  }}
                >
                  No hay alumnos registrados.
                </TableCell>
              </TableRow>
            ) : (
              sortedAlumnos.map((alumno, idx) => (
                <TableRow
                  key={alumno._id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#4a4a4a",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: "#404040",
                    },
                  }}
                  onClick={() => {
                    setSelectedAlumno(alumno);
                    setOpenFicha(true);
                    setTabIndex(0);
                  }}
                >
                  <TableCell align="center" sx={{ color: "#ffffff" }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell align="center">
                    <Avatar
                      src={alumno.fotoUrl || ""}
                      alt={alumno.nombreAlumno}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#2196f3",
                        color: "#ffffff",
                        fontSize: "1rem",
                        fontWeight: "bold",
                      }}
                    >
                      {!alumno.fotoUrl && alumno.nombreAlumno
                        ? alumno.nombreAlumno[0].toUpperCase()
                        : null}
                    </Avatar>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.9rem",
                      color: "#ffffff",
                      fontWeight: "500",
                    }}
                  >
                    {alumno.nombreAlumno}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "0.9rem",
                      letterSpacing: "1px",
                      color: "#cccccc",
                    }}
                  >
                    {alumno.rutAlumno || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.9rem",
                      color: "#cccccc",
                    }}
                  >
                    {alumno.telefonoAlumno || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.9rem",
                      color: "#cccccc",
                    }}
                  >
                    {alumno.curso || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.9rem",
                      color: "#cccccc",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {alumno.tipoCurso || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.9rem",
                      color: "#cccccc",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {alumno.modalidadClase || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "0.9rem",
                      letterSpacing: "1px",
                      color: "#cccccc",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {formatFecha(alumno.fechaIngreso)}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlumno(alumno);
                          setOpenFicha(true);
                          setTabIndex(0);
                        }}
                        sx={{
                          p: 1,
                          color: "#2196f3",
                          "&:hover": {
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                          },
                        }}
                      >
                        <PersonIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(alumno);
                        }}
                        sx={{
                          p: 1,
                          color: "#2196f3",
                          "&:hover": {
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(alumno);
                        }}
                        sx={{
                          p: 1,
                          color: "#f44336",
                          "&:hover": {
                            backgroundColor: "rgba(244, 67, 54, 0.1)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Formulario de agregar/editar alumno */}
      {showForm && (
        <AlumnoForm
          initialData={editingAlumno}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      )}
      <Dialog
        open={openFicha}
        onClose={() => setOpenFicha(false)}
        fullWidth
        maxWidth="md"
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#2a2a2a",
            color: "#ffffff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            minHeight: 520,
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 4 },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "bold",
            fontSize: 28,
            color: "#2196f3",
            pb: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#2a2a2a",
          }}
        >
          <PersonIcon sx={{ fontSize: 32, color: "#2196f3", mr: 1 }} />
          Ficha del Alumno
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: "#2a2a2a",
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 4 },
            maxHeight: "65vh",
            minHeight: "500px",
            overflowY: "auto",
            borderRadius: 4,
            borderColor: "#444444",
            boxShadow: "0 4px 24px rgba(33,150,243,0.10)",
            "&::-webkit-scrollbar": {
              width: "8px",
              background: "#333333",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#555555",
              borderRadius: "8px",
              "&:hover": {
                background: "#666666",
              },
            },
          }}
        >
          {selectedAlumno && (
            <Box>
              {/* Avatar y nombre principal */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Avatar
                  src={selectedAlumno.fotoUrl || ""}
                  alt={selectedAlumno.nombreAlumno}
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: "#2196f3",
                    color: "#ffffff",
                    fontSize: 32,
                    boxShadow: 2,
                  }}
                >
                  {!selectedAlumno.fotoUrl && selectedAlumno.nombreAlumno
                    ? selectedAlumno.nombreAlumno[0]
                    : null}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#2196f3" }}
                  >
                    {selectedAlumno.nombreAlumno}
                  </Typography>
                  <Typography sx={{ color: "#cccccc", fontSize: 16 }}>
                    {selectedAlumno.curso || "-"} &bull;{" "}
                    {selectedAlumno.tipoCurso || "-"}
                  </Typography>
                </Box>
              </Box>

              {/* Tabs */}
              <Tabs
                value={tabIndex}
                onChange={(e, newValue) => setTabIndex(newValue)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ 
                  mb: 2,
                  "& .MuiTab-root": {
                    color: "#aaaaaa",
                    "&.Mui-selected": {
                      color: "#2196f3",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#2196f3",
                  },
                }}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Datos Personales" />
                <Tab label="Otros Datos" />
                <Tab label="Apoderado" />
              </Tabs>

              {tabIndex === 0 && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#2196f3", fontWeight: "bold", mb: 2 }}
                  >
                    Datos Personales
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>RUT:</strong> {selectedAlumno.rutAlumno || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Dirección:</strong>{" "}
                        {selectedAlumno.direccion || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Teléfono:</strong>{" "}
                        {selectedAlumno.telefonoAlumno || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Email:</strong> {selectedAlumno.email || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>RRSS:</strong> {selectedAlumno.rrss || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Fecha de ingreso:</strong>{" "}
                        {formatFecha(selectedAlumno.fechaIngreso)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Modalidad Clase:</strong>{" "}
                        {selectedAlumno.modalidadClase || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2, color: "#ffffff" }}>
                        <strong>Clase:</strong> {selectedAlumno.clase || "-"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabIndex === 1 && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#2196f3", fontWeight: "bold", mb: 2 }}
                  >
                    Otros Datos
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Conocimientos Previos:</strong>{" "}
                      {selectedAlumno.conocimientosPrevios ? "Sí" : "No"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Instrumentos:</strong>{" "}
                      {Array.isArray(selectedAlumno.instrumentos)
                        ? selectedAlumno.instrumentos.join(", ")
                        : selectedAlumno.instrumentos || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Estilos Musicales:</strong>{" "}
                      {Array.isArray(selectedAlumno.estilosMusicales)
                        ? selectedAlumno.estilosMusicales.join(", ")
                        : selectedAlumno.estilosMusicales || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Otro Estilo:</strong>{" "}
                      {selectedAlumno.otroEstilo || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Referente Musical:</strong>{" "}
                      {selectedAlumno.referenteMusical || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Condición de Aprendizaje:</strong>{" "}
                      {selectedAlumno.condicionAprendizaje ? "Sí" : "No"}
                    </Typography>
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Condición Médica:</strong>{" "}
                      {selectedAlumno.condicionMedica ? "Sí" : "No"}
                    </Typography>
                    {selectedAlumno.condicionMedica && (
                      <Typography sx={{ mb: 1, color: "#ffffff" }}>
                        <strong>Detalle:</strong>{" "}
                        {selectedAlumno.detalleCondicionMedica || "-"}
                      </Typography>
                    )}
                    <Typography sx={{ mb: 1, color: "#ffffff" }}>
                      <strong>Observaciones:</strong>{" "}
                      {selectedAlumno.observaciones || "-"}
                    </Typography>
                  </Box>
                </Box>
              )}

              {tabIndex === 2 && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#2196f3", fontWeight: "bold", mb: 2 }}
                  >
                    Datos de Apoderado
                  </Typography>
                  <Grid container spacing={0}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 1, color: "#ffffff" }}>
                          <strong>Nombre Apoderado:</strong>{" "}
                          {selectedAlumno.nombreApoderado || "-"}
                        </Typography>
                        <Typography sx={{ mb: 1, color: "#ffffff" }}>
                          <strong>RUT Apoderado:</strong>{" "}
                          {selectedAlumno.rutApoderado || "-"}
                        </Typography>
                        <Typography sx={{ mb: 1, color: "#ffffff" }}>
                          <strong>Teléfono Apoderado:</strong>{" "}
                          {selectedAlumno.telefonoApoderado || "-"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ background: "#3a3a3a", px: 6, py: 3, borderTop: "1px solid #444444" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const doc = new jsPDF("p", "mm", "a4");
              doc.setFontSize(14);

              // Helper para formatear fecha
              const formatFecha = (fecha) => {
                if (!fecha) return "-";
                const d = new Date(fecha);
                if (isNaN(d)) return fecha;
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year}`;
              };

              // Encabezado principal
              doc.setFillColor(0, 0, 0);
              doc.rect(10, 10, 190, 12, "F");
              doc.setTextColor(255, 255, 255);
              doc.text("FICHA INSCRIPCIÓN VAC ESCUELA DE MUSICA", 15, 18);

              // Fecha
              doc.setFillColor(200, 200, 200);
              doc.rect(10, 22, 190, 8, "F");
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.text(
                `Fecha: ${formatFecha(selectedAlumno?.fechaIngreso)}`,
                160,
                28
              );

              // Datos personales y apoderado (dos columnas)
              doc.setDrawColor(0, 0, 0);
              doc.rect(10, 30, 190, 42);
              doc.setFontSize(11);
              doc.text(
                `Nombre estudiante: ${selectedAlumno?.nombreAlumno || "-"}`,
                12,
                36
              );
              doc.text(`RUT: ${selectedAlumno?.rutAlumno || "-"}`, 12, 42);
              doc.text(
                `Teléfono: ${selectedAlumno?.telefonoAlumno || "-"}`,
                12,
                48
              );
              doc.text(
                `Dirección: ${selectedAlumno?.direccion || "-"}`,
                12,
                54
              );
              doc.text(`Correo: ${selectedAlumno?.email || "-"}`, 12, 60);
              doc.text(`RRSS: ${selectedAlumno?.rrss || "-"}`, 12, 66);

              doc.text(
                `Nombre apoderado: ${selectedAlumno?.nombreApoderado || "-"}`,
                110,
                36
              );
              doc.text(
                `RUT apoderado: ${selectedAlumno?.rutApoderado || "-"}`,
                110,
                42
              );
              doc.text(
                `Teléfono apoderado: ${
                  selectedAlumno?.telefonoApoderado || "-"
                }`,
                110,
                48
              );

              // Datos musicales
              doc.rect(10, 74, 190, 28);
              doc.text(
                `Conocimientos previos de música: ${
                  selectedAlumno?.conocimientosPrevios ? "SI" : "NO"
                }`,
                12,
                80
              );
              doc.text(
                `Instrumentos: ${
                  Array.isArray(selectedAlumno?.instrumentos)
                    ? selectedAlumno.instrumentos.join(", ")
                    : selectedAlumno?.instrumentos || "-"
                }`,
                12,
                86
              );
              doc.text(
                `Estilos musicales: ${
                  Array.isArray(selectedAlumno?.estilosMusicales)
                    ? selectedAlumno.estilosMusicales.join(", ")
                    : selectedAlumno?.estilosMusicales || "-"
                }`,
                12,
                92
              );
              doc.text(
                `Referente musical: ${selectedAlumno?.referenteMusical || "-"}`,
                12,
                98
              );

              // Condiciones y observaciones (dos columnas)
              doc.rect(10, 104, 190, 20);
              doc.text(
                `Condición especial de aprendizaje: ${
                  selectedAlumno?.condicionAprendizaje ? "SI" : "NO"
                } ${selectedAlumno?.detalleCondicionAprendizaje || ""}`,
                12,
                110
              );
              doc.text(
                `Condición médica: ${
                  selectedAlumno?.condicionMedica ? "SI" : "NO"
                } ${selectedAlumno?.detalleCondicionMedica || ""}`,
                110,
                110
              );
              doc.text(
                `Observaciones: ${selectedAlumno?.observaciones || "-"}`,
                12,
                120
              );

              // Datos de clase
              doc.rect(10, 126, 190, 20);
              doc.text(
                `Fecha de ingreso: ${formatFecha(
                  selectedAlumno?.fechaIngreso
                )}`,
                12,
                132
              );
              doc.text(`Curso: ${selectedAlumno?.curso || "-"}`, 80, 132);
              doc.text(
                `Tipo de curso: ${selectedAlumno?.tipoCurso || "-"}`,
                130,
                132
              );
              doc.text(
                `Modalidad de clase: ${selectedAlumno?.modalidadClase || "-"}`,
                12,
                138
              );
              doc.text(`Clase: ${selectedAlumno?.clase || "-"}`, 130, 138);

              doc.save(`ficha_${selectedAlumno?.nombreAlumno || "alumno"}.pdf`);
            }}
            sx={{
              fontWeight: "bold",
              px: 3,
              py: 1,
              fontSize: 16,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            DESCARGAR PDF
          </Button>
          <Button
            onClick={() => setOpenFicha(false)}
            variant="outlined"
            sx={{
              fontWeight: "bold",
              px: 3,
              py: 1,
              fontSize: 16,
              borderRadius: 2,
              borderColor: "#2196f3",
              color: "#2196f3",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                borderColor: "#1976d2",
              },
            }}
          >
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación de éxito */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{
            width: "100%",
            fontWeight: "500",
            "& .MuiAlert-icon": {
              color: "#ffffff",
            },
          }}
        >
          {successMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default AlumnosList;
