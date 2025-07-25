import React, { useState, useEffect, useRef } from 'react';
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
  Rating,
  Grid,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  SwapVert as ReorderIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import Notification from './common/Notification';

const TestimoniosManager = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonio, setEditingTestimonio] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    opinion: '',
    foto: '',
    estrellas: 5,
    institucion: '',
    activo: true
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchTestimonios();
  }, []);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "La imagen no debe superar los 5MB",
          severity: "error"
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: "La imagen no debe superar los 5MB",
          severity: "error"
        });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, foto: '' }));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, foto: '' }));
  };

  // Subir imagen a MinIO
  const handleImageUpload = async (file) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("No hay token de autenticación. Por favor, inicia sesión nuevamente.", "error");
        return null;
      }

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
        throw new Error('Error al subir imagen');
      }

      return uploadData.data.publicUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showNotification("Error al subir la imagen: " + error.message, "error");
      return null;
    }
  };

  const fetchTestimonios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestimonios(data.data || []);
      } else {
        throw new Error('Error al cargar testimonios');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cargar testimonios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nombre || !formData.cargo || !formData.opinion) {
        showNotification("Todos los campos son requeridos", "error");
        return;
      }

      if (!selectedImage && !formData.foto) {
        showNotification("Debes seleccionar una imagen", "error");
        return;
      }

      setUploading(true);

      // Si hay una imagen seleccionada, subirla primero
      let imageUrl = formData.foto;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const url = editingTestimonio 
        ? `${API_URL}/testimonios/${editingTestimonio._id}`
        : `${API_URL}/testimonios`;
      
      const method = editingTestimonio ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          foto: imageUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la operación');
      }

      const data = await response.json();

      // Actualizar estado local
      if (editingTestimonio) {
        setTestimonios(prevTestimonios => 
          prevTestimonios.map(t => 
            t._id === editingTestimonio._id 
              ? { ...t, ...formData, foto: imageUrl }
              : t
          )
        );
      } else {
        setTestimonios(prevTestimonios => [...prevTestimonios, data.data]);
      }

      showNotification(data.message || 'Operación exitosa', 'success');
      handleCloseDialog();
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      return;
    }

    try {
      // Guardar testimonio antes de eliminarlo por si hay error
      const testimonioToDelete = testimonios.find(t => t._id === id);
      
      // Actualizar UI inmediatamente
      setTestimonios(prevTestimonios => 
        prevTestimonios.filter(t => t._id !== id)
      );

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Revertir cambios si hay error
        setTestimonios(prevTestimonios => [...prevTestimonios, testimonioToDelete]);
        throw new Error('Error al eliminar');
      }

      const data = await response.json();
      showNotification(data.message || 'Testimonio eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al eliminar testimonio', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      // Actualizar UI inmediatamente
      setTestimonios(prevTestimonios => 
        prevTestimonios.map(t => 
          t._id === id 
            ? { ...t, activo: !t.activo }
            : t
        )
      );

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Revertir cambios si hay error
        setTestimonios(prevTestimonios => 
          prevTestimonios.map(t => 
            t._id === id 
              ? { ...t, activo: !t.activo }
              : t
          )
        );
        throw new Error('Error al cambiar estado');
      }

      const data = await response.json();
      showNotification(data.message || 'Estado actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al cambiar estado', 'error');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = testimonios.findIndex(t => t._id === id);
    if (currentIndex === -1) return;

    const newTestimonios = [...testimonios];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newTestimonios.length) return;

    // Intercambiar posiciones
    [newTestimonios[currentIndex], newTestimonios[targetIndex]] = 
    [newTestimonios[targetIndex], newTestimonios[currentIndex]];

    // Actualizar UI inmediatamente
    setTestimonios(newTestimonios);

    // Actualizar orden en la base de datos
    try {
      const token = localStorage.getItem('token');
      const ordenData = newTestimonios.map((testimonio, index) => ({
        id: testimonio._id,
        orden: index
      }));

      const response = await fetch(`${API_URL}/testimonios/order/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ordenData })
      });

      if (!response.ok) {
        // Revertir cambios si hay error
        setTestimonios(testimonios);
        throw new Error('Error al actualizar orden');
      }

      showNotification('Orden actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al actualizar orden', 'error');
    }
  };

  const handleOpenDialog = (testimonio = null) => {
    if (testimonio) {
      setEditingTestimonio(testimonio);
      setFormData({
        nombre: testimonio.nombre,
        cargo: testimonio.cargo,
        opinion: testimonio.opinion,
        foto: testimonio.foto,
        estrellas: testimonio.estrellas,
        institucion: testimonio.institucion || '',
        activo: testimonio.activo
      });
      setImagePreview(testimonio.foto);
    } else {
      setEditingTestimonio(null);
      setFormData({
        nombre: '',
        cargo: '',
        opinion: '',
        foto: '',
        estrellas: 5,
        institucion: '',
        activo: true
      });
      setImagePreview('');
    }
    setSelectedImage(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTestimonio(null);
    setFormData({
      nombre: '',
      cargo: '',
      opinion: '',
      foto: '',
      estrellas: 5,
      institucion: '',
      activo: true
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Gestionar Reseñas
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
            Agregar Reseña
          </Button>
        </Box>
      </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {testimonios.map((testimonio, index) => (
          <Card key={testimonio._id} sx={{ 
            bgcolor: '#2a2a2a', 
            color: 'white',
            position: 'relative'
          }}>
              {/* Botones de acción en la esquina superior derecha */}
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
                  onClick={() => handleToggleStatus(testimonio._id)}
                  sx={{ 
                    backgroundColor: testimonio.activo 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'rgba(255, 152, 0, 0.1)',
                    color: testimonio.activo ? '#4caf50' : '#f44336',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      backgroundColor: testimonio.activo 
                        ? 'rgba(76, 175, 80, 0.2)' 
                        : 'rgba(255, 152, 0, 0.2)',
                    }
                  }}
                  title={testimonio.activo ? "Ocultar testimonio" : "Mostrar testimonio"}
                >
                  {testimonio.activo ? <VisibilityIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(testimonio)}
                  sx={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    color: '#2196f3',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    }
                  }}
                  title="Editar testimonio"
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(testimonio._id)}
                  sx={{ 
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    color: '#f44336',
                    width: 28,
                    height: 28,
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.2)',
                    }
                  }}
                  title="Eliminar testimonio"
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Avatar */}
                  <Avatar 
                    src={testimonio.foto} 
                    alt={testimonio.nombre}
                    sx={{ width: 56, height: 56, flexShrink: 0 }}
                  />
                  
                  {/* Información principal */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {testimonio.nombre}
                      </Typography>
                      <Chip 
                        label={testimonio.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={testimonio.activo ? 'success' : 'default'}
                        sx={{ fontSize: '0.7rem', flexShrink: 0 }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#888',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {testimonio.cargo}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Rating 
                        value={testimonio.estrellas} 
                        readOnly 
                        size="small"
                        sx={{ '& .MuiRating-iconFilled': { color: '#FFD700' } }}
                      />
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Orden: {testimonio.orden}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Información secundaria */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic',
                        lineHeight: 1.5,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis',
                        mb: 1
                      }}
                    >
                      "{testimonio.opinion}"
                    </Typography>
                    
                    {testimonio.institucion && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#888',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {testimonio.institucion}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Controles de reordenamiento */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {reorderMode && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleReorder(testimonio._id, 'up')}
                          disabled={index === 0}
                          sx={{ 
                            color: 'white', 
                            p: 0.5,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleReorder(testimonio._id, 'down')}
                          disabled={index === testimonios.length - 1}
                          sx={{ 
                            color: 'white', 
                            p: 0.5,
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
          {editingTestimonio ? 'Editar Reseña' : 'Agregar Nueva Reseña'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2a2a2a', pt: 2 }}>
          {/* Columna izquierda - Campos de texto */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            {/* Campos superiores */}
            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Columna izquierda con campos cortos */}
              <Box sx={{ flex: '1 1 60%' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      inputProps={{ maxLength: 50 }}
                      helperText={`${formData.nombre.length}/50 caracteres`}
                      error={formData.nombre.length > 50}
                      sx={{
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: '#2a2a2a',
                          padding: '0 8px',
                          transform: 'translate(14px, -9px) scale(0.75)',
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                        },
                        '& .MuiFormHelperText-root': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      inputProps={{ maxLength: 100 }}
                      helperText={`${formData.cargo.length}/100 caracteres`}
                      error={formData.cargo.length > 100}
                      sx={{
                        mt: 1,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: '#2a2a2a',
                          padding: '0 8px',
                          transform: 'translate(14px, -9px) scale(0.75)',
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                        },
                        '& .MuiFormHelperText-root': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Institución (opcional)"
                      value={formData.institucion}
                      onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                      inputProps={{ maxLength: 100 }}
                      helperText={`${formData.institucion.length}/100 caracteres`}
                      error={formData.institucion.length > 100}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.23)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          backgroundColor: '#2a2a2a',
                          padding: '0 8px',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1976d2',
                        },
                        '& .MuiFormHelperText-root': {
                          color: 'rgba(255, 255, 255, 0.5)',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component="legend" sx={{ color: 'white', mb: 1 }}>
                      Calificación (Estrellas)
                    </Typography>
                    <Rating
                      name="estrellas"
                      value={formData.estrellas}
                      onChange={(event, newValue) => {
                        setFormData({ ...formData, estrellas: newValue });
                      }}
                      sx={{
                        '& .MuiRating-iconEmpty': {
                          color: 'rgba(255, 255, 255, 0.3)',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Columna derecha con imagen */}
              <Box sx={{ flex: '1 1 40%' }}>
                <Box
                  sx={{
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
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
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'white',
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <UploadIcon sx={{ fontSize: 40, color: 'white', mb: 1 }} />
                      <Typography sx={{ color: 'white' }}>
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
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  disabled={!!selectedImage}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: '#2a2a2a',
                      padding: '0 8px',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976d2',
                    },
                  }}
                />
              </Box>
            </Box>

              {/* Campo de opinión a todo el ancho */}
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  label="Opinión"
                  multiline
                  rows={8}
                  value={formData.opinion}
                  onChange={(e) => setFormData({ ...formData, opinion: e.target.value })}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.opinion.length}/500 caracteres`}
                  error={formData.opinion.length > 500}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      height: '200px',
                      '& textarea': {
                        height: '100% !important',
                      },
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.23)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: '#2a2a2a',
                      padding: '0 8px',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#1976d2',
                    },
                    '& .MuiFormHelperText-root': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    }
                  }}
                />
              </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2a2a2a', px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} disabled={uploading} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={
              uploading ||
              !formData.nombre ||
              !formData.cargo ||
              !formData.opinion ||
              (!selectedImage && !formData.foto) ||
              formData.nombre.length > 50 ||
              formData.cargo.length > 100 ||
              formData.opinion.length > 500 ||
              formData.institucion.length > 100
            }
            startIcon={uploading && <CircularProgress size={20} />}
          >
            {uploading ? 'Subiendo...' : (editingTestimonio ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default TestimoniosManager; 