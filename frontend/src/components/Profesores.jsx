import React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import mariaImg from "../assets/maria.png";

const profesores = [
  {
    nombre: "María López",
    especialidad: "Canto Lírico y Técnica Vocal",
    descripcion: "Especialista en canto lírico y técnica vocal. Con más de 10 años de experiencia en la enseñanza musical, María ha formado a numerosos estudiantes que han destacado en competencias nacionales e internacionales.",
    imagen: mariaImg,
  },
  {
    nombre: "Carlos Pérez",
    especialidad: "Guitarra Clásica y Eléctrica",
    descripcion: "Profesor de guitarra clásica y eléctrica. Músico profesional con amplia experiencia en diferentes géneros musicales, desde clásico hasta rock y jazz.",
    imagen: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
  },
  {
    nombre: "Ana Rodríguez",
    especialidad: "Piano Clásico",
    descripcion: "Pianista clásica y profesora de piano. Graduada del Conservatorio Nacional con especialización en pedagogía musical para niños y jóvenes.",
    imagen: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
  },
  {
    nombre: "Luis Martínez",
    especialidad: "Batería y Percusión",
    descripcion: "Profesor de batería y percusión. Músico de sesión con experiencia en grabaciones profesionales y presentaciones en vivo.",
    imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
  },
];

const Profesores = () => {
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
    </Box>
  );
};

export default Profesores;
