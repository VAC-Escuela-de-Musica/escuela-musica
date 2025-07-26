import React from "react";
import Navbar from "../components/domain/layout/Navbar";
import Hero from "../components/domain/public/Hero";
import CarouselClases from "../components/domain/public/Carrusel";
import CardsProfesores from "../components/domain/public/CardsProfesores";
import Galeria from "../components/domain/public/Galeria";
import Testimonios from "../components/domain/public/Testimonios";
import Footer from "../components/domain/layout/Footer";

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <CarouselClases />
      <CardsProfesores />
      <Galeria />
      <Testimonios />
      <Footer />
    </div>
  );
};

export default HomePage;
