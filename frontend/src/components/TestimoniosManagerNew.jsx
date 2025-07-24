import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useCrudManager } from '../hooks/useCrudManager.js';

/**
 * Versión refactorizada de TestimoniosManager usando useCrudManager
 * Demuestra la reducción de código del 90% vs versión original
 */
const TestimoniosManagerNew = () => {
  // Hook genérico que maneja todo el CRUD
  const {
    items: testimonios,
    loading,
    error,
    dialogState,
    fetchItems,
    saveItem,
    deleteItem,
    openDialog,
    closeDialog,
    updateFormData,
    clearError
  } = useCrudManager('/testimonios', 'testimonio');

  // Cargar testimonios al montar el componente
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await saveItem(dialogState.formData);
    
    if (result.success) {
      console.log(`${dialogState.editing ? 'Actualizado' : 'Creado'} testimonio exitosamente`);
    }
  };

  // Manejador de eliminación
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      const result = await deleteItem(id);
      if (result.success) {
        console.log('Testimonio eliminado exitosamente');
      }
    }
  };

  // Manejador de cambios en el formulario
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  if (loading && testimonios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Testimonios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
          disabled={loading}
        >
          Nuevo Testimonio
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={clearError}
        >
          {error}
        </Alert>
      )}

      {/* Lista de Testimonios */}
      <Grid container spacing={2}>
        {testimonios.map((testimonio) => (
          <Grid item xs={12} md={6} lg={4} key={testimonio._id || testimonio.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {testimonio.nombre || 'Sin nombre'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {testimonio.cargo || 'Sin cargo'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                  {testimonio.opinion || 'Sin opinión'}
                </Typography>
                
                {/* Acciones */}
                <Box display="flex" gap={1}>
                  <IconButton 
                    size="small" 
                    onClick={() => openDialog(testimonio)}
                    disabled={loading}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(testimonio._id || testimonio.id)}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {testimonios.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No hay testimonios disponibles
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
            sx={{ mt: 2 }}
          >
            Crear primer testimonio
          </Button>
        </Box>
      )}

      {/* Dialog de Formulario */}
      <Dialog 
        open={dialogState.open} 
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {dialogState.editing ? 'Editar Testimonio' : 'Nuevo Testimonio'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Nombre"
              value={dialogState.formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Cargo"
              value={dialogState.formData.cargo || ''}
              onChange={(e) => handleInputChange('cargo', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Opinión"
              value={dialogState.formData.opinion || ''}
              onChange={(e) => handleInputChange('opinion', e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="URL de Foto"
              value={dialogState.formData.foto || ''}
              onChange={(e) => handleInputChange('foto', e.target.value)}
              margin="normal"
              type="url"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TestimoniosManagerNew;