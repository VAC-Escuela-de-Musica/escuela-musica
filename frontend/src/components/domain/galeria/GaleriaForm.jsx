import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Typography,
  Card,
  CardMedia,
  LinearProgress,
  Alert,
  Divider,
  Grid,
  Slider
} from '@mui/material';
import { CloudUpload as UploadIcon, Image as ImageIcon } from '@mui/icons-material';
import { useImageUpload } from '../../../hooks/domain/useImageUpload.js';

/**
 * Formulario especializado para galería con upload avanzado
 * Extraído del GaleriaManager original, pero con funcionalidades mejoradas
 */
const GaleriaForm = ({ 
  formData, 
  onInputChange, 
  isEditing, 
  loading 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Hook especializado para upload
  const imageUpload = useImageUpload({
    maxSize: 10 * 1024 * 1024, // 10MB
    compressionQuality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  });

  // Categorías disponibles
  const categorias = [
    { value: 'conciertos', label: 'Conciertos' },
    { value: 'clases', label: 'Clases' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'instrumentos', label: 'Instrumentos' },
    { value: 'profesores', label: 'Profesores' },
    { value: 'instalaciones', label: 'Instalaciones' },
    { value: 'otros', label: 'Otros' }
  ];

  // Tags disponibles
  const availableTags = [
    'destacado', 'nuevo', 'popular', 'promocional',
    'principiante', 'intermedio', 'avanzado',
    'piano', 'guitarra', 'violín', 'batería', 'canto'
  ];

  // Configurar preview inicial
  useEffect(() => {
    if (isEditing && formData.imagen) {
      // En modo edición, mostrar la imagen existente
      imageUpload.generatePreview(new File([], 'existing', { type: 'image/jpeg' }));
    }
  }, [isEditing, formData.imagen]);

  // Sincronizar tags
  useEffect(() => {
    if (formData.tags && Array.isArray(formData.tags)) {
      setSelectedTags(formData.tags);
    }
  }, [formData.tags]);

  // Manejo de cambio de archivo
  const handleFileChange = async (file) => {
    if (!file) return;

    // Generar preview inmediato
    imageUpload.generatePreview(file);
    
    // Validar archivo
    const validation = imageUpload.validateFile(file);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Guardar archivo en el form data
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

  // Manejo de tags
  const handleTagChange = (event) => {
    const value = event.target.value;
    setSelectedTags(typeof value === 'string' ? value.split(',') : value);
    onInputChange('tags', typeof value === 'string' ? value.split(',') : value);
  };

  // Configuración automática de layout
  const getLayoutConfig = (categoria) => {
    const layouts = {
      'conciertos': { cols: 2, rows: 1, description: 'Panorámica ideal para fotos de conciertos' },
      'clases': { cols: 1, rows: 1, description: 'Formato cuadrado para fotos de clases' },
      'eventos': { cols: 2, rows: 2, description: 'Formato grande para eventos importantes' },
      'instrumentos': { cols: 1, rows: 1, description: 'Formato cuadrado para instrumentos' },
      'profesores': { cols: 1, rows: 2, description: 'Formato vertical para retratos' },
      'instalaciones': { cols: 2, rows: 1, description: 'Panorámica para mostrar espacios' },
      'otros': { cols: 1, rows: 1, description: 'Formato estándar' }
    };
    return layouts[categoria] || layouts['otros'];
  };

  const currentLayout = getLayoutConfig(formData.categoria || 'otros');

  return (
    <Box sx={{ minWidth: 500 }}>
      {/* Información básica */}
      <Typography variant="h6" gutterBottom>
        Información de la Imagen
      </Typography>

      <Grid container spacing={3}>
        {/* Columna izquierda - Datos */}
        <Grid item xs={12} md={6}>
          {/* Título */}
          <TextField
            fullWidth
            label="Título"
            value={formData.titulo || ''}
            onChange={(e) => onInputChange('titulo', e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText="Título descriptivo de la imagen"
          />

          {/* Descripción */}
          <TextField
            fullWidth
            label="Descripción"
            value={formData.descripcion || ''}
            onChange={(e) => onInputChange('descripcion', e.target.value)}
            margin="normal"
            multiline
            rows={3}
            disabled={loading}
            helperText="Descripción detallada (opcional)"
          />

          {/* Categoría */}
          <TextField
            fullWidth
            select
            label="Categoría"
            value={formData.categoria || 'otros'}
            onChange={(e) => onInputChange('categoria', e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText={currentLayout.description}
          >
            {categorias.map((categoria) => (
              <MenuItem key={categoria.value} value={categoria.value}>
                {categoria.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Tags */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={selectedTags}
              onChange={handleTagChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              disabled={loading}
            >
              {availableTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Estado activo */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.activo !== undefined ? formData.activo : true}
                onChange={(e) => onInputChange('activo', e.target.checked)}
                disabled={loading}
              />
            }
            label="Imagen activa en galería"
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* Columna derecha - Upload */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Imagen {!isEditing && '*'}
          </Typography>
          
          {/* Área de upload */}
          <Card
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              backgroundColor: dragOver ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              mb: 2,
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('galeria-image-input').click()}
          >
            <Box sx={{ p: 3, textAlign: 'center' }}>
              {imageUpload.preview || (isEditing && formData.imagen) ? (
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
                    image={imageUpload.preview || formData.imagen}
                    alt="Preview"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Haz clic o arrastra para cambiar la imagen
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Arrastra una imagen aquí o haz clic para seleccionar
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Formatos: JPG, PNG, WebP, GIF • Máximo: 10MB
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>

          {/* Progreso de upload */}
          {imageUpload.uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Subiendo imagen... {imageUpload.uploadProgress}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={imageUpload.uploadProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Error de upload */}
          {imageUpload.uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {imageUpload.uploadError}
            </Alert>
          )}

          <input
            id="galeria-image-input"
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
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Configuración de layout */}
      <Typography variant="h6" gutterBottom>
        Configuración de Visualización
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Typography variant="body2" gutterBottom>
            Columnas: {formData.cols || currentLayout.cols}
          </Typography>
          <Slider
            value={formData.cols || currentLayout.cols}
            onChange={(e, value) => onInputChange('cols', value)}
            min={1}
            max={3}
            step={1}
            marks
            disabled={loading}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" gutterBottom>
            Filas: {formData.rows || currentLayout.rows}
          </Typography>
          <Slider
            value={formData.rows || currentLayout.rows}
            onChange={(e, value) => onInputChange('rows', value)}
            min={1}
            max={3}
            step={1}
            marks
            disabled={loading}
          />
        </Grid>
      </Grid>

      {/* Información sobre la configuración */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Layout automático por categoría:</strong> {currentLayout.description}
          <br />
          Puedes ajustar manualmente las columnas y filas si es necesario.
        </Typography>
      </Alert>
    </Box>
  );
};

export default GaleriaForm;