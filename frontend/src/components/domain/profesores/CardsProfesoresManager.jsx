import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,

  CircularProgress,
  Fab,
  Chip,
} from "@mui/material";
import { API_HEADERS } from '../../../config/api.js';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Visibility as PreviewIcon,
  DragIndicator as DragIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

import Notification from '../../common/Notification';

// URL del backend usando la configuración de Vite
const API_URL = `${import.meta.env.VITE_API_URL || "http://146.83.198.35:1230"}/api/cards-profesores`;

const CardsProfesoresManager = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Estado para diálogo de confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    cardId: null,
    cardName: null
  });

  // Estado para diálogo de confirmación de cambio de visibilidad
  const [toggleDialog, setToggleDialog] = useState({
    open: false,
    card: null,
    action: null
  });

  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    descripcion: "",
    imagen: "",
  });

  // Cargar tarjetas
  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Error al cargar las tarjetas");
      }
      const data = await response.json();
      // Ordenar las tarjetas por el campo 'orden' para mantener consistencia
      const sortedCards = (data.data || []).sort((a, b) => a.orden - b.orden);
      setCards(sortedCards);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleImageUpload = async (file) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("No hay token de autenticación. Por favor, inicia sesión nuevamente.", "error");
        return null;
      }

      const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://146.83.198.35:1230'}/api/galeria/upload-url`, {
        method: 'POST',
        headers: {
          ...API_HEADERS.withAuth(),
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          contentType: file.type,
          bucketType: 'galery'
        })
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        
        if (uploadResponse.status === 401) {
          throw new Error('No tienes permisos para subir imágenes. Verifica tu sesión.');
        } else if (uploadResponse.status === 403) {
          throw new Error('Solo administradores y asistentes pueden subir imágenes.');
        } else if (uploadResponse.status === 500) {
          throw new Error('Error del servidor. Verifica que MinIO esté funcionando.');
        } else {
          throw new Error(`Error al obtener URL de subida: ${uploadResponse.status} - ${errorText}`);
        }
      }

      const uploadData = await uploadResponse.json();
      
      const uploadUrl = uploadData.data?.data?.uploadUrl || uploadData.data?.uploadUrl;
      const publicUrl = uploadData.data?.data?.publicUrl || uploadData.data?.publicUrl;
      
      if (!uploadUrl) {
        throw new Error('No se pudo obtener la URL de subida del servidor');
      }

      const uploadToMinIO = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadToMinIO.ok) {
        const errorText = await uploadToMinIO.text().catch(() => 'Sin respuesta');
        throw new Error(`Error al subir imagen a MinIO: ${uploadToMinIO.status} - ${uploadToMinIO.statusText}`);
      }

      showNotification("Imagen subida exitosamente", "success");
      return publicUrl;
      
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showNotification("Error al subir la imagen: " + error.message, "error");
      return null;
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Abrir diálogo para crear/editar
  const handleOpenDialog = (card = null) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        nombre: card.nombre,
        especialidad: card.especialidad,
        descripcion: card.descripcion,
        imagen: card.imagen,
      });
      setSelectedImage(null); // Limpiar imagen seleccionada al editar
      setImagePreview('');
    } else {
      setEditingCard(null);
      setFormData({
        nombre: "",
        especialidad: "",
        descripcion: "",
        imagen: "",
      });
      setSelectedImage(null); // Limpiar imagen seleccionada al crear
      setImagePreview('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCard(null);
    setFormData({
      nombre: "",
      especialidad: "",
      descripcion: "",
      imagen: "",
    });
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleCreate = async () => {
    try {
      if (!formData.nombre || !formData.especialidad || !formData.descripcion) {
        showNotification("Todos los campos son requeridos", "error");
        return;
      }

      if (!selectedImage && !formData.imagen) {
        showNotification("Debes seleccionar una imagen", "error");
        return;
      }

      setUploading(true);

      let imageUrl = formData.imagen;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      const dataToSend = {
        ...formData,
        imagen: imageUrl
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          ...API_HEADERS.withAuth(),
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      showNotification("Tarjeta creada exitosamente", "success");
      handleCloseDialog();
      fetchCards();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      // Validar que todos los campos estén llenos
      if (!formData.nombre || !formData.especialidad || !formData.descripcion) {
        showNotification("Todos los campos son requeridos", "error");
        return;
      }

      if (!selectedImage && !formData.imagen) {
        showNotification("Debes seleccionar una imagen", "error");
        return;
      }

      setUploading(true);

      // Si hay una imagen seleccionada, subirla primero
      let imageUrl = formData.imagen;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      const dataToSend = {
        ...formData,
        imagen: imageUrl
      };

      const response = await fetch(`${API_URL}/${editingCard._id}`, {
        method: "PUT",
        headers: {
          ...API_HEADERS.withAuth(),
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      showNotification("Tarjeta actualizada exitosamente", "success");
      handleCloseDialog();
      fetchCards();
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  // Eliminar tarjeta
  const handleDelete = async (id) => {
    // Buscar la tarjeta para obtener su nombre
    const card = cards.find(c => c._id === id);
    
    // Abrir diálogo de confirmación
    setDeleteDialog({
      open: true,
      cardId: id,
      cardName: card?.nombre || 'esta tarjeta'
    });
  };

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    const { cardId } = deleteDialog;

    try {
      const response = await fetch(`${API_URL}/${cardId}`, {
        method: "DELETE",
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la tarjeta");
      }

      fetchCards();
      showNotification("Tarjeta eliminada exitosamente", "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      // Cerrar diálogo
      setDeleteDialog({ open: false, cardId: null, cardName: null });
    }
  };

  // Cambiar visibilidad de la tarjeta
  const handleToggleVisibility = async (card) => {
    const action = card.activo ? "ocultar" : "mostrar";
    
    // Abrir diálogo de confirmación
    setToggleDialog({
      open: true,
      card: card,
      action: action
    });
  };

  // Función para confirmar el cambio de visibilidad
  const confirmToggleVisibility = async () => {
    const { card, action } = toggleDialog;

    try {
      const response = await fetch(`${API_URL}/${card._id}`, {
        method: "PUT",
        headers: {
          ...API_HEADERS.withAuth(),
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          ...card,
          activo: !card.activo
        }),
      });

      if (!response.ok) {
        throw new Error("Error al cambiar visibilidad");
      }

      fetchCards();
      showNotification(`Tarjeta ${action === "ocultar" ? "ocultada" : "mostrada"} exitosamente`, "success");
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      // Cerrar diálogo
      setToggleDialog({ open: false, card: null, action: null });
    }
  };

  // Navegar a la sección de profesores en la homepage
  const handlePreviewHomepage = () => {
    // Navegar a la homepage y hacer scroll a la sección de profesores
    window.location.href = "/#profesores";
  };

  // Cambiar modo de ordenamiento
  const handleToggleReordering = () => {
    setIsReordering(!isReordering);
  };

  // Mover tarjeta hacia arriba
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newCards = [...cards];
    [newCards[index], newCards[index - 1]] = [newCards[index - 1], newCards[index]];
    // Actualizar el campo orden para reflejar la nueva posición
    newCards.forEach((card, idx) => {
      card.orden = idx;
    });
    setCards(newCards);
  };

  // Mover tarjeta hacia abajo
  const handleMoveDown = (index) => {
    if (index === cards.length - 1) return;
    const newCards = [...cards];
    [newCards[index], newCards[index + 1]] = [newCards[index + 1], newCards[index]];
    // Actualizar el campo orden para reflejar la nueva posición
    newCards.forEach((card, idx) => {
      card.orden = idx;
    });
    setCards(newCards);
  };

  // Guardar el nuevo orden
  const handleSaveOrder = async () => {
    try {
      // Crear array con el orden actual de las tarjetas
      const cardsOrder = cards.map(card => card._id);
      
      const requestBody = { cardsOrder };
      
      const response = await fetch(`${API_URL}/order`, {
        method: "PUT",
        headers: {
          ...API_HEADERS.withAuth(),
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Actualizar el orden en el estado local inmediatamente
      const updatedCards = cards.map((card, index) => ({
        ...card,
        orden: index
      }));
      setCards(updatedCards);
      
      setIsReordering(false);
      
      // Mostrar mensaje de éxito
      showNotification("Orden guardado exitosamente", "success");
    } catch (error) {
      showNotification(error.message || "Error al guardar el orden", "error");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Tarjetas de Profesores
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={handlePreviewHomepage}
            sx={{ 
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            Ver en Homepage
          </Button>
          <Button
            variant={isReordering ? "contained" : "outlined"}
            startIcon={<DragIcon />}
            onClick={isReordering ? handleSaveOrder : handleToggleReordering}
            color={isReordering ? "success" : "primary"}
            sx={{ 
              borderColor: isReordering ? '#2e7d32' : '#1976d2',
              color: isReordering ? '#fff' : '#1976d2',
              '&:hover': {
                borderColor: isReordering ? '#1b5e20' : '#1565c0',
                backgroundColor: isReordering ? 'rgba(46, 125, 50, 0.1)' : 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            {isReordering ? "Guardar Orden" : "Ordenar"}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nueva Tarjeta
          </Button>
        </Box>
      </Box>



      {cards.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No hay tarjetas de profesores disponibles.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} maxWidth="lg" sx={{ mx: 'auto' }}>
          {cards.map((card, index) => (
            <Grid key={card._id}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  height: { xs: 'auto', md: 280 },
                  borderRadius: 5,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: 210 },
                    height: { xs: 140, md: '100%' },
                    objectFit: 'cover'
                  }}
                  image={card.imagen}
                  alt={card.nombre}
                />
                <CardContent sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  p: 2
                }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={card.activo ? "Visible" : "Oculta"}
                          color={card.activo ? "success" : "warning"}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                        {isReordering && (
                          <Chip
                            label={`#${card.orden + 1}`}
                            color="primary"
                            size="small"
                            variant="filled"
                            sx={{ 
                              fontSize: '0.7rem',
                              height: 20,
                              minWidth: 30
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {isReordering && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              color="primary"
                              sx={{ 
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                },
                                width: 24,
                                height: 24
                              }}
                              title="Mover arriba"
                            >
                              <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>↑</Typography>
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === cards.length - 1}
                              color="primary"
                              sx={{ 
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                },
                                width: 24,
                                height: 24
                              }}
                              title="Mover abajo"
                            >
                              <Typography sx={{ fontSize: 12, fontWeight: 'bold' }}>↓</Typography>
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(card)}
                          color="primary"
                          sx={{ 
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.2)',
                            },
                            width: 28,
                            height: 28
                          }}
                          title="Editar tarjeta"
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleVisibility(card)}
                          color={card.activo ? "success" : "warning"}
                          sx={{ 
                            backgroundColor: card.activo 
                              ? 'rgba(76, 175, 80, 0.1)' 
                              : 'rgba(255, 152, 0, 0.1)',
                            '&:hover': {
                              backgroundColor: card.activo 
                                ? 'rgba(76, 175, 80, 0.2)' 
                                : 'rgba(255, 152, 0, 0.2)',
                            },
                            width: 28,
                            height: 28
                          }}
                          title={card.activo ? "Ocultar tarjeta" : "Mostrar tarjeta"}
                        >
                          {card.activo ? <ViewIcon sx={{ fontSize: 16 }} /> : <VisibilityOffIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(card._id)}
                          color="error"
                          sx={{ 
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.2)',
                            },
                            width: 28,
                            height: 28
                          }}
                          title="Eliminar tarjeta"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#232b3b',
                        mb: 0.5
                      }}
                    >
                      {card.nombre}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      component="p"
                      sx={{ 
                        color: '#666',
                        mb: 1,
                        fontStyle: 'italic'
                      }}
                    >
                      {card.especialidad}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#555',
                        lineHeight: 1.4
                      }}
                    >
                      {card.descripcion}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCard ? "Editar Tarjeta de Profesor" : "Nueva Tarjeta de Profesor"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nombre *"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              margin="normal"
              error={formData.nombre.length > 0 && (formData.nombre.length > 25 || formData.nombre.length < 2)}
              helperText={
                formData.nombre.length === 0 
                  ? "Ingresa el nombre del profesor"
                  : formData.nombre.length > 25 
                  ? `Nombre demasiado largo (${formData.nombre.length}/25)` 
                  : formData.nombre.length < 2
                  ? `Mínimo 2 caracteres (${formData.nombre.length}/25)`
                  : `${formData.nombre.length}/25 caracteres`
              }
            />
            <TextField
              fullWidth
              label="Especialidad *"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleInputChange}
              margin="normal"
              error={formData.especialidad.length > 0 && (formData.especialidad.length > 50 || formData.especialidad.length < 2)}
              helperText={
                formData.especialidad.length === 0
                  ? "Ingresa la especialidad del profesor"
                  : formData.especialidad.length > 50 
                  ? `Especialidad demasiado larga (${formData.especialidad.length}/50)` 
                  : formData.especialidad.length < 2
                  ? `Mínimo 2 caracteres (${formData.especialidad.length}/50)`
                  : `${formData.especialidad.length}/50 caracteres`
              }
            />
            <TextField
              fullWidth
              label="Descripción *"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              error={formData.descripcion.length > 0 && (formData.descripcion.length > 500 || formData.descripcion.length < 10)}
              helperText={
                formData.descripcion.length === 0
                  ? "Describe al profesor (mínimo 10 caracteres)"
                  : formData.descripcion.length > 500 
                  ? `Descripción demasiado larga (${formData.descripcion.length}/500)` 
                  : formData.descripcion.length < 10
                  ? `Mínimo 10 caracteres (${formData.descripcion.length}/500)`
                  : `${formData.descripcion.length}/500 caracteres`
              }
            />
            
            {/* Sección de imagen */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Imagen del Profesor *
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #666',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#1976d2',
                    bgcolor: 'rgba(25, 118, 210, 0.04)',
                  },
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        showNotification("La imagen no debe superar los 5MB", "error");
                        return;
                      }
                      setSelectedImage(file);
                      setImagePreview(URL.createObjectURL(file));
                      setFormData(prev => ({ ...prev, imagen: '' }));
                    }
                  }}
                />
                
                {(imagePreview || formData.imagen) ? (
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, mx: 'auto' }}>
                    <img
                      src={imagePreview || formData.imagen}
                      alt="Vista previa"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 4
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        setImagePreview('');
                        setFormData(prev => ({ ...prev, imagen: '' }));
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
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
                ) : (
                  <>
                    <UploadIcon sx={{ fontSize: 48, color: '#666' }} />
                    <Typography>
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Tamaño máximo: 5MB
                    </Typography>
                  </>
                )}
              </Box>
              
              {/* Campo opcional para URL de imagen */}
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                O ingresa la URL de una imagen:
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="https://ejemplo.com/imagen.jpg"
                name="imagen"
                value={formData.imagen}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, imagen: e.target.value }));
                  setSelectedImage(null);
                  setImagePreview('');
                }}
                disabled={!!selectedImage}
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          {/* Mensaje de ayuda si el botón está deshabilitado */}
          {(uploading ||
            (formData.nombre.length > 0 && formData.nombre.length < 2) ||
            (formData.especialidad.length > 0 && formData.especialidad.length < 2) ||
            (formData.descripcion.length > 0 && formData.descripcion.length < 10) ||
            formData.nombre.length > 25 ||
            formData.especialidad.length > 50 ||
            formData.descripcion.length > 500) && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                {uploading ? '⏳ Subiendo imagen...' :
                 formData.nombre.length > 0 && formData.nombre.length < 2 ? '❌ El nombre debe tener al menos 2 caracteres' :
                 formData.especialidad.length > 0 && formData.especialidad.length < 2 ? '❌ La especialidad debe tener al menos 2 caracteres' :
                 formData.descripcion.length > 0 && formData.descripcion.length < 10 ? '❌ La descripción debe tener al menos 10 caracteres' :
                 formData.nombre.length > 25 ? '❌ El nombre no puede superar 25 caracteres' :
                 formData.especialidad.length > 50 ? '❌ La especialidad no puede superar 50 caracteres' :
                 formData.descripcion.length > 500 ? '❌ La descripción no puede superar 500 caracteres' :
                 '❌ Hay errores en el formulario'}
              </Typography>
            </Box>
          )}
          
          <Button onClick={handleCloseDialog} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={editingCard ? handleUpdate : handleCreate}
            variant="contained"
            disabled={
              uploading ||
              formData.nombre.length > 25 ||
              formData.especialidad.length > 50 ||
              formData.descripcion.length > 500 ||
              formData.nombre.length < 2 ||
              formData.especialidad.length < 2 ||
              formData.descripcion.length < 10 ||
              (!selectedImage && !formData.imagen)
            }
            startIcon={uploading && <CircularProgress size={20} />}
          >
            {uploading ? 'Subiendo...' : (editingCard ? "Actualizar" : "Crear")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            ¿Estás seguro de que quieres eliminar la tarjeta de {deleteDialog.cardName}? 
            Esta acción no se puede deshacer.
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

      {/* Diálogo de confirmación de cambio de visibilidad */}
      <Dialog
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ ...toggleDialog, open: false })}
        aria-labelledby="toggle-dialog-title"
        aria-describedby="toggle-dialog-description"
      >
        <DialogTitle id="toggle-dialog-title">Confirmar Cambio</DialogTitle>
        <DialogContent>
          <Typography id="toggle-dialog-description">
            ¿Estás seguro de que quieres {toggleDialog.action} la tarjeta de {toggleDialog.card?.nombre}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToggleDialog({ ...toggleDialog, open: false })} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmToggleVisibility} color="primary" variant="contained">
            {toggleDialog.action === "ocultar" ? "Ocultar" : "Mostrar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Componente de notificación - al final para mayor z-index */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Box>
  );
};

export default CardsProfesoresManager;