import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

/**
 * Formulario específico para imágenes de carousel
 * Extraído del CarouselManager original, mantiene 100% funcionalidad
 */
const CarouselForm = ({ 
  formData, 
  onInputChange, 
  isEditing, 
  onSubmit, 
  loading 
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Configurar preview de imagen
  useEffect(() => {
    if (isEditing && formData.imagen) {
      setImagePreview(formData.imagen);
    } else if (formData.image) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(formData.image);
    } else {
      setImagePreview(null);
    }
  }, [formData, isEditing]);

  // Manejo de cambio de archivo
  const handleFileChange = (file) => {
    onInputChange('image', file);
  };

  // Manejo de drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  return (
    <Box sx={{ minWidth: 400 }}>
      {/* Campo Título */}
      <TextField
        fullWidth
        label="Título"
        value={formData.titulo || ''}
        onChange={(e) => onInputChange('titulo', e.target.value)}
        margin="normal"
        required
        disabled={loading}
      />

      {/* Campo Descripción */}
      <TextField
        fullWidth
        label="Descripción"
        value={formData.descripcion || ''}
        onChange={(e) => onInputChange('descripcion', e.target.value)}
        margin="normal"
        multiline
        rows={3}
        disabled={loading}
      />

      {/* Campo Visible */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.visible || false}
            onChange={(e) => onInputChange('visible', e.target.checked)}
            disabled={loading}
          />
        }
        label="Visible en carousel"
        sx={{ mt: 2, mb: 2 }}
      />

      {/* Área de subida de imagen */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Imagen {!isEditing && '*'}
        </Typography>
        
        <Card
          sx={{
            border: '2px dashed',
            borderColor: dragOver ? 'primary.main' : 'grey.300',
            backgroundColor: dragOver ? 'action.hover' : 'background.paper',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('carousel-image-input').click()}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            {imagePreview ? (
              <Box>
                <CardMedia
                  component="img"
                  sx={{ 
                    maxHeight: 200, 
                    maxWidth: '100%', 
                    objectFit: 'contain',
                    mb: 2,
                    borderRadius: 1
                  }}
                  image={imagePreview}
                  alt="Preview"
                />
                <Typography variant="body2" color="text.secondary">
                  Haz clic o arrastra para cambiar la imagen
                </Typography>
              </Box>
            ) : (
              <Box>
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Arrastra una imagen aquí o haz clic para seleccionar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Formatos: JPG, PNG, WebP • Máximo: 5MB
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        <input
          id="carousel-image-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          disabled={loading}
        />
      </Box>

      {/* Información adicional */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Recomendaciones:</strong>
          <br />
          • Resolución óptima: 1920x800px
          <br />
          • Formato recomendado: WebP para mejor compresión
          <br />
          • Las imágenes se redimensionarán automáticamente
        </Typography>
      </Alert>
    </Box>
  );
};

export default CarouselForm;