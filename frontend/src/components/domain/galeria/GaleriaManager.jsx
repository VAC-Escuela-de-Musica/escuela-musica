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
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputAdornment,
  Container
} from '@mui/material';
import { useCarouselConfig } from '../../../hooks/useCarouselConfig.js';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  SwapVert as ReorderIcon,
  Search as SearchIcon
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileDescriptions, setFileDescriptions] = useState({});
  const [fileTitles, setFileTitles] = useState({});
  const [editingFile, setEditingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    imageId: null,
    imageTitle: null
  });

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://146.83.198.35:1230';

  const { 
    selectedImages, 
    addImage, 
    removeImage, 
    reorderImages, 
    isImageSelected 
  } = useCarouselConfig();

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

      const response = await fetch(`${API_URL}/api/galeria`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG - Datos completos de la galería:', data);
        console.log('DEBUG - Items individuales de la galería:', data.data);
        if (data.data && data.data.length > 0) {
          console.log('DEBUG - Primer item de la galería:', data.data[0]);
          console.log('DEBUG - URL de imagen del primer item:', data.data[0].imagen);
        }
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
        ? `${API_URL}/api/galeria/${editingImage._id}`
        : `${API_URL}/api/galeria`;
      
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
    // Buscar la imagen para obtener su título
    const image = galeria.find(img => img._id === id);
    
    // Abrir diálogo de confirmación
    setDeleteDialog({
      open: true,
      imageId: id,
      imageTitle: image?.titulo || 'esta imagen'
    });
  };

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    const { imageId } = deleteDialog;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/galeria/${imageId}`, {
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
    } finally {
      // Cerrar diálogo
      setDeleteDialog({ open: false, imageId: null, imageTitle: null });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/galeria/${id}/toggle`, {
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

      const response = await fetch(`${API_URL}/api/galeria/order/update`, {
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
        titulo: imagen.titulo || '',
        descripcion: imagen.descripcion || ''
      });
    } else {
      setEditingImage(null);
      setFormData({
        titulo: '',
        descripcion: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingImage(null);
    setFormData({
      titulo: '',
      descripcion: ''
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMultipleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const validFiles = files.filter(file => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          showSnackbar(`El archivo ${file.name} no es una imagen válida.`, 'error');
          return false;
        }

        // Validar tamaño (máximo 256MB)
        const maxSize = 256 * 1024 * 1024; // 256MB
        if (file.size > maxSize) {
          showSnackbar(`El archivo ${file.name} es demasiado grande. Máximo 256MB.`, 'error');
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      setLoading(true);
      let uploadedCount = 0;

      for (let index = 0; index < validFiles.length; index++) {
        const file = validFiles[index];
        try {
          const token = localStorage.getItem('token');
          
          // Obtener URL pre-firmada para subida
          const uploadResponse = await fetch(`${API_URL}/api/galeria/upload-url`, {
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
          const uploadToMinIO = await fetch(uploadData.data.data.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!uploadToMinIO.ok) {
            throw new Error('Error al subir imagen a MinIO');
          }

          // Crear entrada en la galería automáticamente
          const galeriaResponse = await fetch(`${API_URL}/api/galeria`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              titulo: fileTitles[index] || '', 
              descripcion: fileDescriptions[index] || '', 
              imagen: uploadData.data.data.publicUrl,
              categoria: 'otros',
              tags: [],
              activo: true,
              cols: 1,
              rows: 1
            })
          });

          console.log('DEBUG - Datos enviados al backend:', {
            titulo: fileTitles[index] || '', 
            descripcion: fileDescriptions[index] || '', 
            imagen: uploadData.data.data.publicUrl,
            categoria: 'otros',
            tags: [],
            activo: true,
            cols: 1,
            rows: 1
          });
          console.log('DEBUG - URL enviada al backend:', uploadData.data.data.publicUrl);
          console.log('DEBUG - Respuesta del backend:', galeriaResponse.status, galeriaResponse.statusText);

          if (galeriaResponse.ok) {
            const responseData = await galeriaResponse.json();
            console.log('DEBUG - Datos de respuesta:', responseData);
            uploadedCount++;
          } else {
            console.error(`Error creando entrada para ${file.name}`);
          }

        } catch (error) {
          console.error(`Error subiendo ${file.name}:`, error);
          showSnackbar(`Error al subir ${file.name}: ${error.message}`, 'error');
        }
      }

      if (uploadedCount > 0) {
        showSnackbar(`${uploadedCount} imagen(es) subida(s) exitosamente`, 'success');
        fetchGaleria();
      }
      
    } catch (error) {
      console.error('Error en subida múltiple:', error);
      showSnackbar('Error en la subida múltiple: ' + error.message, 'error');
    } finally {
      setLoading(false);
      setUploading(false);
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (authError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
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
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, textAlign: 'left' }}>
        Gestión de Galería
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Sección izquierda: Galería y Carrusel */}
        <Box sx={{ flex: '1 1 70%' }}>
          {/* Galería de imágenes */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  🖼️ Galería de Imágenes
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Buscar imágenes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200 }}
                  />
                  <Tooltip title="Modo reordenar">
                    <IconButton
                      onClick={() => setReorderMode(!reorderMode)}
                      color={reorderMode ? 'primary' : 'default'}
                    >
                      <ReorderIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <ImageList
                sx={{ 
                  width: '100%', 
                  maxHeight: '70vh',
                  overflowY: 'auto'
                }}
                variant="quilted"
                cols={4}
                rowHeight={160}
              >
                {Array.isArray(galeria) && galeria
                  .filter(imagen => {
                    if (!searchQuery) return true;
                    const searchLower = searchQuery.toLowerCase();
                    return (
                      (imagen.titulo && imagen.titulo.toLowerCase().includes(searchLower)) ||
                      (imagen.descripcion && imagen.descripcion.toLowerCase().includes(searchLower)) ||
                      (imagen.categoria && imagen.categoria.toLowerCase().includes(searchLower))
                    );
                  })
                  .map((imagen, index) => {
                    return (
                      <ImageListItem 
                        key={imagen._id} 
                        cols={imagen.cols || 1} 
                        rows={imagen.rows || 1}
                        sx={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          '& img': {
                            transition: 'transform 0.2s',
                          },
                          '&:hover img': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => handleOpenDialog(imagen)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(imagen._id);
                            }}
                            sx={{ 
                              backgroundColor: imagen.activo 
                                ? 'rgba(76, 175, 80, 0.9)' 
                                : 'rgba(255, 152, 0, 0.9)',
                              color: 'white',
                              width: 28,
                              height: 28
                            }}
                            title={imagen.activo ? "Ocultar imagen" : "Mostrar imagen"}
                          >
                            {imagen.activo ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(imagen);
                            }}
                            sx={{ 
                              backgroundColor: 'rgba(25, 118, 210, 0.9)',
                              color: 'white',
                              width: 28,
                              height: 28
                            }}
                            title="Editar imagen"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(imagen._id);
                            }}
                            sx={{ 
                              backgroundColor: 'rgba(211, 47, 47, 0.9)',
                              color: 'white',
                              width: 28,
                              height: 28
                            }}
                            title="Eliminar imagen"
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCarousel(imagen);
                            }}
                            sx={{ 
                              backgroundColor: isImageSelected(imagen._id) 
                                ? 'rgba(255, 193, 7, 0.9)' 
                                : 'rgba(76, 175, 80, 0.9)',
                              color: 'white',
                              width: 28,
                              height: 28
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
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
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
                    );
                  })}
              </ImageList>
            </CardContent>
          </Card>

          {/* Carrusel */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  🎠 Imágenes del Carrusel
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Imágenes seleccionadas ({selectedImages.length})
                  </Typography>
                  <Tooltip title="Modo reordenar carrusel">
                    <IconButton
                      onClick={() => setCarouselReorderMode(!carouselReorderMode)}
                      color={carouselReorderMode ? 'primary' : 'default'}
                    >
                      <ReorderIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <ImageList
                sx={{ 
                  width: '100%', 
                  maxHeight: '30vh',
                  overflowY: 'auto'
                }}
                variant="quilted"
                cols={4}
                rowHeight={120}
              >
                {selectedImages.map((imagen, index) => (
                  <ImageListItem 
                    key={imagen._id} 
                    sx={{ 
                      position: 'relative',
                      cursor: 'pointer',
                      '& img': {
                        transition: 'transform 0.2s',
                      },
                      '&:hover img': {
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => handleOpenDialog(imagen)}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCarousel(imagen._id);
                        }}
                        sx={{ 
                          backgroundColor: 'rgba(211, 47, 47, 0.9)',
                          color: 'white',
                          width: 28,
                          height: 28
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderCarousel(index, index - 1);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorderCarousel(index, index + 1);
                          }}
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
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }}
                      onError={(e) => {
                        console.error('ERROR - Imagen no se pudo cargar:', imagen.imagen, e);
                      }}
                      onLoad={() => {
                        console.log('SUCCESS - Imagen cargada correctamente:', imagen.imagen);
                      }}
                    />
                    
                    <ImageListItemBar
                      title={imagen.titulo}
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
                  <Typography variant="body1" color="text.secondary">
                    No hay imágenes seleccionadas para el carrusel. Selecciona imágenes de la galería para agregarlas.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Sección derecha: Subida de imágenes */}
        <Box sx={{ flex: '1 1 30%' }}>
          <Card sx={{ position: 'sticky', top: '1rem' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                📤 Subir Nuevas Imágenes
              </Typography>
              
              {/* Área de subida de archivos */}
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                  },
                  mb: 3
                }}
                onClick={() => document.getElementById('file-upload').click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#1976d2';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ccc';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#ccc';
                  const files = Array.from(e.dataTransfer.files);
                  setSelectedFiles(prev => [...prev, ...files]);
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Arrastra archivos aquí
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  o
                </Typography>
                <Button
                  variant="outlined"
                  component="span"
                >
                  Seleccionar archivos
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                  Tamaño máximo: 256 MB
                </Typography>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setSelectedFiles(prev => [...prev, ...files]);
                  }}
                />
              </Box>

              {/* Vista previa de archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Archivos Seleccionados ({selectedFiles.length})
          </Typography>
                  
                  <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                    <Grid container spacing={2}>
                      {selectedFiles.map((file, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
                              <Box sx={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                                <Box
                                  component="img"
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 1
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedFiles(files => files.filter((_, i) => i !== index));
                                  }}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': {
                                      bgcolor: 'rgba(211, 47, 47, 0.8)',
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography noWrap variant="caption" sx={{ flex: 1 }}>
                                    {file.name}
          </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => setEditingFile(editingFile === index ? null : index)}
                                    sx={{ ml: 1 }}
                                  >
                                    <EditIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Box>
                                {editingFile === index && (
                                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      placeholder="Título (opcional)"
                                      value={fileTitles[index] || ''}
                                      onChange={(e) => setFileTitles(prev => ({
                                        ...prev,
                                        [index]: e.target.value
                                      }))}
                                    />
                                    <TextField
                                      fullWidth
                                      size="small"
                                      multiline
                                      maxRows={3}
                                      placeholder="Descripción (opcional)"
                                      value={fileDescriptions[index] || ''}
                                      onChange={(e) => setFileDescriptions(prev => ({
                                        ...prev,
                                        [index]: e.target.value
                                      }))}
                                    />
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => setSelectedFiles([])}
                      disabled={uploading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        handleMultipleFileUpload(selectedFiles)
                          .finally(() => {
                            setSelectedFiles([]);
                          });
                      }}
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={20} /> : null}
                    >
                      {uploading ? 'Subiendo...' : 'Subir Imágenes'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Dialog para editar imagen */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingImage ? 'Editar Imagen' : 'Agregar Nueva Imagen'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 3, pt: 2 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Título (opcional)"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                fullWidth
                label="Descripción (opcional)"
                multiline
                rows={3}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                inputProps={{ maxLength: 500 }}
              />
            </Box>

            {editingImage && (
              <Box sx={{ 
                width: 200,
                height: 200,
                position: 'relative',
                borderRadius: 1,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 1
              }}>
                <img
                  src={editingImage.imagen}
                  alt={editingImage.titulo || ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
        </Box>
      )}
    </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingImage ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            ¿Estás seguro de que quieres eliminar {deleteDialog.imageTitle}? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
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
    </Container>
  );
};

export default GaleriaManager;