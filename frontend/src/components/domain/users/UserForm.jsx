import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  Divider
} from '@mui/material';

/**
 * Formulario específico para usuarios
 * Extraído del UserManager original, mantiene 100% funcionalidad
 * Incluye validaciones específicas de usuarios
 */
const UserForm = ({ 
  formData, 
  onInputChange, 
  isEditing, 
  loading 
}) => {
  const [rutError, setRutError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Roles disponibles
  const availableRoles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'asistente', label: 'Asistente' }
  ];

  // Validación de RUT en tiempo real
  useEffect(() => {
    if (formData.rut) {
      const rutRegex = /^\d{7,8}-[\dKk]$/;
      if (!rutRegex.test(formData.rut)) {
        setRutError('Formato de RUT inválido. Ej: 12345678-9');
      } else {
        setRutError('');
      }
    } else {
      setRutError('');
    }
  }, [formData.rut]);

  // Validación de email en tiempo real
  useEffect(() => {
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setEmailError('Formato de email inválido');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [formData.email]);

  // Formatear RUT automáticamente
  const handleRutChange = (value) => {
    // Remover caracteres no válidos
    let cleaned = value.replace(/[^\dKk]/g, '');
    
    // Agregar guión automáticamente
    if (cleaned.length > 1) {
      cleaned = cleaned.slice(0, -1) + '-' + cleaned.slice(-1);
    }
    
    onInputChange('rut', cleaned.toUpperCase());
  };

  return (
    <Box sx={{ minWidth: 400 }}>
      {/* Información básica */}
      <Typography variant="h6" gutterBottom>
        Información Básica
      </Typography>

      {/* Campo Username */}
      <TextField
        fullWidth
        label="Nombre de Usuario"
        value={formData.username || ''}
        onChange={(e) => onInputChange('username', e.target.value)}
        margin="normal"
        required
        disabled={loading}
        helperText="Usado para el login al sistema"
      />

      {/* Campo Email */}
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email || ''}
        onChange={(e) => onInputChange('email', e.target.value)}
        margin="normal"
        required
        disabled={loading}
        error={!!emailError}
        helperText={emailError || 'Email para comunicaciones y recuperación de contraseña'}
      />

      {/* Campo RUT */}
      <TextField
        fullWidth
        label="RUT"
        value={formData.rut || ''}
        onChange={(e) => handleRutChange(e.target.value)}
        margin="normal"
        disabled={loading}
        error={!!rutError}
        helperText={rutError || 'RUT chileno. Ej: 12345678-9'}
        placeholder="12345678-9"
      />

      <Divider sx={{ my: 3 }} />

      {/* Información del sistema */}
      <Typography variant="h6" gutterBottom>
        Configuración del Sistema
      </Typography>

      {/* Campo Rol */}
      <TextField
        fullWidth
        select
        label="Rol"
        value={formData.role || ''}
        onChange={(e) => onInputChange('role', e.target.value)}
        margin="normal"
        required
        disabled={loading}
        helperText="Define los permisos del usuario en el sistema"
      >
        {availableRoles.map((role) => (
          <MenuItem key={role.value} value={role.value}>
            {role.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Campo Password (solo para crear) */}
      {!isEditing && (
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          value={formData.password || ''}
          onChange={(e) => onInputChange('password', e.target.value)}
          margin="normal"
          required
          disabled={loading}
          helperText="Mínimo 6 caracteres. El usuario puede cambiarla después."
        />
      )}

      {/* Campo Activo */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.activo !== undefined ? formData.activo : true}
            onChange={(e) => onInputChange('activo', e.target.checked)}
            disabled={loading}
          />
        }
        label="Usuario activo"
        sx={{ mt: 2, mb: 2 }}
      />

      {/* Información sobre roles */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Roles del sistema:</strong>
          <br />
          • <strong>Administrador:</strong> Acceso completo al sistema
          <br />
          • <strong>Profesor:</strong> Gestión de clases y alumnos
          <br />
          • <strong>Asistente:</strong> Acceso limitado a funciones básicas
        </Typography>
      </Alert>

      {/* Advertencia para edición */}
      {isEditing && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Para cambiar la contraseña del usuario, debe hacerlo desde el perfil del usuario 
            o usar la función "Resetear contraseña".
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default UserForm;