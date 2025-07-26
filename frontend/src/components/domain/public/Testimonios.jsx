import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import IconButton from '@mui/material/IconButton';

import Chip from '@mui/material/Chip';
import VerifiedIcon from '@mui/icons-material/Verified';
import Grid from '@mui/material/Grid';

const Testimonios = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);


  const API_URL = import.meta.env.VITE_API_URL || 'http://146.83.198.35:1230';

  // Fetch testimonios from backend
  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        const response = await fetch(`${API_URL}/api/testimonios/active`);
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


        {/* Testimonials Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {testimonios.map((testimonio, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={testimonio._id || `${testimonio.nombre}-${index}`}>
              <Card 
                sx={{ 
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
                  display: 'flex', 
                  flexDirection: 'column'
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
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#e0e0e0'
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
              </Card>
            </Grid>
          ))}
        </Grid>


      </Box>


    </Box>
  );
};

export default Testimonios;
