import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';

const StudentGalleryPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.galeria.getAll, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar la galería');
      }

      const data = await response.json();
      setGalleries(data.data || []);
    } catch (err) {
      console.error('Error fetching galleries:', err);
      setError('No se pudo cargar la galería');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Galería de la Escuela
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Explora las fotos y momentos de nuestra escuela de música
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/estudiante">
            Inicio
          </Link>
          <Typography color="text.primary">Galería</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {galleries.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No hay galerías disponibles
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {galleries.map((gallery) => (
            <Grid item xs={12} key={gallery._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" component="h2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                      {gallery.titulo}
                    </Typography>
                    {gallery.categoria && (
                      <Chip 
                        label={gallery.categoria} 
                        color="primary" 
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {gallery.descripcion && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {gallery.descripcion}
                    </Typography>
                  )}

                  <Grid container spacing={2}>
                    {gallery.imagenes && gallery.imagenes.length > 0 ? (
                      gallery.imagenes.map((imagen, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: 4,
                              }
                            }}
                            onClick={() => handleImageClick(imagen)}
                          >
                            <CardMedia
                              component="img"
                              height="200"
                              image={imagen.url || imagen}
                              alt={`Imagen ${index + 1} de ${gallery.titulo}`}
                              sx={{ objectFit: 'cover' }}
                            />
                          </Card>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Box textAlign="center" py={3}>
                          <Typography variant="body2" color="text.secondary">
                            No hay imágenes en esta galería
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {gallery.imagenes?.length || 0} imágenes
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(gallery.fechaCreacion).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Estadísticas */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Estadísticas de la Galería
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total de galerías
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  {galleries.length}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total de imágenes
                </Typography>
                <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                  {galleries.reduce((acc, gallery) => acc + (gallery.imagenes?.length || 0), 0)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Categorías únicas
                </Typography>
                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {new Set(galleries.map(g => g.categoria).filter(Boolean)).size}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Galería más reciente
                </Typography>
                <Typography variant="h5" color="info.main" sx={{ fontWeight: 'bold' }}>
                  {galleries.length > 0 ? 
                    new Date(Math.max(...galleries.map(g => new Date(g.fechaCreacion)))).toLocaleDateString() : 
                    'N/A'
                  }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Dialog para ver imagen en grande */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage.url || selectedImage}
              alt="Imagen ampliada"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default StudentGalleryPage; 