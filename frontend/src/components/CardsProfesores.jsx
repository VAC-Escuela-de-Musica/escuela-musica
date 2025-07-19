import React, { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// URL del backend usando la configuración de Vite
const API_URL = `${import.meta.env.VITE_API_URL}/cards-profesores/active`;

const CardsProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfesores = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Error al cargar los profesores');
        }
        const data = await response.json();
        setProfesores(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching profesores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfesores();
  }, []);

  if (loading) {
    return (
      <Box id="profesores" sx={{ py: 8, px: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box id="profesores" sx={{ py: 8, px: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box id="profesores" sx={{ py: 8, px: 2 }}>
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
        Conoce a Nuestros Profesores
      </Typography>
      
      {profesores.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No hay profesores disponibles en este momento.
          </Typography>
        </Box>
      ) : (
                <Grid container spacing={4} maxWidth="lg" sx={{ mx: 'auto' }}>
          {profesores.map((profesor, index) => (
            <Grid item xs={12} key={index}>
              <Card 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  height: { xs: 'auto', md: 400 },
                  borderRadius: 5,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', md: 300 },
                    height: { xs: 200, md: '100%' },
                    objectFit: 'cover'
                  }}
                  image={profesor.imagen}
                  alt={profesor.nombre}
                />
                <CardContent sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  p: 3
                }}>
                  <Box>
                    <Typography 
                      gutterBottom 
                      variant="h4" 
                      component="h3"
                      sx={{ 
                        fontWeight: 'bold',
                        color: '#232b3b',
                        mb: 1
                      }}
                    >
                      {profesor.nombre}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="p"
                      sx={{ 
                        color: '#666',
                        mb: 2,
                        fontStyle: 'italic'
                      }}
                    >
                      {profesor.especialidad}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#555',
                        lineHeight: 1.6
                      }}
                    >
                      {profesor.descripcion}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CardsProfesores;
