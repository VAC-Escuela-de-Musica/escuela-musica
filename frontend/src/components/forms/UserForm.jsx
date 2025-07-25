import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Box, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput
} from '@mui/material';
import apiService from '../../services/api.service.js';

/**
 * Formulario específico para usuarios
 * Incluye gestión de roles y validación
 */
const UserForm = ({ 
  data = {}, 
  onChange, 
  isEditing = false, 
  loading = false 
}) => {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // Cargar roles disponibles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await apiService.get('/roles');
        
        // Manejar diferentes estructuras de respuesta
        let rolesArray = [];
        if (Array.isArray(response)) {
          rolesArray = response;
        } else if (Array.isArray(response.data)) {
          rolesArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          rolesArray = response.data.data;
        }
        
        setRoles(rolesArray);
      } catch (error) {
        console.error('Error cargando roles:', error);
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Manejador de cambios en los inputs
  const handleInputChange = (field, value) => {
    if (onChange) {
      onChange({ [field]: value });
    }
  };

  // Manejador específico para roles múltiples
  const handleRolesChange = (event) => {
    const value = event.target.value;
    handleInputChange('roles', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Nombre de Usuario"
        value={data.username || ''}
        onChange={(e) => handleInputChange('username', e.target.value)}
        margin="normal"
        required
        disabled={loading}
        placeholder="Nombre de usuario único"
      />
      
      <TextField
        fullWidth
        label="Email"
        value={data.email || ''}
        onChange={(e) => handleInputChange('email', e.target.value)}
        margin="normal"
        type="email"
        required
        disabled={loading}
        placeholder="correo@ejemplo.com"
      />
      
      <TextField
        fullWidth
        label="RUT"
        value={data.rut || ''}
        onChange={(e) => handleInputChange('rut', e.target.value)}
        margin="normal"
        disabled={loading}
        placeholder="12345678-9"
        helperText="Formato: 12345678-9"
      />
      
      {!isEditing && (
        <TextField
          fullWidth
          label="Contraseña"
          value={data.password || ''}
          onChange={(e) => handleInputChange('password', e.target.value)}
          margin="normal"
          type="password"
          required
          disabled={loading}
          placeholder="Contraseña segura"
          helperText="Mínimo 6 caracteres"
        />
      )}
      
      <FormControl fullWidth margin="normal" disabled={loading || rolesLoading}>
        <InputLabel>Roles</InputLabel>
        <Select
          multiple
          value={data.roles || []}
          onChange={handleRolesChange}
          input={<OutlinedInput label="Roles" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const role = roles.find(r => r._id === value || r.name === value);
                return (
                  <Chip 
                    key={value} 
                    label={role ? role.name : value} 
                    size="small" 
                  />
                );
              })}
            </Box>
          )}
        >
          {roles.map((role) => (
            <MenuItem key={role._id || role.name} value={role._id || role.name}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default UserForm;