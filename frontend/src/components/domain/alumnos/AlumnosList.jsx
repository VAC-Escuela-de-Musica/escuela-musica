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
import jsPDF from "jspdf";

function AlumnosList() {
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
    if (editingAlumno && editingAlumno._id) {
      try {
        await updateAlumno(editingAlumno._id, formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
        localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
        localStorage.setItem("alumnos_showForm", "false");
        setSuccessMsg("Alumno actualizado exitosamente");
        setShowSuccess(true);
      } catch (err) {
        alert("Error al actualizar alumno");
      }
    } else {
      try {
        await createAlumno(formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
        localStorage.setItem("alumnos_editingAlumno", JSON.stringify(null));
        localStorage.setItem("alumnos_showForm", "false");
        setSuccessMsg("Alumno creado exitosamente");
        setShowSuccess(true);
      } catch (err) {
        alert("Error al crear alumno");
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
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h4"
        sx={{ color: "#43a047", mb: 2, fontWeight: "bold" }}
      >
        Lista de Alumnos
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField
          label="Buscar alumno por nombre, email, RUT o curso..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            background: "#222",
            input: { color: "#fff" },
            label: { color: "#aaa" },
            borderRadius: 1,
          }}
          InputProps={{
            sx: { color: "#fff" },
          }}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          sx={{
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: 16,
            px: 3,
            py: 1.5,
            borderRadius: 1,
          }}
          onClick={handleCreate}
        >
          Agregar Alumno
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: 2, overflowX: "auto" }}
      >
        <Table
          sx={{
            tableLayout: "auto",
            width: "100%",
            fontSize: "0.92rem",
          }}
        >
          <TableHead sx={{ background: "#e8f5e9" }}>
            <TableRow>
              <TableCell align="center" sx={{ fontSize: "0.92rem" }}>
                N°
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: "0.92rem" }}
              ></TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                }}
                onClick={() => handleSort("nombreAlumno")}
              >
                Nombre{" "}
                {sortBy === "nombreAlumno"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                }}
                onClick={() => handleSort("rutAlumno")}
              >
                RUT{" "}
                {sortBy === "rutAlumno"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                }}
                onClick={() => handleSort("telefonoAlumno")}
              >
                Teléfono{" "}
                {sortBy === "telefonoAlumno"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                }}
                onClick={() => handleSort("curso")}
              >
                Curso{" "}
                {sortBy === "curso" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                  display: { xs: "none", sm: "table-cell" },
                }}
                onClick={() => handleSort("tipoCurso")}
              >
                Tipo de Curso{" "}
                {sortBy === "tipoCurso"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                  display: { xs: "none", sm: "table-cell" },
                }}
                onClick={() => handleSort("modalidadClase")}
              >
                Modalidad{" "}
                {sortBy === "modalidadClase"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.92rem",
                  display: { xs: "none", sm: "table-cell" },
                }}
                onClick={() => handleSort("fechaIngreso")}
              >
                Fecha Ingreso{" "}
                {sortBy === "fechaIngreso"
                  ? sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </TableCell>
              <TableCell align="center" sx={{ fontSize: "0.92rem" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAlumnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay alumnos registrados.
                </TableCell>
              </TableRow>
            ) : (
              sortedAlumnos.map((alumno, idx) => (
                <TableRow
                  key={alumno._id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedAlumno(alumno);
                    setOpenFicha(true);
                    setTabIndex(0);
                  }}
                >
                  <TableCell align="center">{idx + 1}</TableCell>
                  <TableCell align="center">
                    <Avatar
                      src={alumno.fotoUrl || ""}
                      alt={alumno.nombreAlumno}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#eee",
                        color: "#222",
                        fontSize: "1rem",
                      }}
                    >
                      {!alumno.fotoUrl && alumno.nombreAlumno
                        ? alumno.nombreAlumno[0]
                        : null}
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.92rem" }}>
                    {alumno.nombreAlumno}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "0.92rem",
                      letterSpacing: "1px",
                      verticalAlign: "middle",
                    }}
                  >
                    {alumno.rutAlumno || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.92rem" }}>
                    {alumno.telefonoAlumno || "-"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.92rem" }}>
                    {alumno.curso || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.92rem",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {alumno.tipoCurso || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "0.92rem",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    {alumno.modalidadClase || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      fontSize: "0.92rem",
                      letterSpacing: "1px",
                      verticalAlign: "middle",
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
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlumno(alumno);
                          setOpenFicha(true);
                          setTabIndex(0);
                        }}
                        sx={{ p: 1 }}
                      >
                        <PersonIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(alumno);
                        }}
                        sx={{ p: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(alumno);
                        }}
                        sx={{ p: 1 }}
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
            borderRadius: 6,
            background: "#fff",
            color: "#222",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
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
            color: "#43a047",
            pb: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonIcon sx={{ fontSize: 32, color: "#43a047", mr: 1 }} />
          Ficha del Alumno
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: "#fff",
            px: { xs: 2, md: 6 },
            py: { xs: 2, md: 4 },
            maxHeight: "65vh",
            minHeight: "500px",
            overflowY: "auto",
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(67,160,71,0.10)",
            "&::-webkit-scrollbar": {
              width: "8px",
              background: "#d5ccccff",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#fefdfdff",
              borderRadius: "8px",
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
                    bgcolor: "#e8f5e9",
                    color: "#43a047",
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
                    sx={{ fontWeight: "bold", color: "#43a047" }}
                  >
                    {selectedAlumno.nombreAlumno}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: 16 }}>
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
                sx={{ mb: 2 }}
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
                    sx={{ color: "#43a047", fontWeight: "bold", mb: 2 }}
                  >
                    Datos Personales
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ mb: 2 }}>
                        <strong>RUT:</strong> {selectedAlumno.rutAlumno || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        <strong>Dirección:</strong>{" "}
                        {selectedAlumno.direccion || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        <strong>Teléfono:</strong>{" "}
                        {selectedAlumno.telefonoAlumno || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        <strong>Email:</strong> {selectedAlumno.email || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        <strong>RRSS:</strong> {selectedAlumno.rrss || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        <strong>Fecha de ingreso:</strong>{" "}
                        {formatFecha(selectedAlumno.fechaIngreso)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ mb: 2 }}>
                        <strong>Modalidad Clase:</strong>{" "}
                        {selectedAlumno.modalidadClase || "-"}
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
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
                    sx={{ color: "#43a047", fontWeight: "bold", mb: 2 }}
                  >
                    Otros Datos
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Conocimientos Previos:</strong>{" "}
                      {selectedAlumno.conocimientosPrevios ? "Sí" : "No"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Instrumentos:</strong>{" "}
                      {Array.isArray(selectedAlumno.instrumentos)
                        ? selectedAlumno.instrumentos.join(", ")
                        : selectedAlumno.instrumentos || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Estilos Musicales:</strong>{" "}
                      {Array.isArray(selectedAlumno.estilosMusicales)
                        ? selectedAlumno.estilosMusicales.join(", ")
                        : selectedAlumno.estilosMusicales || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Otro Estilo:</strong>{" "}
                      {selectedAlumno.otroEstilo || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Referente Musical:</strong>{" "}
                      {selectedAlumno.referenteMusical || "-"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Condición de Aprendizaje:</strong>{" "}
                      {selectedAlumno.condicionAprendizaje ? "Sí" : "No"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Condición Médica:</strong>{" "}
                      {selectedAlumno.condicionMedica ? "Sí" : "No"}
                    </Typography>
                    {selectedAlumno.condicionMedica && (
                      <Typography sx={{ mb: 1 }}>
                        <strong>Detalle:</strong>{" "}
                        {selectedAlumno.detalleCondicionMedica || "-"}
                      </Typography>
                    )}
                    <Typography sx={{ mb: 1 }}>
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
                    sx={{ color: "#43a047", fontWeight: "bold", mb: 2 }}
                  >
                    Datos de Apoderado
                  </Typography>
                  <Grid container spacing={0}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ mb: 1 }}>
                          <strong>Nombre Apoderado:</strong>{" "}
                          {selectedAlumno.nombreApoderado || "-"}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
                          <strong>RUT Apoderado:</strong>{" "}
                          {selectedAlumno.rutApoderado || "-"}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>
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
        <DialogActions sx={{ background: "#fff", px: 6, py: 3 }}>
          <Button
            variant="contained"
            color="success"
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
            color="info"
            sx={{
              fontWeight: "bold",
              px: 3,
              py: 1,
              fontSize: 16,
              borderRadius: 2,
            }}
          >
            CERRAR
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMsg}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default AlumnosList;
