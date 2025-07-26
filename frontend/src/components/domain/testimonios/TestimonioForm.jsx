import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Rating,
  Avatar,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';

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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

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
    setImagePreview(data.foto || '');
    setSelectedImage(null);
  }, [data]);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onChange) onChange(newData);
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, foto: 'La imagen no debe superar los 5MB' }));
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: '' }));
      if (onChange) onChange({ ...formData, foto: '' });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, foto: 'La imagen no debe superar los 5MB' }));
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: '' }));
      if (onChange) onChange({ ...formData, foto: '' });
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, foto: '' }));
    if (onChange) onChange({ ...formData, foto: '' });
  };

  // Validación básica
  const validateField = (field, value) => {
    switch (field) {
      case 'nombre':
        if (!value?.trim()) return 'El nombre es requerido';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return null;
      case 'cargo':
        if (!value?.trim()) return 'El cargo es requerido';
        if (value.length > 100) return 'Máximo 100 caracteres';
        return null;
      case 'opinion':
        if (!value?.trim()) return 'La opinión es requerida';
        if (value.length > 500) return 'Máximo 500 caracteres';
        return null;
      case 'institucion':
        if (value && value.length > 100) return 'Máximo 100 caracteres';
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return (
    <Box sx={{ bgcolor: 'white', color: 'black', p: 2, borderRadius: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          width: '100%',
        }}
      >
        {/* Columna izquierda - Campos de texto */}
        <Box sx={{ flex: '1 1 60%' }}>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.nombre}
            onChange={e => handleInputChange('nombre', e.target.value)}
            onBlur={() => handleBlur('nombre')}
            inputProps={{ maxLength: 50 }}
            helperText={`${formData.nombre.length}/50 caracteres`}
            error={!!errors.nombre}
            sx={{ mb: 2,
              '& .MuiOutlinedInput-root': { color: 'black' },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)' },
              '& .MuiFormHelperText-root': { color: 'rgba(0,0,0,0.5)' }
            }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Cargo"
            value={formData.cargo}
            onChange={e => handleInputChange('cargo', e.target.value)}
            onBlur={() => handleBlur('cargo')}
            inputProps={{ maxLength: 100 }}
            helperText={`${formData.cargo.length}/100 caracteres`}
            error={!!errors.cargo}
            sx={{ mb: 2,
              '& .MuiOutlinedInput-root': { color: 'black' },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)' },
              '& .MuiFormHelperText-root': { color: 'rgba(0,0,0,0.5)' }
            }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Institución (opcional)"
            value={formData.institucion}
            onChange={e => handleInputChange('institucion', e.target.value)}
            onBlur={() => handleBlur('institucion')}
            inputProps={{ maxLength: 100 }}
            helperText={`${formData.institucion.length}/100 caracteres`}
            error={!!errors.institucion}
            sx={{ mb: 2,
              '& .MuiOutlinedInput-root': { color: 'black' },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)' },
              '& .MuiFormHelperText-root': { color: 'rgba(0,0,0,0.5)' }
            }}
            disabled={loading}
          />
          <Typography component="legend" sx={{ color: 'black', mb: 1 }}>
            Calificación (Estrellas)
          </Typography>
          <Rating
            name="estrellas"
            value={formData.estrellas}
            onChange={(event, newValue) => handleInputChange('estrellas', newValue)}
            sx={{ mb: 2, '& .MuiRating-iconEmpty': { color: 'rgba(0,0,0,0.3)' } }}
            disabled={loading}
          />
        </Box>
        {/* Columna derecha - Imagen */}
        <Box sx={{ flex: '1 1 40%' }}>
          <Box
            sx={{
              border: '2px dashed rgba(0,0,0,0.3)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 2,
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
                <IconButton
                  onClick={e => { e.stopPropagation(); handleRemoveImage(); }}
                  sx={{ position: 'absolute', top: 8, right: 8, color: 'black', backgroundColor: 'rgba(255,255,255,0.8)', '&:hover': { backgroundColor: 'rgba(255,255,255,1)' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              <>
                <UploadIcon sx={{ fontSize: 40, color: 'black', mb: 1 }} />
                <Typography sx={{ color: 'black' }}>
                  Arrastra una imagen o haz clic para seleccionar
                </Typography>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>
          <TextField
            fullWidth
            label="URL de la imagen"
            value={formData.foto}
            onChange={e => handleInputChange('foto', e.target.value)}
            disabled={!!selectedImage || loading}
            sx={{
              '& .MuiOutlinedInput-root': { color: 'black' },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)' }
            }}
          />
          {errors.foto && <Alert severity="error" sx={{ mt: 1 }}>{errors.foto}</Alert>}
        </Box>
      </Box>
      {/* Campo de opinión a todo el ancho */}
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Opinión"
          multiline
          rows={6}
          value={formData.opinion}
          onChange={e => handleInputChange('opinion', e.target.value)}
          onBlur={() => handleBlur('opinion')}
          inputProps={{ maxLength: 500 }}
          helperText={`${formData.opinion.length}/500 caracteres`}
          error={!!errors.opinion}
          sx={{
            '& .MuiOutlinedInput-root': { color: 'black' },
            '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.7)' },
            '& .MuiFormHelperText-root': { color: 'rgba(0,0,0,0.5)' }
          }}
          disabled={loading}
        />
        <FormControlLabel
          control={
            <Switch
              checked={formData.activo}
              onChange={e => handleInputChange('activo', e.target.checked)}
              color="primary"
              disabled={loading}
            />
          }
          label="Testimonio activo y visible"
          sx={{ color: 'black', mt: 2 }}
        />
      </Box>
    </Box>
  );
};

export default TestimonioForm;