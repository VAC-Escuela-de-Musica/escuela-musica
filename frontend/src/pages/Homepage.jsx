import React from "react";
import { Box } from "@mui/material";
import Navbar from "../components/domain/layout/Navbar";
import Hero from "../components/domain/public/Hero";
import CarouselClases from "../components/domain/public/Carrusel";
import CardsProfesores from "../components/domain/public/CardsProfesores";
import Galeria from "../components/domain/public/Galeria";
import Testimonios from "../components/domain/public/Testimonios";
import Footer from "../components/domain/layout/Footer";

const HomePage = () => {
  return (
    <Box sx={{ position: "relative" }}>
      {/* Siluetas decorativas de fondo */}
      <Box
        component="img"
        src="/guitar-silueta.svg"
        alt="Guitarra decorativa"
        sx={{
          position: "fixed",
          left: { xs: "-100px", sm: "-80px", md: "-60px", lg: "-40px" },
          top: "50%",
          transform: "translateY(-50%)",
          height: { xs: "60vh", sm: "70vh", md: "80vh", lg: "90vh" },
          width: "auto",
          opacity: { xs: 0.4, md: 0.5 },
          zIndex: 5,
          filter: "brightness(0) invert(1)",
          pointerEvents: "none",
          // Difuminado en los bordes superior e inferior
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
        }}
      />
      
      <Box
        component="img"
        src="/violin-silueta.svg"
        alt="Violín decorativo"
        sx={{
          position: "fixed",
          right: { xs: "-100px", sm: "-80px", md: "-60px", lg: "-40px" },
          top: "50%",
          transform: "translateY(-50%)",
          height: { xs: "50vh", sm: "60vh", md: "70vh", lg: "80vh" },
          width: "auto",
          opacity: { xs: 0.4, md: 0.5 },
          zIndex: 5,
          filter: "brightness(0) invert(1)",
          pointerEvents: "none",
          // Difuminado en los bordes superior e inferior
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
        }}
      />

      <Navbar />
      
      {/* Sección Hero con imagen de fondo */}
      <Box sx={{ position: "relative", zIndex: 10 }}>
        <Hero />
      </Box>
      
      {/* Resto de las secciones con fondo oscuro */}
      <Box sx={{ backgroundColor: "#222222" }}>
        {/* Sección Carrusel */}
        <CarouselClases />
        
        {/* Separador entre secciones */}
        <Box sx={{ height: { xs: "2rem", md: "3rem" } }} />
        
        {/* Sección Profesores */}
        <CardsProfesores />
        
        {/* Separador entre secciones */}
        <Box sx={{ height: { xs: "2rem", md: "3rem" } }} />
        
        {/* Sección Galería */}
        <Box sx={{ position: "relative", zIndex: 6 }}>
          <Galeria />
        </Box>
        
        {/* Separador entre secciones */}
        <Box sx={{ height: { xs: "2rem", md: "3rem" } }} />
        
        {/* Sección Testimonios */}
        <Box sx={{ position: "relative", zIndex: 6 }}>
          <Testimonios />
        </Box>
        
        {/* Footer */}
        <Box sx={{ position: "relative", zIndex: 6 }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
