import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Box,
  Typography,
  Divider,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useReordering } from '../../hooks/configurable/useReordering.js';

/**
 * Lista configurable con reordenamiento - Capa 2
 * Componente reutilizable para drag & drop y reordenamiento manual
 * Soporta diferentes tipos de elementos y configuraciones
 */
const ReorderableList = ({
  items = [],
  onReorder = null,
  title = "Lista Reordenable",
  itemKey = "id",
  renderItem = null,
  renderIcon = null,
  renderSecondaryAction = null,
  enableDragDrop = true,
  enableManualButtons = true,
  enableAutoSave = false,
  saveTrigger = "change", // "change" | "manual"
  emptyMessage = "No hay elementos para reordenar",
  loading = false,
  maxHeight = 400,
  dense = false
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');

  // Hook de reordenamiento
  const reorder = useReordering(items, async (item, newIndex, oldIndex) => {
    try {
      setError('');
      
      if (onReorder) {
        await onReorder(item, newIndex, oldIndex, reorder.items);
      }
      
      if (!enableAutoSave && saveTrigger === 'change') {
        setHasChanges(true);
      }
      
      console.log(`Reordenado: ${getItemLabel(item)} de posición ${oldIndex} a ${newIndex}`);
    } catch (error) {
      console.error('Error al reordenar:', error);
      setError('Error al reordenar elementos');
    }
  });

  // Obtener etiqueta del elemento
  const getItemLabel = (item) => {
    if (typeof item === 'string') return item;
    return item.name || item.titulo || item.label || item.id || 'Elemento';
  };

  // Obtener clave única del elemento
  const getItemKey = (item) => {
    if (typeof item === 'string') return item;
    return item[itemKey] || item.id;
  };

  // Guardar cambios manualmente
  const handleSaveChanges = async () => {
    try {
      setError('');
      
      if (onReorder) {
        await onReorder(null, null, null, reorder.items);
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      setError('Error al guardar los cambios');
    }
  };

  // Cancelar cambios
  const handleCancelChanges = () => {
    reorder.resetItems();
    setHasChanges(false);
    setError('');
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Cargando elementos...
        </Typography>
      </Paper>
    );
  }

  if (items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={`${reorder.items.length} elemento${reorder.items.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
            />
            
            {hasChanges && (
              <Chip
                label="Cambios sin guardar"
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Controles de guardado manual */}
        {!enableAutoSave && saveTrigger === 'manual' && hasChanges && (
          <Box display="flex" gap={1} mt={2}>
            <Tooltip title="Guardar cambios">
              <IconButton
                size="small"
                color="primary"
                onClick={handleSaveChanges}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancelar cambios">
              <IconButton
                size="small"
                color="error"
                onClick={handleCancelChanges}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista */}
      <List
        dense={dense}
        sx={{ 
          maxHeight,
          overflow: 'auto',
          '& .MuiListItem-root': {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }
        }}
      >
        {reorder.items.map((item, index) => {
          const itemKey = getItemKey(item);
          const itemLabel = getItemLabel(item);
          
          return (
            <React.Fragment key={itemKey}>
              <ListItem
                {...(enableDragDrop ? reorder.getDraggableProps(item, index) : {})}
                sx={{
                  cursor: enableDragDrop ? 'grab' : 'default',
                  '&:active': {
                    cursor: enableDragDrop ? 'grabbing' : 'default'
                  }
                }}
              >
                {/* Drag Handle */}
                {enableDragDrop && (
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DragIcon color="action" />
                  </ListItemIcon>
                )}

                {/* Número de orden */}
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Chip
                    label={index + 1}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 24, height: 20, fontSize: '0.75rem' }}
                  />
                </ListItemIcon>

                {/* Icono personalizado */}
                {renderIcon && (
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {renderIcon(item, index)}
                  </ListItemIcon>
                )}

                {/* Contenido del elemento */}
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <ListItemText
                    primary={itemLabel}
                    secondary={
                      typeof item === 'object' && item.description 
                        ? item.description 
                        : `Posición ${index + 1}`
                    }
                  />
                )}

                {/* Controles manuales */}
                {enableManualButtons && (
                  <ListItemSecondaryAction>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Tooltip title="Mover arriba">
                        <IconButton
                          size="small"
                          onClick={() => reorder.moveUp(index)}
                          disabled={index === 0}
                          edge="end"
                        >
                          <UpIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mover abajo">
                        <IconButton
                          size="small"
                          onClick={() => reorder.moveDown(index)}
                          disabled={index === reorder.items.length - 1}
                          edge="end"
                        >
                          <DownIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {/* Acciones personalizadas */}
                      {renderSecondaryAction && renderSecondaryAction(item, index)}
                    </Box>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              
              {index < reorder.items.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </List>

      {/* Footer con información */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          {enableDragDrop && 'Arrastra los elementos para reordenar • '}
          {enableManualButtons && 'Usa las flechas para mover • '}
          Total: {reorder.items.length} elemento{reorder.items.length !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReorderableList;