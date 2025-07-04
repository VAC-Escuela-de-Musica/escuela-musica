import React from "react";
import mariaImg from "../assets/maria.png";

const profesores = [
  {
    nombre: "María López",
    descripcion: "Especialista en canto lírico y técnica vocal.",
    imagen: mariaImg,
  },
  {
    nombre: "Carlos Pérez",
    descripcion: "Profesor de guitarra clásica y eléctrica.",
    imagen: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60",
  },
];

const Profesores = () => {
  return (
    <div id="profesores" className="space-y-16 mt-16 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-[#232b3b] mb-8">
        Conoce a Nuestros Profesores
      </h1>
      {profesores.map((profesor, i) => (
        <div
          key={i}
          className={`flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl ${
            i % 2 !== 0 ? "md:flex-row-reverse" : ""
          }`}
        >
          <img
            src={profesor.imagen}
            alt={profesor.nombre}
            className="w-[350px] h-[350px] object-cover rounded-xl shadow-lg"
          />
          <div className="flex-1 flex flex-col justify-center items-start text-left">
            <div className="w-20 h-1 bg-blue-500 mb-4" />
            <h3 className="text-4xl font-bold text-[#232b3b] mb-4">{profesor.nombre}</h3>
            <p className="text-gray-500 mb-6">{profesor.descripcion}</p>
            <a
              href="#"
              className="text-blue-400 font-semibold flex items-center group"
            >
              Más
              <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profesores;