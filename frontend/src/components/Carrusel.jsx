import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import { IconButton, Typography, Paper } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCarouselConfig } from "../hooks/useCarouselConfig.js";

const CarouselClases = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Usar el hook personalizado para la configuración del carrusel
  const { selectedImages } = useCarouselConfig();

  useEffect(() => {
    // Cargar configuración del carrusel
    setLoading(false);
    console.log('Carrusel - selectedImages:', selectedImages);
  }, [selectedImages]);



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

  // Auto-advance carousel
  useEffect(() => {
    if (selectedImages.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedImages, currentIndex]);

  if (loading) {
    return (
      <section id="carrusel" className="w-screen h-screen bg-[#222222] flex items-center justify-center">
        <div className="text-white text-2xl">Cargando carrusel...</div>
      </section>
    );
  }

  return (
    <section id="carrusel" className="w-screen h-screen bg-[#222222] flex items-center justify-center">
      {/* Caja principal */}
      <div className="rounded-3xl shadow-lg w-full max-w-5xl p-10">
        {/* Título */}
        <Typography 
          variant="h2" 
          component="h1" 
          sx={{ 
            mb: 6,
            fontWeight: 'bold',
            color: '#FFFFFF',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          Nuestras Últimas Clases
        </Typography>

        {/* Caja galería */}
        <div className="bg-[#393939] rounded-3xl shadow-lg w-[1200px] h-[600px] flex items-center justify-center mx-auto relative overflow-hidden">
          {selectedImages.length === 0 ? (
            <div className="text-white text-center">
              <Typography variant="h5" className="mb-2">
                No hay imágenes seleccionadas para el carrusel
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Configura el carrusel desde el módulo de gestión de galería
              </Typography>
            </div>
          ) : !selectedImages[currentIndex]?.imagen ? (
            <div className="text-white text-center">
              <Typography variant="h5" className="mb-2">
                Error al cargar la imagen
              </Typography>
              <Typography variant="body2" className="text-gray-400">
                Imagen actual: {JSON.stringify(selectedImages[currentIndex])}
              </Typography>
            </div>
          ) : (
            <>
              {/* Imagen principal */}
              <img
                src={selectedImages[currentIndex]?.imagen}
                alt={selectedImages[currentIndex]?.titulo}
                className="w-full h-full object-cover"
              />

              {/* Controles de navegación */}
              {selectedImages.length > 1 && (
                <>
                  <IconButton
                    onClick={prevSlide}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      width: 48,
                      height: 48,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)'
                      }
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={nextSlide}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      width: 48,
                      height: 48,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)'
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
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
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
                        borderRadius: '50%',
                        cursor: 'pointer',
                        backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.7)'
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarouselClases;