import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Alert,
  CircularProgress
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

  // Cargar testimonios
  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug headers
      const headers = API_HEADERS.withAuth();
      console.log('🔍 [TESTIMONIOS] Headers para GET:', headers);
      
      const response = await TestimoniosService.getTestimonios();
      const items = Array.isArray(response.data) ? response.data : [];
      setTestimonios(items);
    } catch (err) {
      // Asegurar que error siempre sea un string
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

  // Abrir diálogo
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

  // Cerrar diálogo
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTestimonio(null);
    setFormData({});
  };

  // Guardar testimonio
  const handleSave = async (data) => {
    try {
      // Debug headers y datos
      const headers = API_HEADERS.withAuth();
      console.log('🔍 [TESTIMONIOS] Headers para UPDATE/CREATE:', headers);
      console.log('🔍 [TESTIMONIOS] Data a enviar:', data);
      console.log('🔍 [TESTIMONIOS] Es edición?:', !!editingTestimonio);
      
      if (editingTestimonio) {
        await TestimoniosService.updateTestimonio(editingTestimonio._id, data);
      } else {
        await TestimoniosService.createTestimonio(data);
      }
      closeDialog();
      fetchTestimonios();
    } catch (err) {
      console.error('🚨 [TESTIMONIOS] Error completo:', err);
      // Asegurar que error siempre sea un string
      const errorMessage = typeof err === 'string' ? err : 
                          err?.message || 
                          err?.error || 
                          'Error al guardar testimonio';
      setError(errorMessage);
    }
  };

  // Eliminar testimonio
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      return;
    }
    
    try {
      await TestimoniosService.deleteTestimonio(id);
      fetchTestimonios();
    } catch (err) {
      // Asegurar que error siempre sea un string
      const errorMessage = typeof err === 'string' ? err : 
                          err?.message || 
                          err?.error || 
                          'Error al eliminar testimonio';
      setError(errorMessage);
    }
  };

  // Actualizar datos del formulario
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
    </Box>
  );
};

export default TestimoniosManager;