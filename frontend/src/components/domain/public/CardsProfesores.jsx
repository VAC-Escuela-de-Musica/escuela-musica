import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// URL del backend usando la configuración de Vite
const API_URL = `${import.meta.env.VITE_API_URL || "http://146.83.198.35:1230"}/api/cards-profesores/active`;

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
          throw new Error("Error al cargar los profesores");
        }
        const data = await response.json();
        setProfesores(data.data || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching profesores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfesores();
  }, []);

  if (loading) {
    return (
      <Box 
        id="profesores" 
        sx={{ 
          py: 8, 
          px: 2, 
          display: "flex", 
          justifyContent: "center",
          minHeight: "50vh",
          alignItems: "center"
        }}
      >
        <CircularProgress sx={{ color: "#FFFFFF", position: "relative", zIndex: 6 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box id="profesores" sx={{ py: 8, px: 2 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2, position: "relative", zIndex: 6 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      id="profesores" 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        px: 2,
        backgroundColor: "#222222",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container maxWidth="lg">
      <Typography 
          variant="h2" 
          component="h2" 
          sx={{ 
            mb: { xs: 6, md: 8 },
            color: "#FFFFFF",
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            textAlign: { xs: "center", md: "left" },
            position: "relative",
            zIndex: 6
          }}
        >
          Conoce a Nuestros Profesores
        </Typography>
        
        {profesores.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, position: "relative", zIndex: 6 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: { xs: "1.1rem", md: "1.25rem" }
              }}
            >
              No hay profesores disponibles en este momento.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {profesores.map((profesor, index) => (
              <Grid item xs={12} key={index}>
                <Card 
                  sx={{ 
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    height: { xs: "auto", md: 400 }, // Fixed height for consistency
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease-in-out",
                    position: "relative",
                    zIndex: 6, // Cards por encima de las siluetas
                    "&:hover": {
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                      transform: "translateY(-4px)"
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: "100%", md: 350 }, // Fixed width
                      height: { xs: 300, md: 400 }, // Fixed height matching card height
                      objectFit: "cover", // Ensures proper cropping
                      flexShrink: 0 // Prevents image from shrinking
                    }}
                    image={profesor.imagen}
                    alt={profesor.nombre}
                  />
                  <CardContent 
                    sx={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "center", // Center content vertically
                      p: { xs: 3, md: 4 },
                      minHeight: { xs: "auto", md: 400 } // Ensure content area has consistent height
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      component="h3"
                      sx={{ 
                        color: "#232b3b",
                        mb: 2,
                        fontSize: { xs: "1.8rem", md: "2.2rem" },
                        lineHeight: 1.2,
                        fontWeight: 600 // Slightly reduced from bold
                      }}
                    >
                      {profesor.nombre}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="p"
                      sx={{ 
                        color: "#666",
                        mb: 3,
                        fontStyle: "italic",
                        fontSize: { xs: "1.1rem", md: "1.25rem" }
                      }}
                    >
                      {profesor.especialidad}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "#555",
                        lineHeight: 1.7,
                        fontSize: { xs: "1rem", md: "1.1rem" },
                        flex: 1 // Takes remaining space
                      }}
                    >
                      {profesor.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default CardsProfesores;