import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Rating,
  Tooltip,
  Paper,
  List,
  ListItem,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { ReorderableList } from '../../configurable/ReorderableList.jsx';
import { StatusToggle } from '../../configurable/StatusToggle.jsx';

/**
 * Lista especializada para testimonios - Capa 3
 * Implementa funcionalidades específicas del dominio testimonios
 * Incluye reordenamiento, rating visual y tema oscuro
 */
const TestimonioList = ({
  data = [],
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
  onReorder = null,
  reorderMode = false,
  loading = false,
  theme = null
}) => {
  const [sortBy, setSortBy] = useState('orden');
  const [sortOrder, setSortOrder] = useState('asc');

  // Estilos del tema oscuro
  const darkTheme = {
    backgroundColor: '#2a2a2a',
    color: '#ffffff',
    cardBackground: '#333333',
    borderColor: '#555555'
  };

  // Renderizar testimonio individual
  const renderTestimonio = (testimonio, index) => {
    return (
      <Card
        key={testimonio._id || testimonio.id}
        sx={{
          mb: 2,
          bgcolor: theme?.isDark ? darkTheme.cardBackground : 'background.paper',
          color: theme?.isDark ? darkTheme.color : 'text.primary',
          border: theme?.isDark ? `1px solid ${darkTheme.borderColor}` : 'none',
          position: 'relative',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4
          }
        }}
      >
        {/* Botones de acción en esquina superior derecha */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            display: 'flex',
            gap: 0.5
          }}
        >
          {/* Toggle de visibilidad */}
          <StatusToggle
            value={testimonio.activo}
            onChange={(newValue) => onToggleStatus?.(testimonio._id || testimonio.id, newValue)}
            variant="icon"
            type="visibility"
            size="small"
          />

          {/* Editar */}
          <Tooltip title="Editar testimonio">
            <IconButton
              size="small"
              onClick={() => onEdit?.(testimonio)}
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                color: '#2196f3',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          {/* Eliminar */}
          <Tooltip title="Eliminar testimonio">
            <IconButton
              size="small"
              onClick={() => onDelete?.(testimonio._id || testimonio.id, testimonio)}
              sx={{
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#f44336',
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.2)'
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar */}
            <Avatar
              src={testimonio.foto}
              alt={testimonio.nombre}
              sx={{
                width: 56,
                height: 56,
                flexShrink: 0,
                border: theme?.isDark ? `2px solid ${darkTheme.borderColor}` : 'none'
              }}
            >
              {testimonio.nombre?.charAt(0)?.toUpperCase()}
            </Avatar>

            {/* Información principal */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: theme?.isDark ? darkTheme.color : 'text.primary'
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
                  color: theme?.isDark ? '#888' : 'text.secondary',
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {testimonio.cargo}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {/* Rating con estrellas */}
                <Rating
                  value={testimonio.estrellas || 0}
                  readOnly
                  size="small"
                  sx={{ 
                    '& .MuiRating-iconFilled': { 
                      color: '#FFD700' 
                    },
                    '& .MuiRating-iconEmpty': { 
                      color: theme?.isDark ? '#555' : '#e0e0e0'
                    }
                  }}
                />
                
                {/* Orden */}
                <Typography
                  variant="caption"
                  sx={{ color: theme?.isDark ? '#666' : 'text.secondary' }}
                >
                  Orden: {testimonio.orden || index + 1}
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
                  mb: 1,
                  color: theme?.isDark ? darkTheme.color : 'text.primary'
                }}
              >
                "{testimonio.opinion}"
              </Typography>

              {testimonio.institucion && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme?.isDark ? '#888' : 'text.secondary',
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
            {reorderMode && (
              <Box display="flex" flexDirection="column" gap={0.5}>
                <IconButton
                  size="small"
                  onClick={() => onReorder?.(testimonio._id || testimonio.id, 'up')}
                  disabled={index === 0}
                  sx={{
                    color: theme?.isDark ? darkTheme.color : 'text.primary',
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <UpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onReorder?.(testimonio._id || testimonio.id, 'down')}
                  disabled={index === data.length - 1}
                  sx={{
                    color: theme?.isDark ? darkTheme.color : 'text.primary',
                    p: 0.5,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <DownIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Si está en modo reordenamiento, usar ReorderableList
  if (reorderMode) {
    return (
      <ReorderableList
        items={data}
        onReorder={onReorder}
        title="Reordenar Testimonios"
        itemKey="_id"
        renderItem={(testimonio, index) => (
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {testimonio.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {testimonio.cargo}
            </Typography>
          </Box>
        )}
        renderIcon={(testimonio) => (
          <Avatar src={testimonio.foto} sx={{ width: 32, height: 32 }}>
            {testimonio.nombre?.charAt(0)?.toUpperCase()}
          </Avatar>
        )}
        renderSecondaryAction={(testimonio, index) => (
          <Box display="flex" gap={0.5}>
            <StatusToggle
              value={testimonio.activo}
              onChange={(newValue) => onToggleStatus?.(testimonio._id || testimonio.id, newValue)}
              variant="icon"
              type="visibility"
              size="small"
            />
            <IconButton size="small" onClick={() => onEdit?.(testimonio)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        enableDragDrop={true}
        enableManualButtons={true}
        dense={false}
      />
    );
  }

  // Vista normal (no reordenamiento)
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography
          variant="body1"
          sx={{ color: theme?.isDark ? darkTheme.color : 'text.primary' }}
        >
          Cargando testimonios...
        </Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: theme?.isDark ? darkTheme.cardBackground : 'background.paper',
          color: theme?.isDark ? darkTheme.color : 'text.primary'
        }}
      >
        <Typography variant="h6" gutterBottom>
          No hay testimonios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Haz clic en "Agregar Testimonio" para crear el primero
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {data.map((testimonio, index) => renderTestimonio(testimonio, index))}
    </Box>
  );
};

export default TestimonioList;