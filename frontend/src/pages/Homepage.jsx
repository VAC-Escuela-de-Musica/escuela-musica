import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CarouselClases from "../components/Carrusel";
import CardsProfesores from "../components/CardsProfesores";
import Galeria from "../components/Galeria";
import Testimonios from "../components/Testimonios";
import Footer from "../components/Footer";

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
