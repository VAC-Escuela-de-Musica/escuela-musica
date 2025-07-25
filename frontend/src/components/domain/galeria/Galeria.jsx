import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function srcset(image, size, rows = 1, cols = 1) {
  return {
    src: `${image}?w=${size * cols}&h=${size * rows}&fit=crop&auto=format`,
    srcSet: `${image}?w=${size * cols}&h=${
      size * rows
    }&fit=crop&auto=format&dpr=2 2x`,
  };
}

const Galeria = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://146.83.198.35:1230';

  // Fetch galería from backend
  useEffect(() => {
    const fetchGaleria = async () => {
      try {
        const response = await fetch(`${API_URL}/galeria/active`);
        if (response.ok) {
          const data = await response.json();
          console.log('Galería recibida:', data.data);
          setGaleria(data.data || []);
        } else {
          console.error('Error fetching galería');
          setError('Error al cargar la galería');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchGaleria();
  }, [API_URL]);

  const handleImageClick = (item) => {
    setSelectedImage(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <Box id="galeria" sx={{ py: 8, px: { xs: 1, md: 3 }, bgcolor: '#222222', textAlign: 'center' }}>
        <CircularProgress sx={{ color: 'white' }} />
        <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
          Cargando galería...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box id="galeria" sx={{ py: 8, px: { xs: 1, md: 3 }, bgcolor: '#222222', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="h6" sx={{ color: 'white' }}>
          No se pudo cargar la galería
        </Typography>
      </Box>
    );
  }

  if (galeria.length === 0) {
    return (
      <Box id="galeria" sx={{ py: 8, px: { xs: 1, md: 3 }, bgcolor: '#222222', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          No hay imágenes disponibles en la galería
        </Typography>
      </Box>
    );
  }

  return (
    <Box id="galeria" sx={{ py: 8, px: { xs: 1, md: 3 }, bgcolor: '#222222' }}>
      <Typography 
        variant="h2" 
        component="h1" 
        align="left"
        sx={{ 
          mb: 6, 
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontSize: { xs: '2.5rem', md: '3.5rem' }
        }}
      >
        Galería
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '100vw' }}>
        <ImageList
          sx={{ 
            width: { xs: '100%', md: '90%', lg: '95%' }, 
            height: 650,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 2,
            p: 2
          }}
          variant="quilted"
          cols={4}
          rowHeight={160}
        >
          {galeria.map((item) => (
            <ImageListItem 
              key={item._id} 
              cols={item.cols || 1} 
              rows={item.rows || 1}
              sx={{ 
                position: 'relative',
                cursor: 'pointer',
                '& img': {
                  transition: 'transform 0.2s',
                },
                '&:hover img': {
                  transform: 'scale(1.02)'
                }
              }}
              onClick={() => handleImageClick(item)}
            >
              <img
                {...srcset(item.imagen, 160, item.rows, item.cols)}
                alt={item.titulo || ''}
                loading="lazy"
                style={{ 
                  borderRadius: 8,
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              />
              {(item.titulo || item.descripcion) && (
                <ImageListItemBar
                  title={item.titulo}
                  subtitle={item.descripcion}
                  sx={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      {/* Dialog para ver imagen */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth={(!selectedImage || selectedImage.titulo || selectedImage.descripcion) ? "md" : "md"} 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#2a2a2a',
            maxHeight: '90vh'
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ p: 0 }}>
            {(!selectedImage || selectedImage.titulo || selectedImage.descripcion) ? (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ 
                  width: '100%',
                  height: '60vh',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img
                    src={selectedImage?.imagen}
                    alt={selectedImage?.titulo || ''}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3 }}>
                  {selectedImage?.titulo && (
                    <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
                      {selectedImage.titulo}
                    </Typography>
                  )}
                  {selectedImage?.descripcion && (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                      {selectedImage.descripcion}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ 
                width: '100%',
                minHeight: '60vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src={selectedImage?.imagen}
                  alt=""
                  style={{
                    maxWidth: '100%',
                    maxHeight: '80vh',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}
          </DialogContent>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Galeria;