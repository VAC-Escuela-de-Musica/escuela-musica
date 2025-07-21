import Box from "@mui/material/Box";
import React, { useState, useEffect } from "react";
import { IconButton, Typography, Paper } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const CarouselClases = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/carousel`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.data || []);
      }
    } catch (error) {
      // ...existing code...
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance carousel
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(nextSlide, 5000); // Cambiar cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [images, currentIndex]);

  if (loading) {
    return (
      <section id="carrusel" className="w-screen h-screen bg-[#222222] flex items-center justify-center">
        <div className="text-white text-2xl">Cargando carrusel...</div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="carrusel" className="w-screen h-screen bg-[#222222] flex items-center justify-center">
        <div className="text-white text-2xl">No hay imágenes disponibles</div>
      </section>
    );
  }

  return (
    <section id="carrusel" className="w-screen h-screen bg-[#222222] flex items-center justify-center">
      {/* Caja principal */}
      <div className="rounded-3xl shadow-lg w-full max-w-5xl p-10">
        {/* Título */}
        <h1
          className="text-white font-bold mb-8"
          style={{ fontSize: "2.8em", lineHeight: 1.1 }}
        >
          Nuestras Últimas Clases
        </h1>
        {/* Caja galería */}
        <div className="bg-[#393939] rounded-3xl shadow-lg w-[1200px] h-[600px] flex items-center justify-center mx-auto relative overflow-hidden">
          {/* Imagen principal */}
          <img
            src={images[currentIndex]?.url}
            alt={images[currentIndex]?.titulo}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay con información */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <Typography variant="h4" className="text-white font-bold mb-2">
              {images[currentIndex]?.titulo}
            </Typography>
            <Typography variant="body1" className="text-white/90">
              {images[currentIndex]?.descripcion}
            </Typography>
          </div>

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Indicadores de puntos */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CarouselClases;