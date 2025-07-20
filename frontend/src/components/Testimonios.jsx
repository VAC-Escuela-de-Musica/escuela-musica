import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Chip from '@mui/material/Chip';
import VerifiedIcon from '@mui/icons-material/Verified';
import Grid from '@mui/material/Grid';

const Testimonios = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTestimonio, setEditingTestimonio] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    opinion: '',
    foto: '',
    estrellas: 5,
    institucion: '',
    activo: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch testimonios from backend
  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        const response = await fetch(`${API_URL}/testimonios/active`);
        if (response.ok) {
          const data = await response.json();
          console.log('Testimonios recibidos:', data.data);
          setTestimonios(data.data || []);
        } else {
          console.error('Error fetching testimonios');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonios();
  }, [API_URL]);

  // Auto-advance carousel
  useEffect(() => {
    if (testimonios.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonios.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [testimonios.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonios.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonios.length - 1 : prevIndex - 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleEdit = (testimonio) => {
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

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Debes iniciar sesión para editar testimonios', 'error');
        return;
      }

      const response = await fetch(`${API_URL}/testimonios/${editingTestimonio._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(data.message || 'Testimonio actualizado exitosamente', 'success');
        handleCloseDialog();
        // Recargar testimonios
        const testimoniosResponse = await fetch(`${API_URL}/testimonios/active`);
        if (testimoniosResponse.ok) {
          const testimoniosData = await testimoniosResponse.json();
          setTestimonios(testimoniosData.data || []);
        }
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'Error al actualizar testimonio', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showSnackbar('Error al actualizar testimonio', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Función para obtener las 4 tarjetas a mostrar
  const getDisplayTestimonios = () => {
    if (testimonios.length === 0) return [];
    
    let displayTestimonios = testimonios.slice(currentIndex, currentIndex + 4);
    if (displayTestimonios.length < 4 && testimonios.length > 4) {
      const remaining = 4 - displayTestimonios.length;
      displayTestimonios = [...displayTestimonios, ...testimonios.slice(0, remaining)];
    }
    return displayTestimonios;
  };

  if (loading) {
    return (
      <Box id="testimonios" sx={{ py: 8, px: 2, bgcolor: '#1a1a1a', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Cargando testimonios...
        </Typography>
      </Box>
    );
  }

  if (testimonios.length === 0) {
    return (
      <Box id="testimonios" sx={{ py: 8, px: 2, bgcolor: '#1a1a1a', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          No hay testimonios disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="testimonios" sx={{ py: 8, px: 2, bgcolor: '#1a1a1a' }}>
      <Typography 
        variant="h2" 
        component="h1" 
        align="center" 
        sx={{ 
          mb: 6, 
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontSize: { xs: '2.5rem', md: '3.5rem' }
        }}
      >
        Lo que dicen nuestros estudiantes
      </Typography>
      
      <Box sx={{ 
        position: 'relative', 
        maxWidth: '1200px', 
        mx: 'auto',
        px: { xs: 1, md: 4 }
      }}>
        {/* Navigation Arrows */}
        {testimonios.length > 4 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                }
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        {/* Testimonials Grid */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {getDisplayTestimonios().map((testimonio, index) => (
            <Grid item xs={12} sm={6} md={3} key={testimonio._id || `${testimonio.nombre}-${index}`}>
              <Card 
                sx={{ 
                  height: '280px', // Altura fija más razonable
                  bgcolor: '#2a2a2a',
                  color: 'white',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 3, 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {/* Star Rating */}
                  <Box sx={{ mb: 1 }}>
                    <Rating 
                      value={testimonio.estrellas} 
                      readOnly 
                      sx={{ 
                        '& .MuiRating-iconFilled': {
                          color: '#FFD700'
                        },
                        '& .MuiRating-iconEmpty': {
                          color: '#666'
                        }
                      }}
                    />
                  </Box>

                  {/* Testimonial Text */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 1, 
                      flexGrow: 1,
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#e0e0e0',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    "{testimonio.opinion}"
                  </Typography>

                  {/* Read More Link */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#888',
                      cursor: 'pointer',
                      '&:hover': { color: '#fff' },
                      mb: 2
                    }}
                  >
                    Leer más
                  </Typography>

                  {/* Client Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={testimonio.foto} 
                      alt={testimonio.nombre}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ fontWeight: 'bold', color: 'white' }}
                        >
                          {testimonio.nombre}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ color: '#888', display: 'block' }}
                      >
                        {testimonio.cargo}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Company/Institution */}
                  {testimonio.institucion && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #444' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#888',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        {testimonio.institucion}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ p: 1, bgcolor: '#333', justifyContent: 'center' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(testimonio)}
                    sx={{ 
                      color: '#2196f3',
                      '&:hover': { 
                        bgcolor: 'rgba(33, 150, 243, 0.1)' 
                      }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination Dots */}
        {testimonios.length > 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {testimonios.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'white' : 'transparent',
                  border: '2px solid white',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Dialog de edición */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2a2a2a', color: 'white' }}>
          Editar Testimonio
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
                InputProps={{ sx: { color: 'white' } }}
                InputLabelProps={{ sx: { color: 'gray' } }}
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
                InputProps={{ sx: { color: 'white' } }}
                InputLabelProps={{ sx: { color: 'gray' } }}
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
                InputProps={{ sx: { color: 'white' } }}
                InputLabelProps={{ sx: { color: 'gray' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de la foto"
                value={formData.foto}
                onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                sx={{ mb: 2 }}
                InputProps={{ sx: { color: 'white' } }}
                InputLabelProps={{ sx: { color: 'gray' } }}
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
                InputProps={{ sx: { color: 'white' } }}
                InputLabelProps={{ sx: { color: 'gray' } }}
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
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
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

export default Testimonios;
