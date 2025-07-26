import { useEffect, useState } from "react";
import {
  getProfesores,
  updateProfesor,
  createProfesor,
  deleteProfesor,
  toggleProfesorStatus,
} from "../../../services/profesores.service";
import ProfesorForm from "./ProfesorForm/ProfesorForm";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";

function ProfesoresList() {
  const [profesores, setProfesores] = useState([]);
  const [editingProfesor, setEditingProfesor] = useState(() => {
    const saved = localStorage.getItem("profesores_editingProfesor");
    return saved ? JSON.parse(saved) : null;
  });
  const [showForm, setShowForm] = useState(() => {
    const saved = localStorage.getItem("profesores_showForm");
    return saved === "true";
  });
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profesorToDelete, setProfesorToDelete] = useState(null);

  const fetchProfesores = () => {
    getProfesores()
      .then((res) => setProfesores(res.data.data || res.data))
      .catch((err) => {
        console.error("Error fetching profesores:", err);
        setSuccessMsg("Error al cargar profesores");
        setShowSuccess(true);
      });
  };

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleCreate = () => {
    setEditingProfesor(null);
    setShowForm(true);
    localStorage.setItem("profesores_editingProfesor", JSON.stringify(null));
    localStorage.setItem("profesores_showForm", "true");
  };

  const handleEdit = (profesor) => {
    setEditingProfesor(profesor);
    setShowForm(true);
    localStorage.setItem("profesores_editingProfesor", JSON.stringify(profesor));
    localStorage.setItem("profesores_showForm", "true");
  };

  const handleDelete = async (profesor) => {
    setProfesorToDelete(profesor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!profesorToDelete) return;

    try {
      setLoading(true);
      await deleteProfesor(profesorToDelete._id);
      fetchProfesores();
      setSuccessMsg("Profesor eliminado exitosamente");
      setShowSuccess(true);
    } catch (err) {
      console.error("Error deleting profesor:", err);
      setSuccessMsg("Error al eliminar profesor");
      setShowSuccess(true);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProfesorToDelete(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProfesor(null);
    localStorage.setItem("profesores_editingProfesor", JSON.stringify(null));
    localStorage.setItem("profesores_showForm", "false");
  };

  const handleSubmitForm = async (formData) => {
    try {
      setLoading(true);
      if (editingProfesor && editingProfesor._id) {
        await updateProfesor(editingProfesor._id, formData);
        setSuccessMsg("Profesor actualizado exitosamente");
      } else {
        await createProfesor(formData);
        setSuccessMsg("Profesor creado exitosamente");
      }
      fetchProfesores();
      handleCloseForm();
      setShowSuccess(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setSuccessMsg(err.response?.data?.message || "Error al guardar profesor");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (profesor) => {
    try {
      setLoading(true);
      await toggleProfesorStatus(profesor._id);
      fetchProfesores();
      setSuccessMsg(`Profesor ${profesor.activo ? "desactivado" : "activado"} exitosamente`);
      setShowSuccess(true);
    } catch (err) {
      console.error("Error toggling status:", err);
      setSuccessMsg("Error al cambiar estado del profesor");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfesores = profesores.filter((profesor) =>
    profesor.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    profesor.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
    profesor.email?.toLowerCase().includes(search.toLowerCase()) ||
    profesor.rut?.includes(search)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (showForm) {
    return (
      <ProfesorForm
        profesor={editingProfesor}
        onSubmit={handleSubmitForm}
        onCancel={handleCloseForm}
        loading={loading}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Gestión de Profesores
        </Typography>
        <Tooltip title="Agregar nuevo profesor">
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleCreate}
            disabled={loading}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>

      <TextField
        fullWidth
        label="Buscar profesores..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />,
        }}
      />

      <Grid container spacing={3}>
        {filteredProfesores.map((profesor) => (
          <Grid item xs={12} md={6} lg={4} key={profesor._id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                opacity: profesor.activo ? 1 : 0.7,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h6" component="h2" noWrap>
                    {profesor.nombre} {profesor.apellidos}
                  </Typography>
                  <Chip
                    label={profesor.activo ? "Activo" : "Inactivo"}
                    color={profesor.activo ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Typography color="text.secondary" gutterBottom>
                  <strong>RUT:</strong> {profesor.rut}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  <strong>Email:</strong> {profesor.email}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  <strong>Teléfono:</strong> {profesor.numero}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  <strong>Sueldo:</strong> {formatCurrency(profesor.sueldo)}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  <strong>Fecha de contrato:</strong> {formatDate(profesor.fechaContrato)}
                </Typography>

                <Button
                  size="small"
                  onClick={() => setExpandedId(expandedId === profesor._id ? null : profesor._id)}
                  endIcon={expandedId === profesor._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{ mt: 1 }}
                >
                  {expandedId === profesor._id ? "Menos detalles" : "Más detalles"}
                </Button>

                <Collapse in={expandedId === profesor._id} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>ID:</strong> {profesor._id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Creado:</strong> {formatDate(profesor.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Última actualización:</strong> {formatDate(profesor.updatedAt)}
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>

              <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(profesor)}
                    disabled={loading}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(profesor)}
                    disabled={loading}
                    color={profesor.activo ? "warning" : "success"}
                  >
                    {profesor.activo ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(profesor)}
                    disabled={loading}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProfesores.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {search ? "No se encontraron profesores que coincidan con la búsqueda" : "No hay profesores registrados"}
          </Typography>
        </Box>
      )}

      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <MuiAlert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMsg}
        </MuiAlert>
      </Snackbar>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que quieres eliminar al profesor{" "}
            <strong>{profesorToDelete?.nombre} {profesorToDelete?.apellidos}</strong>?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={loading}>
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProfesoresList; 