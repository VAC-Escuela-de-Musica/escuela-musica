import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const [search, setSearch] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/users`;

  // cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

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
      console.log("Usuarios cargados:", data.data);
      if (data.data && data.data.length > 0) {
        console.log("Roles del primer usuario:", data.data[0].roles);
      }
    } catch (err) {
      setError("Error al cargar los usuarios: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/roles`);
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
        // Asegurar que todos los roles estén en minúscula
        rolesArray = rolesArray.map(role => role.toLowerCase());
        setRoles(rolesArray);
        console.log("Roles cargados:", rolesArray);
      }
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      // Asegurar que los roles se envíen en minúscula
      const formDataToSend = {
        ...formData,
        roles: formData.roles.map(role => role.toLowerCase())
      };
      
      console.log("Datos enviados:", formDataToSend);
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
      fetchUsers();
    } catch (err) {
      setError("Error al guardar el usuario: " + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return;
    }

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

      fetchUsers();
    } catch (err) {
      setError("Error al eliminar el usuario: " + err.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      rut: user.rut || "",
      password: "",
      roles: user.roles || [], // Los roles ya son strings, no necesitamos mapear
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({ username: "", email: "", rut: "", password: "", roles: [] });
  };

  const getRoleName = (roleString) => {
    // Los roles ahora son strings directos, no necesitamos buscar por ID
    return roleString ? roleString.charAt(0).toUpperCase() + roleString.slice(1) : "Rol desconocido";
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.rut.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = () => {
    fetchRoles();
    setOpenDialog(true);
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box display="flex" alignItems="flex-start">
        <Box flex={1}>
          <Grid container spacing={3}>
            {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user._id}>
                <Card sx={{ backgroundColor: "#333333", color: "white" }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ mr: 2, backgroundColor: "#4CAF50" }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {user.username}
                        </Typography>
                        <Typography variant="body2" color="gray">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="body2" display="flex" alignItems="center" mb={1}>
                        <BadgeIcon sx={{ mr: 1, fontSize: 16 }} />
                        RUT: {user.rut}
                      </Typography>
                      
                      <Box mt={1}>
                        <Typography variant="caption" color="gray" display="block" mb={1}>
                          Roles:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {user.roles && user.roles.map((role, index) => (
                            <Chip
                              key={index}
                              label={getRoleName(role)}
                              size="small"
                              sx={{ 
                                backgroundColor: "#4CAF50", 
                                color: "white",
                                fontSize: "0.7rem"
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="flex-end">
                      <IconButton
                        onClick={() => handleEdit(user)}
                        sx={{ color: "white" }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(user._id)}
                        sx={{ color: "red" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* agregar/editar usuario */}
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
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value.charAt(0).toUpperCase() + value.slice(1)} 
                        size="small"
                        sx={{ backgroundColor: "#4CAF50", color: "white" }}
                      />
                    ))}
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
    </Box>
  );
};

export default UserManager; 