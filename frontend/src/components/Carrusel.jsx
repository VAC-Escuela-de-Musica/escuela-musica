import Box from "@mui/material/Box";
import React from "react";

const CarouselClases = () => {
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
        <div className="bg-[#393939] rounded-3xl shadow-lg w-[1200px] h-[600px] flex items-center justify-center mx-auto">
        {/* Aquí irá tu carrusel */}
        <span className="text-white text-2xl">Carrusel aquí</span>
        </div>
      </div>
    </section>
  );
};

export default CarouselClases;