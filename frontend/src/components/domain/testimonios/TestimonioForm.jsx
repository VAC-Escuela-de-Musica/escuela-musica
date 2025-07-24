import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Rating,
  Avatar,
  Card,
  CardContent,
  Alert,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Comment as CommentIcon,
  Photo as PhotoIcon,
  Star as StarIcon
} from '@mui/icons-material';

/**
 * Formulario específico para testimonios - Capa 3
 * Versión mejorada del formulario original con validaciones
 * Incluye rating visual, preview de foto y tema oscuro
 */
const TestimonioForm = ({ 
  data = {}, 
  onChange, 
  isEditing = false, 
  loading = false,
  theme = null
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    opinion: '',
    foto: '',
    estrellas: 5,
    institucion: '',
    activo: true,
    ...data
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState('');

  // Estilos del tema oscuro
  const darkTheme = {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    cardBackground: '#333333',
    borderColor: '#555555'
  };

  // Sincronizar con props
  useEffect(() => {
    setFormData({
      nombre: '',
      cargo: '',
      opinion: '',
      foto: '',
      estrellas: 5,
      institucion: '',
      activo: true,
      ...data
    });
    setPhotoPreview(data.foto || '');
  }, [data]);

  // Manejador de cambios
  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Validación en tiempo real para foto
    if (field === 'foto') {
      setPhotoPreview('');
      if (value && isValidUrl(value)) {
        setPhotoPreview(value);
      }
    }

    // Propagate change
    if (onChange) {
      onChange(newData);
    }
  };

  // Validar URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Validación de formulario
  const validateField = (field, value) => {
    switch (field) {
      case 'nombre':
        if (!value?.trim()) return 'El nombre es requerido';
        if (value.length > 50) return 'El nombre no puede exceder 50 caracteres';
        return null;
      
      case 'cargo':
        if (!value?.trim()) return 'El cargo es requerido';
        if (value.length > 100) return 'El cargo no puede exceder 100 caracteres';
        return null;
      
      case 'opinion':
        if (!value?.trim()) return 'La opinión es requerida';
        if (value.length < 10) return 'La opinión debe tener al menos 10 caracteres';
        if (value.length > 500) return 'La opinión no puede exceder 500 caracteres';
        return null;
      
      case 'foto':
        if (value && !isValidUrl(value)) return 'Debe ser una URL válida';
        return null;
      
      case 'institucion':
        if (value && value.length > 100) return 'La institución no puede exceder 100 caracteres';
        return null;
      
      default:
        return null;
    }
  };

  // Validar al perder foco
  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  return (
    <Box sx={{ 
      minWidth: 500,
      color: theme?.isDark ? darkTheme.color : 'text.primary'
    }}>
      {/* Información básica */}
      <Typography variant="h6" gutterBottom>
        Información del Testimonio
      </Typography>

      <Grid container spacing={3}>
        {/* Columna izquierda - Datos personales */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PersonIcon color="primary" />
            <Typography variant="subtitle2">Datos Personales</Typography>
          </Box>

          <TextField
            fullWidth
            label="Nombre completo"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            onBlur={() => handleBlur('nombre')}
            margin="normal"
            required
            disabled={loading}
            error={!!errors.nombre}
            helperText={errors.nombre || 'Nombre de la persona que da el testimonio'}
            inputProps={{ maxLength: 50 }}
            sx={{
              '& .MuiInputBase-input': {
                color: theme?.isDark ? darkTheme.color : 'text.primary'
              }
            }}
          />

          <TextField
            fullWidth
            label="Cargo o profesión"
            value={formData.cargo}
            onChange={(e) => handleInputChange('cargo', e.target.value)}
            onBlur={() => handleBlur('cargo')}
            margin="normal"
            required
            disabled={loading}
            error={!!errors.cargo}
            helperText={errors.cargo || 'Cargo, profesión o especialidad'}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiInputBase-input': {
                color: theme?.isDark ? darkTheme.color : 'text.primary'
              }
            }}
          />

          <TextField
            fullWidth
            label="Institución (opcional)"
            value={formData.institucion}
            onChange={(e) => handleInputChange('institucion', e.target.value)}
            onBlur={() => handleBlur('institucion')}
            margin="normal"
            disabled={loading}
            error={!!errors.institucion}
            helperText={errors.institucion || 'Empresa, institución o centro de trabajo'}
            inputProps={{ maxLength: 100 }}
            sx={{
              '& .MuiInputBase-input': {
                color: theme?.isDark ? darkTheme.color : 'text.primary'
              }
            }}
          />
        </Grid>

        {/* Columna derecha - Foto y calificación */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <PhotoIcon color="primary" />
            <Typography variant="subtitle2">Foto y Calificación</Typography>
          </Box>

          <TextField
            fullWidth
            label="URL de la foto"
            value={formData.foto}
            onChange={(e) => handleInputChange('foto', e.target.value)}
            onBlur={() => handleBlur('foto')}
            margin="normal"
            type="url"
            disabled={loading}
            error={!!errors.foto}
            helperText={errors.foto || 'URL de la imagen del perfil (opcional)'}
            placeholder="https://ejemplo.com/foto.jpg"
            sx={{
              '& .MuiInputBase-input': {
                color: theme?.isDark ? darkTheme.color : 'text.primary'
              }
            }}
          />

          {/* Preview de la foto */}
          {photoPreview && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Avatar
                src={photoPreview}
                alt="Preview"
                sx={{
                  width: 80,
                  height: 80,
                  border: theme?.isDark ? `2px solid ${darkTheme.borderColor}` : '2px solid #e0e0e0'
                }}
              >
                {formData.nombre?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Box>
          )}

          {/* Calificación con estrellas */}
          <Box mt={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <StarIcon color="primary" />
              <Typography variant="subtitle2">Calificación</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Rating
                value={formData.estrellas || 0}
                onChange={(event, newValue) => {
                  handleInputChange('estrellas', newValue || 1);
                }}
                disabled={loading}
                size="large"
                sx={{ 
                  '& .MuiRating-iconFilled': { 
                    color: '#FFD700' 
                  },
                  '& .MuiRating-iconEmpty': { 
                    color: theme?.isDark ? '#555' : '#e0e0e0'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                ({formData.estrellas || 0} estrella{formData.estrellas !== 1 ? 's' : ''})
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Opinión */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <CommentIcon color="primary" />
        <Typography variant="subtitle2">Testimonio</Typography>
      </Box>

      <TextField
        fullWidth
        label="Opinión o testimonio"
        value={formData.opinion}
        onChange={(e) => handleInputChange('opinion', e.target.value)}
        onBlur={() => handleBlur('opinion')}
        margin="normal"
        multiline
        rows={4}
        required
        disabled={loading}
        error={!!errors.opinion}
        helperText={
          errors.opinion || 
          `${formData.opinion?.length || 0}/500 caracteres. Mínimo 10 caracteres requeridos.`
        }
        placeholder="Escribe aquí la opinión o testimonio..."
        inputProps={{ maxLength: 500 }}
        sx={{
          '& .MuiInputBase-input': {
            color: theme?.isDark ? darkTheme.color : 'text.primary'
          }
        }}
      />

      <Divider sx={{ my: 3 }} />

      {/* Estado */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.activo}
            onChange={(e) => handleInputChange('activo', e.target.checked)}
            disabled={loading}
            color="primary"
          />
        }
        label="Testimonio activo y visible"
        sx={{ 
          color: theme?.isDark ? darkTheme.color : 'text.primary',
          mt: 2 
        }}
      />

      {/* Información sobre el formulario */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: 2,
          bgcolor: theme?.isDark ? 'rgba(25, 118, 210, 0.1)' : undefined,
          color: theme?.isDark ? darkTheme.color : undefined
        }}
      >
        <Typography variant="body2">
          <strong>Consejos:</strong>
          <br />
          • Una foto profesional mejora la credibilidad del testimonio
          <br />
          • La opinión debe ser auténtica y específica sobre la experiencia
          <br />
          • La calificación debe reflejar la satisfacción real del cliente
        </Typography>
      </Alert>
    </Box>
  );
};

export default TestimonioForm;