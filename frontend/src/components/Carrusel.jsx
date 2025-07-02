import React, { useState } from "react";
import imagen from "../assets/imagenprueba.jpg";

const imagenes = [
  { src: imagen, alt: "Clase 1" },
  { src: imagen, alt: "Clase 2" },
  { src: imagen, alt: "Clase 3" },
];

const CarouselClases = () => {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  const next = () => setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));

  return (
    <section className="my-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-6">Últimas Clases</h2>
      <div className="relative max-w-2xl mx-auto aspect-video">
  <img
    src={imagenes[index].src}
    alt={imagenes[index].alt}
    className="w-full max-h-64 md:max-h-80 object-cover rounded-xl shadow-md"
  />
        <button
          onClick={prev}
          className="absolute top-1/2 left-2 -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100"
        >
          ◀
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100"
        >
          ▶
        </button>
      </div>
    </section>
  );
};

export default CarouselClases;
