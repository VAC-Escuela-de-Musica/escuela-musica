import React, { useState } from 'react';
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
          {itemData.map((item) => (
            <ImageListItem 
              key={item.img} 
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
                {...srcset(item.img, 160, item.rows, item.cols)}
                alt={item.title}
                loading="lazy"
                style={{ 
                  borderRadius: 8,
                  objectFit: 'cover'
                }}
              />
              {item.descripcion && (
                <ImageListItemBar
                  title={item.title}
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
            image={selectedImage?.img}
            alt={selectedImage?.title}
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
              {selectedImage?.title}
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

// Datos de ejemplo - puedes reemplazar con tus propias imágenes
const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Clase de Matemáticas',
    descripcion: 'Nuestros estudiantes participando activamente en una clase de matemáticas avanzadas, donde desarrollan habilidades de pensamiento crítico y resolución de problemas.',
    rows: 2,
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Laboratorio de Ciencias',
    descripcion: 'Experimentos prácticos en nuestro laboratorio de ciencias, donde los estudiantes aprenden a través de la experimentación y el descubrimiento.',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Tecnología Educativa',
    descripcion: 'Integrando tecnología moderna en nuestras aulas para preparar a los estudiantes para el futuro digital.',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Actividades Deportivas',
    descripcion: 'Promoviendo la salud física y el trabajo en equipo a través de nuestras actividades deportivas y recreativas.',
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Arte y Creatividad',
    descripcion: 'Desarrollando la creatividad y expresión artística de nuestros estudiantes en nuestras clases de arte.',
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Biblioteca y Lectura',
    descripcion: 'Fomentando el amor por la lectura y la investigación en nuestra biblioteca completamente equipada.',
    rows: 2,
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Actividades Extracurriculares',
    descripcion: 'Enriqueciendo la experiencia educativa con actividades extracurriculares que complementan el aprendizaje académico.',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Medio Ambiente',
    descripcion: 'Cultivando la conciencia ambiental y el respeto por la naturaleza en nuestros espacios verdes.',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Eventos Institucionales',
    descripcion: 'Celebrando los logros y creando memorias inolvidables en nuestros eventos institucionales.',
    rows: 2,
    cols: 2,
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Cafetería Estudiantil',
    descripcion: 'Proporcionando un espacio acogedor para que los estudiantes disfruten de sus alimentos y socialicen.',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Patio de Recreo',
    descripcion: 'Espacios de recreación donde los estudiantes pueden descansar, jugar y desarrollar habilidades sociales.',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Transporte Escolar',
    descripcion: 'Servicio de transporte seguro y confiable para facilitar el acceso de nuestros estudiantes a la institución.',
    cols: 2,
  },
];

export default Galeria;