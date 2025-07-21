import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CarouselClases from "../components/Carrusel";
import Profesores from "../components/Profesores";
import Galeria from "../components/Galeria";
import Testimonios from "../components/Testimonios";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <CarouselClases />
      <Profesores />
      <Galeria />
      <Testimonios />
      <Footer />
    </div>
  );
};

export default HomePage;
