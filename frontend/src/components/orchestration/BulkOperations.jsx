import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Grid,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as ImportIcon,
  CloudDownload as ExportIcon,
  PlayArrow as ExecuteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Importar servicios especializados
import { UsersService } from '../../services/api/users.service.js';
import { GaleriaService } from '../../services/api/galeria.service.js';
import { TestimoniosService } from '../../services/api/testimonios.service.js';

/**
 * Gestor de Operaciones Masivas - Capa 4
 * Orquesta operaciones complejas que afectan múltiples elementos
 * Maneja import/export, cambios masivos de estado, etc.
 */
const BulkOperationsManager = ({ onClose, selectedItems = [], domain = 'users' }) => {
  const [operation, setOperation] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Configuración de operaciones por dominio
  const operationConfig = {
    users: {
      service: UsersService,
      operations: [
        { 
          id: 'activate', 
          label: 'Activar usuarios seleccionados', 
          icon: <VisibilityIcon />,
          description: 'Marca como activos todos los usuarios seleccionados',
          requiresConfirmation: false
        },
        { 
          id: 'deactivate', 
          label: 'Desactivar usuarios seleccionados', 
          icon: <VisibilityOffIcon />,
          description: 'Marca como inactivos todos los usuarios seleccionados',
          requiresConfirmation: true
        },
        { 
          id: 'delete', 
          label: 'Eliminar usuarios seleccionados', 
          icon: <DeleteIcon />,
          description: 'Elimina permanentemente los usuarios seleccionados',
          requiresConfirmation: true,
          destructive: true
        },
        { 
          id: 'export', 
          label: 'Exportar usuarios a CSV', 
          icon: <ExportIcon />,
          description: 'Descarga los usuarios seleccionados en formato CSV',
          requiresConfirmation: false
        }
      ]
    },
    galeria: {
      service: GaleriaService,
      operations: [
        { 
          id: 'activate', 
          label: 'Activar imágenes seleccionadas', 
          icon: <VisibilityIcon />,
          description: 'Hace visibles todas las imágenes seleccionadas',
          requiresConfirmation: false
        },
        { 
          id: 'deactivate', 
          label: 'Ocultar imágenes seleccionadas', 
          icon: <VisibilityOffIcon />,
          description: 'Oculta todas las imágenes seleccionadas',
          requiresConfirmation: true
        },
        { 
          id: 'delete', 
          label: 'Eliminar imágenes seleccionadas', 
          icon: <DeleteIcon />,
          description: 'Elimina permanentemente las imágenes seleccionadas',
          requiresConfirmation: true,
          destructive: true
        },
        { 
          id: 'export', 
          label: 'Exportar metadatos', 
          icon: <ExportIcon />,
          description: 'Descarga información de las imágenes seleccionadas',
          requiresConfirmation: false
        }
      ]
    },
    testimonios: {
      service: TestimoniosService,
      operations: [
        { 
          id: 'activate', 
          label: 'Activar testimonios seleccionados', 
          icon: <VisibilityIcon />,
          description: 'Hace visibles todos los testimonios seleccionados',
          requiresConfirmation: false
        },
        { 
          id: 'deactivate', 
          label: 'Ocultar testimonios seleccionados', 
          icon: <VisibilityOffIcon />,
          description: 'Oculta todos los testimonios seleccionados',
          requiresConfirmation: true
        },
        { 
          id: 'delete', 
          label: 'Eliminar testimonios seleccionados', 
          icon: <DeleteIcon />,
          description: 'Elimina permanentemente los testimonios seleccionados',
          requiresConfirmation: true,
          destructive: true
        },
        { 
          id: 'export', 
          label: 'Exportar testimonios', 
          icon: <ExportIcon />,
          description: 'Descarga los testimonios seleccionados',
          requiresConfirmation: false
        }
      ]
    }
  };

  const currentConfig = operationConfig[domain];
  const selectedOperation = currentConfig?.operations.find(op => op.id === operation);

  /**
   * Ejecutar operación masiva
   */
  const executeOperation = async () => {
    if (!selectedOperation || selectedItems.length === 0) return;

    setExecuting(true);
    setProgress(0);
    setError('');
    setResults(null);

    try {
      const service = currentConfig.service;
      const itemIds = selectedItems.map(item => item.id || item._id);
      let operationResults = [];

      switch (selectedOperation.id) {
        case 'activate':
          operationResults = await executeStatusChange(service, itemIds, true);
          break;
        case 'deactivate':
          operationResults = await executeStatusChange(service, itemIds, false);
          break;
        case 'delete':
          operationResults = await executeDelete(service, itemIds);
          break;
        case 'export':
          await executeExport(service, selectedItems);
          break;
        default:
          throw new Error('Operación no implementada');
      }

      setResults({
        successful: operationResults.filter(r => r.success).length,
        failed: operationResults.filter(r => !r.success).length,
        errors: operationResults.filter(r => !r.success).map(r => r.error)
      });

    } catch (error) {
      console.error('Error en operación masiva:', error);
      setError(error.message || 'Error al ejecutar la operación');
    } finally {
      setExecuting(false);
      setConfirmDialog(false);
    }
  };

  /**
   * Ejecutar cambio de estado masivo
   */
  const executeStatusChange = async (service, itemIds, newStatus) => {
    const results = [];
    const total = itemIds.length;

    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      try {
        let methodName;
        switch (domain) {
          case 'users':
            methodName = 'toggleUserStatus';
            break;
          case 'galeria':
            methodName = 'toggleImageStatus';
            break;
          case 'testimonios':
            methodName = 'toggleTestimonioStatus';
            break;
          default:
            throw new Error('Dominio no soportado');
        }

        await service[methodName](itemId, newStatus);
        results.push({ id: itemId, success: true });
      } catch (error) {
        results.push({ 
          id: itemId, 
          success: false, 
          error: error.message 
        });
      }
      
      setProgress(((i + 1) / total) * 100);
    }

    return results;
  };

  /**
   * Ejecutar eliminación masiva
   */
  const executeDelete = async (service, itemIds) => {
    const results = [];
    const total = itemIds.length;

    for (let i = 0; i < itemIds.length; i++) {
      const itemId = itemIds[i];
      try {
        let methodName;
        switch (domain) {
          case 'users':
            methodName = 'deleteUser';
            break;
          case 'galeria':
            methodName = 'deleteImage';
            break;
          case 'testimonios':
            methodName = 'deleteTestimonio';
            break;
          default:
            throw new Error('Dominio no soportado');
        }

        await service[methodName](itemId);
        results.push({ id: itemId, success: true });
      } catch (error) {
        results.push({ 
          id: itemId, 
          success: false, 
          error: error.message 
        });
      }
      
      setProgress(((i + 1) / total) * 100);
    }

    return results;
  };

  /**
   * Ejecutar exportación
   */
  const executeExport = async (service, items) => {
    try {
      let methodName;
      switch (domain) {
        case 'users':
          methodName = 'exportUsers';
          break;
        case 'galeria':
          methodName = 'exportImages';
          break;
        case 'testimonios':
          methodName = 'exportTestimonios';
          break;
        default:
          throw new Error('Dominio no soportado');
      }

      const blob = await service[methodName]({ format: 'csv' });
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${domain}_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setResults({
        successful: items.length,
        failed: 0,
        errors: []
      });
    } catch (error) {
      throw new Error(`Error al exportar: ${error.message}`);
    }
  };

  /**
   * Abrir diálogo de confirmación
   */
  const handleExecute = () => {
    if (selectedOperation?.requiresConfirmation) {
      setConfirmDialog(true);
    } else {
      executeOperation();
    }
  };

  if (selectedItems.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay elementos seleccionados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Selecciona elementos para realizar operaciones masivas
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Operaciones Masivas - {selectedItems.length} elemento{selectedItems.length !== 1 ? 's' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
        </Typography>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Selección de Operación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Seleccionar Operación
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Operación</InputLabel>
                <Select
                  value={operation}
                  label="Operación"
                  onChange={(e) => setOperation(e.target.value)}
                  disabled={executing}
                >
                  {currentConfig?.operations.map((op) => (
                    <MenuItem key={op.id} value={op.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {op.icon}
                        {op.label}
                        {op.destructive && (
                          <Chip 
                            label="Destructiva" 
                            color="error" 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedOperation && (
                <Alert 
                  severity={selectedOperation.destructive ? "warning" : "info"} 
                  sx={{ mt: 2 }}
                >
                  {selectedOperation.description}
                </Alert>
              )}

              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<ExecuteIcon />}
                  onClick={handleExecute}
                  disabled={!operation || executing}
                  color={selectedOperation?.destructive ? "error" : "primary"}
                  fullWidth
                >
                  {executing ? `Ejecutando... ${progress.toFixed(0)}%` : 'Ejecutar Operación'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de Elementos Seleccionados */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Elementos Seleccionados
              </Typography>
              
              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {selectedItems.slice(0, 10).map((item, index) => (
                  <ListItem key={index} dense>
                    <ListItemText
                      primary={item.nombre || item.titulo || item.username || `Item ${index + 1}`}
                      secondary={
                        item.email || 
                        item.categoria || 
                        item.cargo || 
                        'Sin información adicional'
                      }
                    />
                    <Chip
                      label={item.activo ? 'Activo' : 'Inactivo'}
                      color={item.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
                
                {selectedItems.length > 10 && (
                  <ListItem>
                    <ListItemText
                      primary={`... y ${selectedItems.length - 10} elementos más`}
                      sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progreso */}
      {executing && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Ejecutando Operación...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress.toFixed(0)}% completado
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultados de la Operación
            </Typography>
            
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6}>
                <Chip 
                  label={`${results.successful} exitosos`}
                  color="success"
                  icon={<SelectAllIcon />}
                />
              </Grid>
              <Grid item xs={6}>
                <Chip 
                  label={`${results.failed} fallaron`}
                  color={results.failed > 0 ? "error" : "default"}
                  icon={<ClearIcon />}
                />
              </Grid>
            </Grid>

            {results.errors.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errores encontrados:
                </Typography>
                {results.errors.slice(0, 5).map((error, index) => (
                  <Alert key={index} severity="error" sx={{ mb: 1 }}>
                    {error}
                  </Alert>
                ))}
                {results.errors.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    ... y {results.errors.length - 5} errores más
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error General */}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {/* Diálogo de Confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Confirmar Operación
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ¿Estás seguro de que quieres {selectedOperation?.label.toLowerCase()}?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Esta acción afectará a {selectedItems.length} elemento{selectedItems.length !== 1 ? 's' : ''}.
          </Typography>
          {selectedOperation?.destructive && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Esta es una operación destructiva y no se puede deshacer.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={executeOperation}
            color={selectedOperation?.destructive ? "error" : "primary"}
            variant="contained"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkOperationsManager;