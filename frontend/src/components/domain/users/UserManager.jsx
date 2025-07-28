import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useAuth } from '../../../context/AuthContext.jsx';
import UnauthorizedAccess from '../../common/UnauthorizedAccess.jsx';

const UserManager = () => {
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    rut: "",
    password: "",
    roles: [],
  });
  const [roles, setRoles] = useState([]);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: null
  });

  const [search, setSearch] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <UnauthorizedAccess 
        title="Gestión de Usuarios"
        message="Solo administradores pueden gestionar usuarios del sistema."
        suggestion="Contacta al administrador si necesitas realizar cambios de usuarios."
        icon={<PersonIcon fontSize="large" />}
        color="error"
      />
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("No posee el rol de administrador");
      }

      const data = await response.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setNotification({
        open: true,
        message: "Error al cargar los usuarios: " + err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        let rolesArray = [];
        if (Array.isArray(data)) {
          rolesArray = data;
        } else if (Array.isArray(data.data)) {
          rolesArray = data.data;
        } else if (data.data && Array.isArray(data.data.data)) {
          rolesArray = data.data.data;
        }
        rolesArray = rolesArray.map(role => role.toLowerCase());
        setRoles(rolesArray);
      }
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const formDataToSend = {
        ...formData,
        roles: formData.roles.map(role => role.toLowerCase())
      };
      
      const url = editingUser 
        ? `${API_URL}/${editingUser._id}`
        : `${API_URL}`;

      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formDataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del backend:", errorData);
        throw new Error(errorData.message || "Error al guardar el usuario");
      }

      setOpenDialog(false);
      setEditingUser(null);
      setFormData({ username: "", email: "", rut: "", password: "", roles: [] });
      setNotification({
        open: true,
        message: editingUser ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        severity: 'success'
      });
      fetchUsers();
    } catch (err) {
      setNotification({
        open: true,
        message: "Error al guardar el usuario: " + err.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u._id === userId);
    
    setDeleteDialog({
      open: true,
      userId: userId,
      userName: user?.username || user?.email || 'este usuario'
    });
  };

  const confirmDelete = async () => {
    const { userId } = deleteDialog;

    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el usuario");
      }

      setUsers(users.filter(user => user._id !== userId));
      setNotification({
        open: true,
        message: "Usuario eliminado exitosamente",
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: "Error al eliminar el usuario: " + err.message,
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, userId: null, userName: null });
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    
    const userRoles = user.roles ? user.roles.map(role => {
      if (typeof role === 'string') {
        return role;
      } else if (role && role.name) {
        return role.name;
      }
      return '';
    }).filter(Boolean) : [];
    
    setFormData({
      username: user.username || "",
      email: user.email || "",
      rut: user.rut || "",
      password: "",
      roles: userRoles,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ username: "", email: "", rut: "", password: "", roles: [] });
  };

  const getRoleName = (role) => {
    let roleName = '';
    
    if (typeof role === 'string') {
      roleName = role;
    } else if (role && role.name) {
      roleName = role.name;
    } else {
      return "Rol desconocido";
    }
    
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  };

  const filteredUsers = users.filter(user =>
    (user.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (user.rut || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = () => {
    fetchRoles();
    setOpenDialog(true);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#222222", minHeight: "100vh", color: "white" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ backgroundColor: "#4CAF50" }}
        >
          Agregar Usuario
        </Button>
      </Box>
      <TextField
        fullWidth
        placeholder="Buscar usuario por nombre, email o RUT..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 3, input: { color: "white" }, label: { color: "gray" } }}
        InputProps={{ sx: { color: "white" } }}
      />

      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: "#333333", 
          borderRadius: 2,
          "& .MuiTableCell-root": {
            borderColor: "#555555"
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#444444" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ mr: 1 }} />
                  Usuario
                </Box>
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <EmailIcon sx={{ mr: 1 }} />
                  Email
                </Box>
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                <Box display="flex" alignItems="center">
                  <BadgeIcon sx={{ mr: 1 }} />
                  RUT
                </Box>
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Roles
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
              <TableRow
                key={user._id}
                sx={{ 
                  "&:hover": { backgroundColor: "#444444" },
                  "& td": { color: "white" }
                }}
              >
                <TableCell sx={{ color: "white" }}>
                  <Typography variant="body1" fontWeight="medium">
                    {user.username}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <Typography variant="body2" color="lightgray">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <Typography variant="body2">
                    {user.rut}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: "white" }}>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {user.roles && user.roles.map((role, index) => (
                      <Chip
                        key={index}
                        label={getRoleName(role)}
                        size="small"
                        sx={{ 
                          backgroundColor: "#4CAF50", 
                          color: "white",
                          fontSize: "0.75rem"
                        }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      onClick={() => handleEdit(user)}
                      sx={{ color: "#4CAF50" }}
                      title="Editar usuario"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(user._id)}
                      sx={{ color: "#f44336" }}
                      title="Eliminar usuario"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {(!Array.isArray(filteredUsers) || filteredUsers.length === 0) && (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="gray">
              {search ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios registrados"}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Dialog para agregar/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#333333", color: "white" }}>
          {editingUser ? "Editar Usuario" : "Agregar Nuevo Usuario"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#333333", color: "white" }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre de usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            <TextField
              fullWidth
              label="RUT"
              value={formData.rut}
              onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            <TextField
              fullWidth
              label={editingUser ? "Nueva contraseña (dejar vacío para mantener)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: "white" } }}
              InputLabelProps={{ sx: { color: "gray" } }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: "gray" }}>Roles</InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                sx={{ color: "white" }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const roleName = typeof value === 'string' ? value : (value?.name || 'Unknown');
                      return (
                        <Chip 
                          key={roleName} 
                          label={roleName.charAt(0).toUpperCase() + roleName.slice(1)} 
                          size="small"
                          sx={{ backgroundColor: "#4CAF50", color: "white" }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {roles.length === 0 && (
                  <MenuItem disabled value="">
                    No hay roles disponibles
                  </MenuItem>
                )}
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#333333" }}>
          <Button onClick={handleCloseDialog} sx={{ color: "white" }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ backgroundColor: "#4CAF50" }}>
            {editingUser ? "Actualizar" : "Agregar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            ¿Estás seguro de que quieres eliminar al usuario {deleteDialog.userName}?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificación */}
      {notification.open && (
        <Alert 
          severity={notification.severity} 
          onClose={handleCloseNotification}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            zIndex: 9999,
            backgroundColor: notification.severity === 'error' ? '#f44336' : '#4caf50',
            color: 'white'
          }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default UserManager;