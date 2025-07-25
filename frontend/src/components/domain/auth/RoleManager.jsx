import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
// Corregir línea 16
import { API_HEADERS } from '../../../config/api.js';

const RoleManager = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/api/roles`;

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Error al cargar los roles");
      const data = await response.json();
      setRoles(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError("Error al cargar los roles: " + err.message);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) return;
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          ...API_HEADERS.withAuth(),
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ name: newRole.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agregar rol");
      }
      setNewRole("");
      setSuccess("Rol agregado correctamente");
      fetchRoles();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Error al agregar rol: " + err.message);
      setTimeout(() => setError(""), 2000);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm("¿Eliminar este rol?")) return;
    try {
      const response = await fetch(`${API_URL}/${roleId}`, {
        method: "DELETE",
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Error al eliminar rol");
      fetchRoles();
    } catch (err) {
      setError("Error al eliminar rol: " + err.message);
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <Box sx={{ minWidth: 250, maxWidth: 300, background: "#232323", p: 2, borderRadius: 2, ml: 4 }}>
      <Typography variant="h6" gutterBottom>
        Roles del sistema
      </Typography>
      <Divider sx={{ mb: 2, background: "#444" }} />
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
      <List dense>
        {roles.map((role) => (
          <ListItem key={role._id} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteRole(role._id)} sx={{ color: "red" }}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={role.name} />
          </ListItem>
        ))}
      </List>
      <Box display="flex" gap={1} mt={2}>
        <TextField
          size="small"
          label="Nuevo rol"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          sx={{ flex: 1, input: { color: "white" }, label: { color: "gray" } }}
        />
        <Button variant="contained" color="success" onClick={handleAddRole} startIcon={<AddIcon />}>
          Agregar
        </Button>
      </Box>
    </Box>
  );
};

export default RoleManager;