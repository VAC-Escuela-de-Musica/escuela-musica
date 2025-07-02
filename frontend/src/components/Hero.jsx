import React from "react";
import { useState } from "react";
import heroImg from "../assets/hero.jpg";
import ActionAreaCard from "./Card.jsx"; // Asegúrate de que la ruta sea correcta


const Hero = () => {

     const [mensaje, setMensaje] = useState("");
     const [visible, setVisible] = useState(false);

const toggleSaludo = async () => {
    if (visible) {
      // Si ya es visible, ocultamos el mensaje
      setVisible(false);
      setMensaje("");
    } else {
      // Si no está visible, pedimos el mensaje al backend
      try {
        const res = await fetch("http://localhost:1230/api/saludo");
        const data = await res.text();
        setMensaje(data);
        setVisible(true);
      } catch (error) {
        console.error("Error:", error);
        setMensaje("Error al conectar con el backend");
        setVisible(true);
      }
    }
  };

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
        <button
        onClick={toggleSaludo}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
      >
        {visible ? "ocultar saludo" : "Mostrar saludo"}
      </button>
        {mensaje && <p className="mt-4 text-xl">{mensaje}</p>}
        
        <div className="flex justify-center mt-10 gap-1 flex-wrap max-w-6xl mx-auto">
          <ActionAreaCard
            image="/ruta/imagen1.jpg"
            title="Horarios Flexibles"
            description="Aprende a tocar guitarra con profesores expertos."
          />
          <ActionAreaCard
            image="/ruta/imagen2.jpg"
            title="Multiples Instrumentos"
            description="Clases personalizadas de piano para todos los niveles."
          />
          <ActionAreaCard
            image="/ruta/imagen3.jpg"
            title="Profesores Expertos"
            description="Desarrolla tu voz con nuestras clases de canto."
          />
        </div>
      </div>
    </header>
  );
};

export default Hero;
