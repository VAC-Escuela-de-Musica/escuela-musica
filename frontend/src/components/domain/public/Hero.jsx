import React from "react";
import { Box, Typography, Container } from "@mui/material";
import heroImg from "../../../assets/hero.jpg";
import ActionAreaCard from "./Card.jsx";

const Hero = () => {
  return (
    <Box
      component="header"
      id="inicio"
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "120vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to top, #222222 80%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none"
        }
      }}
    >
      {/* Contenido principal */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: "relative", 
          zIndex: 3,
          py: { xs: 8, md: 12 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "120vh",
          textAlign: "center"
        }}
      >
        {/* Título principal */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem", lg: "5rem" },
            fontWeight: "bold",
            lineHeight: 1.2,
            mb: 4,
            color: "#FFFFFF",
            textShadow: "2px 2px 8px rgba(0,0,0,0.8)"
          }}
        >
          Descubre tu pasión por la Música
        </Typography>
        
        {/* Descripción */}
        <Typography
          variant="h5"
          component="p"
          sx={{
            fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" },
            lineHeight: 1.6,
            mb: 8,
            maxWidth: "800px",
            color: "#FFFFFF",
            textShadow: "1px 1px 4px rgba(0,0,0,0.8)"
          }}
        >
          En VAC Escuela de Música ofrecemos clases personalizadas de música para todas las edades. 
          Nuestros profesores expertos te guiarán en tu viaje musical.
        </Typography>

        {/* Cards de características */}
        <Box 
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "1200px",
            width: "100%"
          }}
        >
          <ActionAreaCard
            image="/card1.svg"
            title="Horarios Flexibles"
            description="Adaptamos nuestros horarios a tu rutina diaria para que puedas aprender sin complicaciones."
          />
          <ActionAreaCard
            image="/card2.svg"
            title="Múltiples Instrumentos"
            description="Ofrecemos clases de guitarra, piano, violín, batería y muchos instrumentos más."
          />
          <ActionAreaCard
            image="/card3.svg"
            title="Profesores Expertos"
            description="Nuestro equipo de profesionales tiene años de experiencia en educación musical."
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;

