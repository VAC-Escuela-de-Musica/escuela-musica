import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Lock from '@mui/icons-material/Lock';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';

export default function ChangePasswordDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('La contraseña actual es requerida');
      return false;
    }
    if (!formData.newPassword) {
      setError('La nueva contraseña es requerida');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.alumnos.changePassword, {
        method: 'PUT',
        headers: API_HEADERS.withAuth(),
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Limpiar formulario
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        if (onSuccess) {
          onSuccess(data.message || 'Contraseña actualizada correctamente');
        }
        
        onClose();
      } else {
        setError(data.error || data.message || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2a2a2a',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Lock color="primary" />
        <Typography variant="h6">Cambiar Contraseña</Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ingresa tu contraseña actual y la nueva contraseña que deseas usar.
          </Typography>

          {/* Contraseña Actual */}
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'gray' }}>Contraseña Actual</InputLabel>
            <OutlinedInput
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange('currentPassword')}
              label="Contraseña Actual"
              sx={{ color: 'white' }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          {/* Nueva Contraseña */}
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'gray' }}>Nueva Contraseña</InputLabel>
            <OutlinedInput
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              label="Nueva Contraseña"
              sx={{ color: 'white' }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('new')}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          {/* Confirmar Nueva Contraseña */}
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'gray' }}>Confirmar Nueva Contraseña</InputLabel>
            <OutlinedInput
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              label="Confirmar Nueva Contraseña"
              sx={{ color: 'white' }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Requisitos de la contraseña:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Mínimo 6 caracteres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Debe ser diferente a la contraseña actual
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ color: 'gray' }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 