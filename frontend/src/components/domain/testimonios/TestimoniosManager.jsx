import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  SwapVert as ReorderIcon
} from '@mui/icons-material';
import TestimonioForm from './TestimonioForm.jsx';
import TestimonioList from './TestimonioList.jsx';
import FormDialog from '../../common/FormDialog.jsx';
import { TestimoniosService } from '../../../services/api/testimonios.service.js';
import { API_HEADERS } from '../../../config/api.js';

/**
 * Manager simplificado para testimonios - Evita DomainManager problemático
 */
const TestimoniosManager = () => {
  const [reorderMode, setReorderMode] = useState(false);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonio, setEditingTestimonio] = useState(null);
  const [formData, setFormData] = useState({});

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    testimonioId: null,
    testimonioAutor: null
  });

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await TestimoniosService.getTestimonios();
      const items = Array.isArray(response.data) ? response.data : [];
      setTestimonios(items);
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 
                          err?.message || 
                          err?.error || 
                          'Error al cargar testimonios';
      setError(errorMessage);
      setTestimonios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonios();
  }, []);

  const openDialog = (testimonio = null) => {
    setEditingTestimonio(testimonio);
    setFormData(testimonio || {
      nombre: '',
      cargo: '',
      institucion: '',
      opinion: '',
      estrellas: 5,
      foto: '',
      activo: true
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTestimonio(null);
    setFormData({});
  };

  const handleSave = async (data) => {
    try {
      if (editingTestimonio) {
        await TestimoniosService.updateTestimonio(editingTestimonio._id, data);
      } else {
        await TestimoniosService.createTestimonio(data);
      }
      closeDialog();
      fetchTestimonios();
    } catch (err) {
      console.error('🚨 [TESTIMONIOS] Error completo:', err);
      const errorMessage = typeof err === 'string' ? err : 
                          err?.message || 
                          err?.error || 
                          'Error al guardar testimonio';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    const testimonio = testimonios.find(t => t._id === id);
    
    setDeleteDialog({
      open: true,
      testimonioId: id,
      testimonioAutor: testimonio?.autor || 'este testimonio'
    });
  };

  const confirmDelete = async () => {
    const { testimonioId } = deleteDialog;
    
    try {
      await TestimoniosService.deleteTestimonio(testimonioId);
      fetchTestimonios();
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 
                          err?.message || 
                          err?.error || 
                          'Error al eliminar testimonio';
      setError(errorMessage);
    } finally {
      setDeleteDialog({ open: false, testimonioId: null, testimonioAutor: null });
    }
  };

  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2, color: 'white' }}>
          Cargando testimonios...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#ffffff',
      p: 2
    }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Gestión de Testimonios
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Tooltip title="Modo reordenar">
            <Button
              variant={reorderMode ? "contained" : "outlined"}
              startIcon={<ReorderIcon />}
              onClick={() => setReorderMode(!reorderMode)}
              size="small"
            >
              {reorderMode ? 'Salir' : 'Reordenar'}
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
            disabled={loading}
          >
            Nuevo testimonio
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError(null)}
        >
          {typeof error === 'string' ? error : 'Error desconocido'}
        </Alert>
      )}

      {/* Lista de testimonios */}
      <TestimonioList
        data={testimonios}
        loading={loading}
        onEdit={openDialog}
        onDelete={handleDelete}
        reorder={reorderMode ? { handleReorder: () => {} } : null}
      />

      {/* Dialog de Formulario */}
      <FormDialog
        open={dialogOpen}
        onClose={closeDialog}
        title={editingTestimonio ? 'Editar testimonio' : 'Nuevo testimonio'}
        FormComponent={TestimonioForm}
        formData={formData}
        onSubmit={handleSave}
        onInputChange={updateFormData}
        isEditing={!!editingTestimonio}
        loading={loading}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            ¿Estás seguro de que quieres eliminar el testimonio de {deleteDialog.testimonioAutor}?
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
    </Box>
  );
};

export default TestimoniosManager;