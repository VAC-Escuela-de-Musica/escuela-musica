import React, { useState } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Typography,
  Card,
  CardMedia,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Fullscreen as FullscreenIcon,
  GridView as GridIcon,
  ViewModule as MasonryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

/**
 * Grid especializado para galería con vista masonry y lightbox
 * Mantiene funcionalidades avanzadas del GaleriaManager original
 */
const GaleriaGrid = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  specificLogic 
}) => {
  const [viewMode, setViewMode] = useState('masonry'); // 'grid' | 'masonry'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Categorías para filtros
  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'conciertos', label: 'Conciertos' },
    { value: 'clases', label: 'Clases' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'instrumentos', label: 'Instrumentos' },
    { value: 'profesores', label: 'Profesores' },
    { value: 'instalaciones', label: 'Instalaciones' },
    { value: 'otros', label: 'Otros' }
  ];

  // Filtrar datos por categoría
  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(item => item.categoria === selectedCategory);

  // Configuración de colores por categoría
  const categoryColors = {
    'conciertos': '#f44336',
    'clases': '#2196f3',
    'eventos': '#ff9800',
    'instrumentos': '#4caf50',
    'profesores': '#9c27b0',
    'instalaciones': '#607d8b',
    'otros': '#795548'
  };

  // Abrir lightbox
  const openLightbox = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  // Cerrar lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  // Toggle de visibilidad
  const handleVisibilityToggle = async (image) => {
    try {
      console.log(`Cambiando visibilidad de ${image.titulo}`);
      // Aquí iría la lógica para cambiar visibilidad en la API
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando galería...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No hay imágenes en la galería
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Haz clic en "Nueva imagen" para agregar la primera imagen
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controles superiores */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        {/* Filtros de categoría */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {categories.map((category) => (
            <Chip
              key={category.value}
              label={category.label}
              variant={selectedCategory === category.value ? 'filled' : 'outlined'}
              color={selectedCategory === category.value ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(category.value)}
              size="small"
            />
          ))}
        </Box>

        {/* Controles de vista */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <Tooltip title="Vista cuadrícula">
              <GridIcon />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="masonry">
            <Tooltip title="Vista masonry">
              <MasonryIcon />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grid de imágenes */}
      {viewMode === 'masonry' ? (
        // Vista Masonry
        <ImageList variant="masonry" cols={3} gap={12}>
          {filteredData.map((image) => (
            <ImageListItem key={image.id}>
              <img
                src={image.imagen}
                alt={image.titulo}
                loading="lazy"
                style={{
                  borderRadius: 8,
                  cursor: 'pointer',
                  opacity: image.activo ? 1 : 0.5
                }}
                onClick={() => openLightbox(image)}
              />
              
              <ImageListItemBar
                title={image.titulo}
                subtitle={
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip
                      label={image.categoria}
                      size="small"
                      sx={{
                        backgroundColor: categoryColors[image.categoria],
                        color: 'white',
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                    {!image.activo && (
                      <Chip
                        label="Inactivo"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                actionIcon={
                  <Box>
                    <Tooltip title="Ver en pantalla completa">
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(image);
                        }}
                      >
                        <FullscreenIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={image.activo ? 'Ocultar' : 'Mostrar'}>
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisibilityToggle(image);
                        }}
                      >
                        {image.activo ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Editar">
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(image);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(image.id, image);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        // Vista Grid regular
        <ImageList cols={4} gap={12}>
          {filteredData.map((image) => (
            <ImageListItem key={image.id} cols={image.cols || 1} rows={image.rows || 1}>
              <img
                src={image.imagen}
                alt={image.titulo}
                loading="lazy"
                style={{
                  borderRadius: 8,
                  cursor: 'pointer',
                  opacity: image.activo ? 1 : 0.5,
                  height: '100%',
                  objectFit: 'cover'
                }}
                onClick={() => openLightbox(image)}
              />
              
              <ImageListItemBar
                title={image.titulo}
                subtitle={
                  <Chip
                    label={image.categoria}
                    size="small"
                    sx={{
                      backgroundColor: categoryColors[image.categoria],
                      color: 'white',
                      fontSize: '0.7rem',
                      height: 20,
                      mt: 0.5
                    }}
                  />
                }
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(image);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(image.id, image);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.9)' }
        }}
      >
        {lightboxImage && (
          <>
            <DialogTitle sx={{ color: 'white' }}>
              <Typography variant="h5">
                {lightboxImage.titulo}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  label={lightboxImage.categoria}
                  size="small"
                  sx={{
                    backgroundColor: categoryColors[lightboxImage.categoria],
                    color: 'white'
                  }}
                />
                {lightboxImage.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'white', borderColor: 'white' }}
                  />
                ))}
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ textAlign: 'center', p: 0 }}>
              <CardMedia
                component="img"
                image={lightboxImage.imagen}
                alt={lightboxImage.titulo}
                sx={{
                  maxHeight: '70vh',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
              {lightboxImage.descripcion && (
                <Typography 
                  variant="body1" 
                  sx={{ color: 'white', p: 2 }}
                >
                  {lightboxImage.descripcion}
                </Typography>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={closeLightbox} color="inherit" sx={{ color: 'white' }}>
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  closeLightbox();
                  onEdit(lightboxImage);
                }}
                color="primary"
                variant="outlined"
              >
                Editar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GaleriaGrid;