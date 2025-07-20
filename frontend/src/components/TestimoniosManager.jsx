import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Grid,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  SwapVert as ReorderIcon
} from '@mui/icons-material';

const TestimoniosManager = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonio, setEditingTestimonio] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    opinion: '',
    foto: '',
    estrellas: 5,
    institucion: '',
    activo: true
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchTestimonios();
  }, []);

  const fetchTestimonios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestimonios(data.data || []);
      } else {
        throw new Error('Error al cargar testimonios');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al cargar testimonios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingTestimonio 
        ? `${API_URL}/testimonios/${editingTestimonio._id}`
        : `${API_URL}/testimonios`;
      
      const method = editingTestimonio ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Operación exitosa', 'success');
        handleCloseDialog();
        fetchTestimonios();
      } else {
        throw new Error('Error en la operación');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error en la operación', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Testimonio eliminado exitosamente', 'success');
        fetchTestimonios();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al eliminar testimonio', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/testimonios/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Estado actualizado exitosamente', 'success');
        fetchTestimonios();
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al cambiar estado', 'error');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = testimonios.findIndex(t => t._id === id);
    if (currentIndex === -1) return;

    const newTestimonios = [...testimonios];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newTestimonios.length) return;

    // Intercambiar posiciones
    [newTestimonios[currentIndex], newTestimonios[targetIndex]] = 
    [newTestimonios[targetIndex], newTestimonios[currentIndex]];

    // Actualizar orden en la base de datos
    try {
      const token = localStorage.getItem('token');
      const ordenData = newTestimonios.map((testimonio, index) => ({
        id: testimonio._id,
        orden: index
      }));

      const response = await fetch(`${API_URL}/testimonios/order/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ordenData })
      });

      if (response.ok) {
        setTestimonios(newTestimonios);
        showSnackbar('Orden actualizado exitosamente', 'success');
      } else {
        throw new Error('Error al actualizar orden');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al actualizar orden', 'error');
    }
  };

  const handleOpenDialog = (testimonio = null) => {
    if (testimonio) {
      setEditingTestimonio(testimonio);
      setFormData({
        nombre: testimonio.nombre,
        cargo: testimonio.cargo,
        opinion: testimonio.opinion,
        foto: testimonio.foto,
        estrellas: testimonio.estrellas,
        institucion: testimonio.institucion || '',
        activo: testimonio.activo
      });
    } else {
      setEditingTestimonio(null);
      setFormData({
        nombre: '',
        cargo: '',
        opinion: '',
        foto: '',
        estrellas: 5,
        institucion: '',
        activo: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTestimonio(null);
    setFormData({
      nombre: '',
      cargo: '',
      opinion: '',
      foto: '',
      estrellas: 5,
      institucion: '',
      activo: true
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Gestionar Reseñas
        </Typography>
        <Box>
          <Tooltip title="Modo reordenar">
            <IconButton
              onClick={() => setReorderMode(!reorderMode)}
              sx={{ 
                mr: 2, 
                bgcolor: reorderMode ? 'primary.main' : 'transparent',
                color: reorderMode ? 'white' : 'white',
                '&:hover': { bgcolor: reorderMode ? 'primary.dark' : 'rgba(255,255,255,0.1)' }
              }}
            >
              <ReorderIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
          >
            Agregar Reseña
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {testimonios.map((testimonio, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={testimonio._id}>
            <Card sx={{ 
              height: '320px', 
              bgcolor: '#2a2a2a', 
              color: 'white',
              position: 'relative'
            }}>
              <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    src={testimonio.foto} 
                    alt={testimonio.nombre}
                    sx={{ width: 40, height: 40, mr: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {testimonio.nombre}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      {testimonio.cargo}
                    </Typography>
                  </Box>
                  <Chip 
                    label={testimonio.activo ? 'Activo' : 'Inactivo'}
                    size="small"
                    color={testimonio.activo ? 'success' : 'default'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Box>

                <Rating 
                  value={testimonio.estrellas} 
                  readOnly 
                  size="small"
                  sx={{ mb: 1, '& .MuiRating-iconFilled': { color: '#FFD700' } }}
                />

                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1, 
                    flexGrow: 1,
                    fontStyle: 'italic',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    textOverflow: 'ellipsis'
                  }}
                >
                  "{testimonio.opinion}"
                </Typography>

                {testimonio.institucion && (
                  <Typography variant="caption" sx={{ color: '#888', mb: 1 }}>
                    {testimonio.institucion}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    Orden: {testimonio.orden}
                  </Typography>
                  <Box>
                    {reorderMode && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleReorder(testimonio._id, 'up')}
                          disabled={index === 0}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          <ArrowUpIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleReorder(testimonio._id, 'down')}
                          disabled={index === testimonios.length - 1}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          <ArrowDownIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 1, bgcolor: '#333' }}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleStatus(testimonio._id)}
                  sx={{ color: testimonio.activo ? '#4caf50' : '#f44336' }}
                >
                  {testimonio.activo ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(testimonio)}
                  sx={{ color: '#2196f3' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(testimonio._id)}
                  sx={{ color: '#f44336' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para crear/editar */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
          {editingTestimonio ? 'Editar Reseña' : 'Agregar Nueva Reseña'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#2a2a2a', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Opinión"
                multiline
                rows={3}
                value={formData.opinion}
                onChange={(e) => setFormData({ ...formData, opinion: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de la foto"
                value={formData.foto}
                onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'white' }}>
                  Calificación (Estrellas)
                </Typography>
                <Rating
                  value={formData.estrellas}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, estrellas: newValue });
                  }}
                  sx={{ '& .MuiRating-iconFilled': { color: '#FFD700' } }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institución (opcional)"
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                sx={{ mb: 2 }}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    color="primary"
                  />
                }
                label="Activo"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#2a2a2a' }}>
          <Button onClick={handleCloseDialog} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.nombre || !formData.cargo || !formData.opinion || !formData.foto}
          >
            {editingTestimonio ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestimoniosManager; 