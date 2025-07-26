import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  IconButton, 
  CircularProgress, 
  Alert,
  Fade 
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCarouselConfig } from "../../../hooks/useCarouselConfig.js";

const CarouselClases = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Usar el hook personalizado para la configuración del carrusel
  const { selectedImages, loading, error, refreshFromBackend } = useCarouselConfig();

  useEffect(() => {
    console.log("Carrusel - selectedImages:", selectedImages);
    console.log("Carrusel - loading:", loading);
    console.log("Carrusel - error:", error);
  }, [selectedImages, loading, error]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === selectedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? selectedImages.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (selectedImages.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedImages, currentIndex]);

  // Reset current index when images change
  useEffect(() => {
    if (currentIndex >= selectedImages.length && selectedImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [selectedImages, currentIndex]);

  if (loading) {
    return (
      <Box 
        id="carrusel" 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          px: 2, 
          backgroundColor: "#222222",
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Box sx={{ textAlign: "center", color: "white" }}>
          <CircularProgress sx={{ color: "#FFFFFF", mb: 2 }} />
          <Typography variant="h6">
            Cargando carrusel...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      id="carrusel" 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        px: 2, // Same as CardsProfesores
        backgroundColor: "#222222",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center"
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative" }}> {/* Removed zIndex: 7 */}
        {/* Título */}
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
          Nuestras Últimas Clases
        </Typography>

        {/* Error handling */}
        {error && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              bgcolor: "rgba(255, 193, 7, 0.1)", 
              color: "white",
              position: "relative",
              zIndex: 6 // Only alert above siluetas
            }}
            action={
              <IconButton
                size="small"
                onClick={refreshFromBackend}
                sx={{ color: "white" }}
              >
                ↻
              </IconButton>
            }
          >
            {error} - Usando configuración local
          </Alert>
        )}

        {/* Contenedor del carrusel */}
        <Box
          sx={{
            backgroundColor: "#393939",
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            width: "100%",
            height: { xs: "300px", sm: "400px", md: "500px", lg: "600px" },
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6 // Only carousel content above siluetas
          }}
        >
          {selectedImages.length === 0 ? (
            <Box sx={{ textAlign: "center", color: "white", p: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                📸 No hay imágenes en el carrusel
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 2 }}>
                Configura el carrusel desde el módulo de gestión de galería
              </Typography>
              <IconButton
                onClick={refreshFromBackend}
                sx={{ 
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": { color: "white" }
                }}
              >
                ↻ Recargar
              </IconButton>
            </Box>
          ) : !selectedImages[currentIndex]?.imagen && !selectedImages[currentIndex]?.url ? (
            <Box sx={{ textAlign: "center", color: "white", p: 4 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                ⚠️ Error al cargar la imagen
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Imagen actual: {JSON.stringify(selectedImages[currentIndex])}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Imagen principal con transición */}
              <Fade in={true} timeout={500} key={currentIndex}>
                <Box
                  component="img"
                  src={selectedImages[currentIndex]?.imagen || selectedImages[currentIndex]?.url}
                  alt={selectedImages[currentIndex]?.titulo || selectedImages[currentIndex]?.alt || `Slide ${currentIndex + 1}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                  onError={(e) => {
                    console.error('Error loading carousel image:', e.target.src);
                  }}
                />
              </Fade>

              {/* Información de la imagen */}
              {(selectedImages[currentIndex]?.titulo || selectedImages[currentIndex]?.descripcion) && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
                    color: "white",
                    p: { xs: 2, md: 3 }
                  }}
                >
                  {selectedImages[currentIndex]?.titulo && (
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {selectedImages[currentIndex].titulo}
                    </Typography>
                  )}
                  {selectedImages[currentIndex]?.descripcion && (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {selectedImages[currentIndex].descripcion}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Controles de navegación */}
              {selectedImages.length > 1 && (
                <>
                  <IconButton
                    onClick={prevSlide}
                    sx={{
                      position: "absolute",
                      left: { xs: 8, md: 16 },
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.25)"
                      }
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={nextSlide}
                    sx={{
                      position: "absolute",
                      right: { xs: 8, md: 16 },
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      color: "white",
                      width: { xs: 40, md: 48 },
                      height: { xs: 40, md: 48 },
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.25)"
                      }
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </>
              )}

              {/* Indicadores de puntos */}
              {selectedImages.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 1
                  }}
                >
                  {selectedImages.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        cursor: "pointer",
                        backgroundColor: index === currentIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: index === currentIndex ? "white" : "rgba(255, 255, 255, 0.7)"
                        }
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Contador de imágenes */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  fontSize: "0.875rem"
                }}
              >
                {currentIndex + 1} / {selectedImages.length}
              </Box>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CarouselClases;