import { useEffect, useState } from "react";
import {
  getAlumnos,
  updateAlumno,
  createAlumno,
  deleteAlumno,
} from "../services/alumnos.service";
import AlumnoForm from "./AlumnoForm";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  TextField,
  Box,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function AlumnosList() {
  const [alumnos, setAlumnos] = useState([]);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchAlumnos = () => {
    getAlumnos()
      .then((res) => setAlumnos(res.data.data || res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleCreate = () => {
    setEditingAlumno(null);
    setShowForm(true);
  };
  const handleEdit = (alumno) => {
    setEditingAlumno(alumno);
    setShowForm(true);
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
  };
  const handleSubmitForm = async (formData) => {
    if (editingAlumno && editingAlumno._id) {
      try {
        await updateAlumno(editingAlumno._id, formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
      } catch (err) {
        alert("Error al actualizar alumno");
      }
    } else {
      try {
        await createAlumno(formData);
        fetchAlumnos();
        setShowForm(false);
        setEditingAlumno(null);
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
      alumno.email?.toLowerCase().includes(term)
    );
  });

  // Tarjeta resumen
  const renderResumenCard = (alumno) => (
    <Card
      sx={{
        background: "#23273a",
        color: "#fff",
        mb: 2,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.28)" },
      }}
      onClick={() =>
        setExpandedId(expandedId === alumno._id ? null : alumno._id)
      }
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PersonIcon sx={{ fontSize: 32, mr: 1, color: "#7f8fa6" }} />
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
            {alumno.nombreAlumno}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <IconButton
            size="small"
            sx={{ color: "#7f8fa6" }}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedId(expandedId === alumno._id ? null : alumno._id);
            }}
          >
            {expandedId === alumno._id ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}
          </IconButton>
        </Box>
        <Typography>
          <strong>RUT:</strong> {alumno.rutAlumno}
        </Typography>
        <Typography>
          <strong>Dirección:</strong> {alumno.direccion}
        </Typography>
        <Typography>
          <strong>Teléfono:</strong> {alumno.telefonoAlumno}
        </Typography>
        <Typography>
          <strong>Email:</strong> {alumno.email}
        </Typography>
        <Typography>
          <strong>Fecha de ingreso:</strong> {alumno.fechaIngreso}
        </Typography>
        <Typography>
          <strong>Curso:</strong> {alumno.curso}
        </Typography>
        <Typography>
          <strong>Tipo de Curso:</strong> {alumno.tipoCurso}
        </Typography>
        <Typography>
          <strong>Modalidad Clase:</strong> {alumno.modalidadClase}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="info"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(alumno);
          }}
          sx={{ mr: 1 }}
        >
          Editar
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(alumno);
          }}
        >
          Eliminar
        </Button>
      </CardActions>
      {/* Ficha completa expandible */}
      <Collapse in={expandedId === alumno._id} timeout="auto" unmountOnExit>
        <CardContent sx={{ background: "#20243a", mt: 1, borderRadius: 2 }}>
          {/* DATOS DEL ALUMNO */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, mb: 1, color: "#7f8fa6", fontWeight: "bold" }}
          >
            Datos del Alumno
          </Typography>
          <Divider sx={{ mb: 1, background: "#7f8fa6" }} />
          <Typography>
            <strong>RUT:</strong> {alumno.rutAlumno}
          </Typography>
          <Typography>
            <strong>Dirección:</strong> {alumno.direccion}
          </Typography>
          <Typography>
            <strong>Teléfono:</strong> {alumno.telefonoAlumno}
          </Typography>
          <Typography>
            <strong>Email:</strong> {alumno.email}
          </Typography>
          <Typography>
            <strong>Fecha de ingreso:</strong> {alumno.fechaIngreso}
          </Typography>
          {/* OTROS DATOS */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, mb: 1, color: "#7f8fa6", fontWeight: "bold" }}
          >
            Otros Datos
          </Typography>
          <Divider sx={{ mb: 1, background: "#7f8fa6" }} />
          <Typography>
            <strong>RRSS:</strong> {alumno.rrss}
          </Typography>
          <Typography>
            <strong>Conocimientos Previos:</strong>{" "}
            {alumno.conocimientosPrevios ? "Sí" : "No"}
          </Typography>
          <Typography>
            <strong>Instrumentos:</strong>{" "}
            {Array.isArray(alumno.instrumentos)
              ? alumno.instrumentos.join(", ")
              : alumno.instrumentos}
          </Typography>
          <Typography>
            <strong>Estilos Musicales:</strong>{" "}
            {Array.isArray(alumno.estilosMusicales)
              ? alumno.estilosMusicales.join(", ")
              : alumno.estilosMusicales}
          </Typography>
          <Typography>
            <strong>Otro Estilo:</strong> {alumno.otroEstilo}
          </Typography>
          <Typography>
            <strong>Referente Musical:</strong> {alumno.referenteMusical}
          </Typography>
          <Typography>
            <strong>Condición de Aprendizaje:</strong>{" "}
            {alumno.condicionAprendizaje ? "Sí" : "No"}
          </Typography>
          {alumno.condicionAprendizaje && (
            <Typography>
              <strong>Detalle Condición de Aprendizaje:</strong>{" "}
              {alumno.detalleCondicionAprendizaje}
            </Typography>
          )}
          <Typography>
            <strong>Condición Médica:</strong>{" "}
            {alumno.condicionMedica ? "Sí" : "No"}
          </Typography>
          {alumno.condicionMedica && (
            <Typography>
              <strong>Detalle Condición Médica:</strong>{" "}
              {alumno.detalleCondicionMedica}
            </Typography>
          )}
          <Typography>
            <strong>Observaciones:</strong> {alumno.observaciones}
          </Typography>
          {/* DATOS DE CLASE */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, mb: 1, color: "#7f8fa6", fontWeight: "bold" }}
          >
            Datos de Clase
          </Typography>
          <Divider sx={{ mb: 1, background: "#7f8fa6" }} />
          <Typography>
            <strong>Curso:</strong> {alumno.curso}
          </Typography>
          <Typography>
            <strong>Tipo de Curso:</strong> {alumno.tipoCurso}
          </Typography>
          <Typography>
            <strong>Modalidad Clase:</strong> {alumno.modalidadClase}
          </Typography>
          <Typography>
            <strong>Clase:</strong> {alumno.clase}
          </Typography>
          {/* DATOS DE APODERADO */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 2, mb: 1, color: "#7f8fa6", fontWeight: "bold" }}
          >
            Datos de Apoderado
          </Typography>
          <Divider sx={{ mb: 1, background: "#7f8fa6" }} />
          <Typography>
            <strong>Nombre Apoderado:</strong> {alumno.nombreApoderado}
          </Typography>
          <Typography>
            <strong>RUT Apoderado:</strong> {alumno.rutApoderado}
          </Typography>
          <Typography>
            <strong>Teléfono Apoderado:</strong> {alumno.telefonoApoderado}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ color: "#fff", mb: 2 }}>
        Lista de Alumnos
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField
          label="Buscar alumno por nombre, email o RUT..."
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
      <Grid container spacing={3}>
        {filteredAlumnos.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="textSecondary">
              No hay alumnos registrados.
            </Typography>
          </Grid>
        ) : (
          filteredAlumnos.map((alumno) => (
            <Grid item xs={12} sm={6} md={4} key={alumno._id}>
              {renderResumenCard(alumno)}
            </Grid>
          ))
        )}
      </Grid>
      {showForm && (
        <AlumnoForm
          initialData={editingAlumno}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      )}
    </Box>
  );
}

export default AlumnosList;
