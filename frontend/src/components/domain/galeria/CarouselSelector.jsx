import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Checkbox,
  Button,
  Alert,
  Chip,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useReordering } from '../../../hooks/configurable/useReordering.js';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';

/**
 * Selector especializado para configurar el carrusel
 * Separado del GaleriaManager según SRP
 * Maneja solo la responsabilidad de selección y ordenamiento para carrusel
 */
const CarouselSelector = () => {
  const [galeriaImages, setGaleriaImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hook de reordenamiento para imágenes seleccionadas
  const reorder = useReordering(selectedImages, async (item, newIndex, oldIndex) => {
    console.log(`Reordenando ${item.titulo}: ${oldIndex} → ${newIndex}`);
    // Aquí se persistiría el nuevo orden en la API
    await saveCarouselOrder(reorder.items);
  });

  // Cargar imágenes de la galería
  useEffect(() => {
    fetchGaleriaImages();
    fetchCarouselSelection();
  }, []);

  const fetchGaleriaImages = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.galeria.list, {
        headers: API_HEADERS.withAuth()
      });
      
      if (!response.ok) throw new Error('Error al cargar galería');
      
      const data = await response.json();
      setGaleriaImages(data.data || []);
    } catch (error) {
      setError('Error al cargar imágenes de la galería');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselSelection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/carousel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar carrusel');
      
      const data = await response.json();
      const carouselData = data.data || [];
      setSelectedImages(carouselData);
      reorder.updateItems(carouselData);
    } catch (error) {
      console.error('Error al cargar selección de carrusel:', error);
    }
  };

  // Agregar imagen al carrusel
  const addToCarousel = async (image) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/carousel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          galeriaId: image.id,
          titulo: image.titulo,
          descripcion: image.descripcion,
          imagen: image.imagen,
          orden: selectedImages.length + 1,
          visible: true
        })
      });

      if (!response.ok) throw new Error('Error al agregar al carrusel');

      const newItem = await response.json();
      const updatedSelection = [...selectedImages, newItem.data];
      setSelectedImages(updatedSelection);
      reorder.updateItems(updatedSelection);
      
      console.log('✅ Imagen agregada al carrusel');
    } catch (error) {
      setError('Error al agregar imagen al carrusel');
      console.error(error);
    }
  };

  // Remover imagen del carrusel
  const removeFromCarousel = async (carouselItem) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/carousel/${carouselItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al remover del carrusel');

      const updatedSelection = selectedImages.filter(item => item.id !== carouselItem.id);
      setSelectedImages(updatedSelection);
      reorder.updateItems(updatedSelection);
      
      console.log('✅ Imagen removida del carrusel');
    } catch (error) {
      setError('Error al remover imagen del carrusel');
      console.error(error);
    }
  };

  // Guardar orden del carrusel
  const saveCarouselOrder = async (orderedItems) => {
    try {
      const token = localStorage.getItem('token');
      const updates = orderedItems.map((item, index) => ({
        id: item.id,
        orden: index + 1
      }));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/carousel/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: updates })
      });

      if (!response.ok) throw new Error('Error al guardar orden');
      
      console.log('✅ Orden del carrusel guardado');
    } catch (error) {
      setError('Error al guardar el orden del carrusel');
      console.error(error);
    }
  };

  // Verificar si una imagen está en el carrusel
  const isInCarousel = (imageId) => {
    return selectedImages.some(item => item.galeriaId === imageId || item.id === imageId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando configuración del carrusel...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel izquierdo - Galería disponible */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Imágenes Disponibles en Galería
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecciona las imágenes que quieres mostrar en el carrusel
          </Typography>

          <Grid container spacing={2}>
            {galeriaImages.map((image) => (
              <Grid item xs={12} sm={6} md={4} key={image.id}>
                <Card 
                  sx={{ 
                    position: 'relative',
                    opacity: isInCarousel(image.id) ? 0.5 : 1,
                    border: isInCarousel(image.id) ? '2px solid' : 'none',
                    borderColor: 'success.main'
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={image.imagen}
                    alt={image.titulo}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <CardContent sx={{ pb: 1 }}>
                    <Typography variant="subtitle2" noWrap>
                      {image.titulo}
                    </Typography>
                    <Chip
                      label={image.categoria}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>

                  <Box sx={{ p: 1, textAlign: 'center' }}>
                    {isInCarousel(image.id) ? (
                      <Chip
                        label="En Carrusel"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addToCarousel(image)}
                        fullWidth
                      >
                        Agregar al Carrusel
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Panel derecho - Carrusel configurado */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Carrusel Configurado
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedImages.length} imagen{selectedImages.length !== 1 ? 'es' : ''} seleccionada{selectedImages.length !== 1 ? 's' : ''}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {selectedImages.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No hay imágenes en el carrusel
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Selecciona imágenes de la galería
                </Typography>
              </Box>
            ) : (
              <Box>
                {reorder.items.map((item, index) => (
                  <Card 
                    key={item.id} 
                    sx={{ mb: 1, cursor: 'grab' }}
                    {...reorder.getDraggableProps(item, index)}
                  >
                    <Box display="flex" alignItems="center" p={1}>
                      {/* Drag handle */}
                      <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      
                      {/* Número de orden */}
                      <Chip
                        label={index + 1}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, minWidth: 24 }}
                      />

                      {/* Preview imagen */}
                      <CardMedia
                        component="img"
                        sx={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 1, mr: 1 }}
                        image={item.imagen}
                        alt={item.titulo}
                      />

                      {/* Título */}
                      <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                        {item.titulo}
                      </Typography>

                      {/* Controles */}
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => reorder.moveUp(index)}
                          disabled={index === 0}
                        >
                          <UpIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => reorder.moveDown(index)}
                          disabled={index === selectedImages.length - 1}
                        >
                          <DownIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCarousel(item)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                ))}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => saveCarouselOrder(reorder.items)}
                  sx={{ mt: 2 }}
                >
                  Guardar Orden
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarouselSelector;