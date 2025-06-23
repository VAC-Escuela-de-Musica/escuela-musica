// src/components/Hero.jsx
import React from "react";
import heroImg from "../assets/hero.jpg";

const Hero = () => {
  return (
    <header className="relative w-screen h-screen">
      <img
        src={heroImg}
        alt="Imagen principal"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Descubre tu pasión por la Música</h1>
        <p className="text-lg md:text-3xl">En VAC Escuela de Música ofrecemos clases personalizadas de música para todas las edades. Nuestro profesores expertos te guiarán en tu viaje musical.</p>
        <p className="bg-red-500 text-3xl">Texto de prueba</p>
      </div>
    </header>
  );
};

export default Hero;
