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
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SchoolIcon from "@mui/icons-material/School";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";

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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ color: "#1976d2", fontWeight: "bold" }}
        >
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Gestión de Profesores
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField
          label="Buscar profesor por nombre, apellido, email o RUT..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#1976d2",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
              },
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#1976d2",
            },
          }}
          InputProps={{
            startAdornment: <PersonIcon sx={{ mr: 1, color: "#1976d2" }} />,
          }}
        />
        <Button
          variant="contained"
          color="primary"
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
          disabled={loading}
        >
          Agregar Profesor
        </Button>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: 2,
          "& .MuiTableCell-root": {
            borderColor: "#e3f2fd"
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1 }} />
                  Profesor
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <BadgeIcon sx={{ mr: 1 }} />
                  RUT
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <EmailIcon sx={{ mr: 1 }} />
                  Email
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <PhoneIcon sx={{ mr: 1 }} />
                  Teléfono
                </Box>
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                Fecha Contrato
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell sx={{ color: "#1976d2", fontWeight: "bold" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProfesores.map((profesor) => (
              <TableRow
                key={profesor._id}
                sx={{ 
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  opacity: profesor.activo ? 1 : 0.7,
                }}
              >
                <TableCell>
                  <Typography variant="body1" fontWeight="medium">
                    {profesor.nombre} {profesor.apellidos}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {profesor.rut}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {profesor.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {profesor.numero}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(profesor.fechaContrato)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={profesor.activo ? "Activo" : "Inactivo"}
                    color={profesor.activo ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      onClick={() => handleEdit(profesor)}
                      disabled={loading}
                      sx={{ color: "#1976d2" }}
                      title="Editar profesor"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleStatus(profesor)}
                      disabled={loading}
                      sx={{ color: profesor.activo ? "#ed6c02" : "#2e7d32" }}
                      title={profesor.activo ? "Desactivar" : "Activar"}
                    >
                      {profesor.activo ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(profesor)}
                      disabled={loading}
                      sx={{ color: "#d32f2f" }}
                      title="Eliminar profesor"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredProfesores.length === 0 && (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="text.secondary">
              {search ? "No se encontraron profesores que coincidan con la búsqueda" : "No hay profesores registrados"}
            </Typography>
          </Box>
        )}
             </TableContainer>

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