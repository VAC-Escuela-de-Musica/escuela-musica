import React, { useState, useEffect } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

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
  const [openModal, setOpenModal] = useState(false);
  const [galeria, setGaleria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    if (item.descripcion) {
      setSelectedImage(item);
      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
          fontSize: { xs: '2.5rem', md: '3.5rem' },
          
        }}
      >
        Galería de Imágenes
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
                cursor: item.descripcion ? 'pointer' : 'default',
                '&:hover': item.descripcion ? {
                  opacity: 0.8,
                  transition: 'opacity 0.3s ease-in-out'
                } : {}
              }}
              onClick={() => handleImageClick(item)}
            >
              <img
                {...srcset(item.imagen, 160, item.rows, item.cols)}
                alt={item.titulo}
                loading="lazy"
                style={{ 
                  borderRadius: 8,
                  objectFit: 'cover'
                }}
              />
              {item.descripcion && (
                <ImageListItemBar
                  title={item.titulo}
                  sx={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                  }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      {/* Modal para mostrar imagen con descripción */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Card 
          sx={{ 
            maxWidth: { xs: '95%', md: 600 },
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}
        >
          <IconButton
            onClick={handleCloseModal}
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
          
          <CardMedia
            component="img"
            image={selectedImage?.imagen}
            alt={selectedImage?.titulo}
            sx={{ 
              width: '100%',
              height: { xs: 300, md: 400 },
              objectFit: 'cover'
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 'bold', color: '#232b3b' }}
            >
              {selectedImage?.titulo}
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#555',
                lineHeight: 1.6,
                fontSize: '1.1rem'
              }}
            >
              {selectedImage?.descripcion}
            </Typography>
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

export default Galeria;