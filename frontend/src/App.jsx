import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import React from "react";
import Hero from "./components/Hero";
import CarouselClases from "./components/Carrusel";
import Profesores from "./components/Profesores";
import Galeria from "./components/Galeria";
import Testimonios from "./components/Testimonios";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <CarouselClases />
      <Profesores />
      <Galeria />
      <Testimonios />
      <Footer />
    </div>
  );
}

export default App;