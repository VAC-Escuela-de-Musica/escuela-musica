import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Fab,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import { useCarouselConfig } from '../hooks/useCarouselConfig.js';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  SwapVert as ReorderIcon
} from '@mui/icons-material';

const GaleriaManager = () => {
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [carouselReorderMode, setCarouselReorderMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen: '',
    categoria: 'otros',
    tags: [],
    activo: true,
    cols: 1,
    rows: 1
  });

  const API_URL = import.meta.env.VITE_API_URL;

  // Hook para la configuración del carrusel
  const { 
    selectedImages, 
    addImage, 
    removeImage, 
    reorderImages, 
    isImageSelected 
  } = useCarouselConfig();

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('No hay sesión activa. Por favor inicia sesión.', 'error');
      return;
    }
    
    fetchGaleria();
  }, []);

  const fetchGaleria = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No hay token de autenticación');
        setGaleria([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/galeria`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos de la galería:', data.data);
        setGaleria(data.data || []);
      } else if (response.status === 403) {
        console.warn('Acceso denegado a la galería - solo administradores y asistentes');
        showSnackbar('Solo administradores y asistentes pueden acceder a este módulo (acceso completo).', 'warning');
        setAuthError(true);
        setGaleria([]);
      } else if (response.status === 401) {
        console.warn('Token inválido o expirado');
        showSnackbar('Sesión expirada. Por favor inicia sesión nuevamente.', 'error');
        setAuthError(true);
        setGaleria([]);
      } else {
        console.warn('Error al cargar galería:', response.status);
        showSnackbar('Error al cargar la galería', 'error');
        setGaleria([]);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setGaleria([]);
    } finally {
      setLoading(false);
    }
  };




  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingImage 
        ? `${API_URL}/galeria/${editingImage._id}`
        : `${API_URL}/galeria`;
      
      const method = editingImage ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Operación exitosa', 'success');
        handleCloseDialog();
        fetchGaleria();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error en la operación', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/galeria/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Imagen eliminada exitosamente', 'success');
        fetchGaleria();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al eliminar imagen', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/galeria/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Estado actualizado exitosamente', 'success');
        fetchGaleria();
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al cambiar estado', 'error');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = galeria.findIndex(g => g._id === id);
    if (currentIndex === -1) return;

    const newGaleria = [...galeria];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newGaleria.length) return;

    // Intercambiar posiciones
    [newGaleria[currentIndex], newGaleria[targetIndex]] = 
    [newGaleria[targetIndex], newGaleria[currentIndex]];

    // Actualizar orden en la base de datos
    try {
      const token = localStorage.getItem('token');
      const ordenData = newGaleria.map((imagen, index) => ({
        id: imagen._id,
        orden: index
      }));

      const response = await fetch(`${API_URL}/galeria/order/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ordenData })
      });

      if (response.ok) {
        setGaleria(newGaleria);
        showSnackbar('Orden actualizado exitosamente', 'success');
      } else {
        throw new Error('Error al actualizar orden');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al actualizar orden', 'error');
    }
  };

  const handleOpenDialog = (imagen = null) => {
    if (imagen) {
      setEditingImage(imagen);
      setFormData({
        titulo: imagen.titulo,
        descripcion: imagen.descripcion,
        imagen: imagen.imagen,
        categoria: imagen.categoria,
        tags: imagen.tags || [],
        activo: imagen.activo,
        cols: imagen.cols || 1,
        rows: imagen.rows || 1
      });
    } else {
      setEditingImage(null);
      setFormData({
        titulo: '',
        descripcion: '',
        imagen: '',
        categoria: 'otros',
        tags: [],
        activo: true,
        cols: 1,
        rows: 1
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingImage(null);
    setFormData({
      titulo: '',
      descripcion: '',
      imagen: '',
      categoria: 'otros',
      tags: [],
      activo: true,
      cols: 1,
      rows: 1
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };



  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showSnackbar('Solo se permiten archivos de imagen', 'error');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('El archivo es demasiado grande. Máximo 5MB', 'error');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Obtener URL pre-firmada para subida
      const uploadResponse = await fetch(`${API_URL}/presigned/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentType: file.type
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al obtener URL de subida');
      }

      const uploadData = await uploadResponse.json();
      
      // Subir archivo directamente a MinIO usando la URL pre-firmada
      const uploadToMinIO = await fetch(uploadData.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadToMinIO.ok) {
        throw new Error('Error al subir imagen a MinIO');
      }

      // Actualizar formulario con la URL pública
      setFormData({ ...formData, imagen: uploadData.data.publicUrl });
      showSnackbar('Imagen subida exitosamente', 'success');

    } catch (error) {
      console.error('Error al subir imagen:', error);
      showSnackbar('Error al subir imagen', 'error');
    }
  };

  // Funciones para manejar el carrusel
  const handleAddToCarousel = (imagen) => {
    if (isImageSelected(imagen._id)) {
      showSnackbar('Esta imagen ya está en el carrusel', 'warning');
    } else {
      console.log('Agregando imagen al carrusel:', imagen);
      addImage(imagen);
      showSnackbar('Imagen agregada al carrusel exitosamente', 'success');
    }
  };

  const handleRemoveFromCarousel = (imageId) => {
    removeImage(imageId);
    showSnackbar('Imagen removida del carrusel exitosamente', 'success');
  };

  const handleReorderCarousel = (fromIndex, toIndex) => {
    reorderImages(fromIndex, toIndex);
    showSnackbar('Orden del carrusel actualizado exitosamente', 'success');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (authError) {
    return (
      <Box sx={{ p: 3, bgcolor: '#1a1a1a', minHeight: '100vh', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Error de Autenticación
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Solo los administradores y asistentes pueden acceder a este módulo (acceso completo).
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/login'}
            sx={{ mt: 1 }}
          >
            Ir al Login
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        Gestión de Imágenes
      </Typography>

      {/* Sección 1: Imágenes del Carrusel */}
      <Card sx={{ mb: 4, bgcolor: '#2a2a2a', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              🎠 Imágenes del Carrusel
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                Imágenes seleccionadas de la galería para mostrar en el carrusel ({selectedImages.length} seleccionadas)
              </Typography>
              <Tooltip title="Modo reordenar carrusel">
                <IconButton
                  onClick={() => setCarouselReorderMode(!carouselReorderMode)}
                  sx={{ 
                    bgcolor: carouselReorderMode ? 'primary.main' : 'transparent',
                    color: carouselReorderMode ? 'white' : 'white',
                    '&:hover': { bgcolor: carouselReorderMode ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <ReorderIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <ImageList
            sx={{ 
              width: '100%', 
              height: 'auto',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              p: 2
            }}
            variant="quilted"
            cols={4}
            rowHeight={120}
          >
            {selectedImages.map((imagen, index) => (
              <ImageListItem 
                key={imagen._id} 
                sx={{ position: 'relative' }}
              >
                {/* Botones de acción para carrusel */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  zIndex: 10,
                  display: 'flex',
                  gap: 0.5
                }}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFromCarousel(imagen._id)}
                    sx={{ 
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      color: '#f44336',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.2)',
                      }
                    }}
                    title="Remover del carrusel"
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* Controles de reordenamiento para carrusel */}
                {carouselReorderMode && (
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    top: 8, 
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => handleReorderCarousel(index, index - 1)}
                      disabled={index === 0}
                      sx={{ 
                        color: 'white', 
                        p: 0.5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleReorderCarousel(index, index + 1)}
                      disabled={index === selectedImages.length - 1}
                      sx={{ 
                        color: 'white', 
                        p: 0.5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <img
                  src={imagen.imagen}
                  alt={imagen.titulo}
                  loading="lazy"
                  style={{ 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }}
                />
                
                <ImageListItemBar
                  title={imagen.titulo}
                  subtitle={`Orden: ${index + 1}`}
                  sx={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
          
          {selectedImages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#888' }}>
                No hay imágenes seleccionadas para el carrusel. Selecciona imágenes de la galería para agregarlas.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Divider */}
      <Box sx={{ 
        height: 2, 
        bgcolor: '#444', 
        mb: 4, 
        borderRadius: 1,
        mx: 'auto',
        width: '80%'
      }} />

      {/* Sección 2: Gestión de Galería */}
      <Card sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
              🖼️ Galería de Imágenes
            </Typography>
            <Box>
              <Tooltip title="Modo reordenar">
                <IconButton
                  onClick={() => setReorderMode(!reorderMode)}
                  sx={{ 
                    mr: 2, 
                    bgcolor: reorderMode ? 'primary.main' : 'transparent',
                    color: reorderMode ? 'white' : 'white',
                    '&:hover': { bgcolor: reorderMode ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <ReorderIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
              >
                Agregar Imagen
              </Button>
            </Box>
          </Box>

          <ImageList
            sx={{ 
              width: '100%', 
              height: 'auto',
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 2,
              p: 2
            }}
            variant="quilted"
            cols={4}
            rowHeight={160}
          >
            {Array.isArray(galeria) && galeria.map((imagen, index) => (
              <ImageListItem 
                key={imagen._id} 
                cols={imagen.cols || 1} 
                rows={imagen.rows || 1}
                sx={{ position: 'relative' }}
              >
                {/* Botones de acción */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  zIndex: 10,
                  display: 'flex',
                  gap: 0.5
                }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(imagen._id)}
                    sx={{ 
                      backgroundColor: imagen.activo 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : 'rgba(255, 152, 0, 0.1)',
                      color: imagen.activo ? '#4caf50' : '#f44336',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: imagen.activo 
                          ? 'rgba(76, 175, 80, 0.2)' 
                          : 'rgba(255, 152, 0, 0.2)',
                      }
                    }}
                    title={imagen.activo ? "Ocultar imagen" : "Mostrar imagen"}
                  >
                    {imagen.activo ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(imagen)}
                    sx={{ 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      color: '#2196f3',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.2)',
                      }
                    }}
                    title="Editar imagen"
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(imagen._id)}
                    sx={{ 
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      color: '#f44336',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.2)',
                      }
                    }}
                    title="Eliminar imagen"
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleAddToCarousel(imagen)}
                    sx={{ 
                      backgroundColor: isImageSelected(imagen._id) 
                        ? 'rgba(255, 193, 7, 0.1)' 
                        : 'rgba(76, 175, 80, 0.1)',
                      color: isImageSelected(imagen._id) 
                        ? '#ffc107' 
                        : '#4caf50',
                      width: 28,
                      height: 28,
                      '&:hover': {
                        backgroundColor: isImageSelected(imagen._id) 
                          ? 'rgba(255, 193, 7, 0.2)' 
                          : 'rgba(76, 175, 80, 0.2)',
                      }
                    }}
                    title={isImageSelected(imagen._id) 
                      ? "Ya está en el carrusel" 
                      : "Agregar al carrusel"
                    }
                  >
                    {isImageSelected(imagen._id) ? (
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <AddIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>

                </Box>

                <img
                  src={imagen.imagen}
                  alt={imagen.titulo}
                  loading="lazy"
                  style={{ 
                    borderRadius: 8,
                    objectFit: 'cover'
                  }}
                />
                
                <ImageListItemBar
                  title={imagen.titulo}
                  subtitle={
                    <Box>
                      <Chip 
                        label={imagen.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={imagen.activo ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem', mb: 0.5 }}
                      />
                      <Typography variant="caption" sx={{ color: '#ccc', display: 'block' }}>
                        Orden: {imagen.orden}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                />

                {/* Controles de reordenamiento */}
                {reorderMode && (
                  <Box sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    top: 8, 
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5
                  }}>
                    <IconButton
                      size="small"
                      onClick={() => handleReorder(imagen._id, 'up')}
                      disabled={index === 0}
                      sx={{ 
                        color: 'white', 
                        p: 0.5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleReorder(imagen._id, 'down')}
                      disabled={index === galeria.length - 1}
                      sx={{ 
                        color: 'white', 
                        p: 0.5,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </ImageListItem>
            ))}
          </ImageList>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
          {editingImage ? 'Editar Imagen' : 'Agregar Nueva Imagen'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2a2a2a', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AddIcon />}
                    sx={{ mb: 2 }}
                  >
                    Seleccionar Imagen
                  </Button>
                </label>
                {formData.imagen && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={formData.imagen} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'white' }}>Categoría</InputLabel>
                <Select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="eventos">Eventos</MenuItem>
                  <MenuItem value="instalaciones">Instalaciones</MenuItem>
                  <MenuItem value="actividades">Actividades</MenuItem>
                  <MenuItem value="profesores">Profesores</MenuItem>
                  <MenuItem value="estudiantes">Estudiantes</MenuItem>
                  <MenuItem value="otros">Otros</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags (separados por comas)"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Columnas"
                value={formData.cols}
                onChange={(e) => setFormData({ ...formData, cols: parseInt(e.target.value) || 1 })}
                sx={{ mb: 2 }}
                inputProps={{ min: 1, max: 4 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Filas"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                sx={{ mb: 2 }}
                inputProps={{ min: 1, max: 4 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    color="primary"
                  />
                }
                label="Activo"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2a2a2a' }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.titulo || !formData.imagen}
          >
            {editingImage ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GaleriaManager; 