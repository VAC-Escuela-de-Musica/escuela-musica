import React from 'react';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Switch,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { useReordering } from '../../../hooks/configurable/useReordering.js';

/**
 * Tabla específica para carousel con funcionalidades de reordenamiento
 * Mantiene toda la funcionalidad del CarouselManager original
 */
const CarouselTable = ({ 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  specificLogic 
}) => {
  // Hook de reordenamiento
  const reorder = useReordering(data, (item, newIndex, oldIndex) => {
    console.log(`Reordenando ${item.titulo}: ${oldIndex} → ${newIndex}`);
    // Aquí se haría la llamada API para persistir el nuevo orden
  });

  // Manejo de toggle de visibilidad
  const handleVisibilityToggle = async (image) => {
    try {
      // Aquí iría la lógica para cambiar visibilidad en la API
      console.log(`Cambiando visibilidad de ${image.titulo}`);
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Cargando imágenes...</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No hay imágenes en el carousel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Haz clic en "Nueva imagen" para agregar la primera imagen
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {reorder.items.map((image, index) => (
          <Grid item xs={12} sm={6} md={4} key={image.id || index}>
            <Card
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover .carousel-actions': {
                  opacity: 1
                }
              }}
              {...reorder.getDraggableProps(image, index)}
            >
              {/* Indicador de drag */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 2,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  cursor: 'grab'
                }}
              >
                <DragIcon sx={{ color: 'white', p: 0.5 }} />
              </Box>

              {/* Número de orden */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {index + 1}
              </Box>

              {/* Imagen */}
              <CardMedia
                component="img"
                sx={{ 
                  height: 200,
                  objectFit: 'cover',
                  opacity: image.visible ? 1 : 0.5
                }}
                image={image.imagen || '/placeholder-image.jpg'}
                alt={image.titulo}
              />

              {/* Contenido */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" noWrap>
                  {image.titulo}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mt: 1
                  }}
                >
                  {image.descripcion}
                </Typography>

                {/* Switch de visibilidad */}
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Switch
                    checked={image.visible || false}
                    onChange={() => handleVisibilityToggle(image)}
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {image.visible ? 'Visible' : 'Oculto'}
                  </Typography>
                </Box>
              </CardContent>

              {/* Acciones */}
              <Box 
                className="carousel-actions"
                sx={{ 
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  p: 0.5
                }}
              >
                {/* Botón mover arriba */}
                <Tooltip title="Mover arriba">
                  <IconButton
                    size="small"
                    onClick={() => reorder.moveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                </Tooltip>

                {/* Botón mover abajo */}
                <Tooltip title="Mover abajo">
                  <IconButton
                    size="small"
                    onClick={() => reorder.moveDown(index)}
                    disabled={index === data.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                </Tooltip>

                {/* Botón editar */}
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => onEdit(image)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>

                {/* Botón eliminar */}
                <Tooltip title="Eliminar">
                  <IconButton
                    size="small"
                    onClick={() => onDelete(image.id, image)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CarouselTable;