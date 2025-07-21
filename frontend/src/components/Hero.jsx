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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/saludo`);
        const data = await res.text();
        setMensaje(data);
        setVisible(true);
      } catch (error) {
        // ...existing code...
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
        className="absolute inset-0 w-full h-full object-cover brightness-60"
      />
      
      <div
    className="absolute bottom-0 left-0 w-full h-32 z-10 pointer-events-none"
    style={{
      background: "linear-gradient(to top, #222222 80%, transparent 100%)"
    }}
  />
      <div id="inicio" className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        {/* Puedes descomentar la siguiente línea si tienes un logo */}
        {/* <img
        //  src="/logo_blanco.svg"
        //  alt="Logo de la escuela"
        //  className="w-32 h-32 mb-6 shadow-lg"
        />
        */}
        <div style={{ width: "100%", height: "170px", opacity: 0 }}></div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4"
          style={{ fontSize: "5.2em", lineHeight: 1.1 }}>Descubre tu pasión por la Música</h1>
        <p className="text-lg md:text-3xl">En VAC Escuela de Música ofrecemos clases personalizadas de música para todas las edades. Nuestro profesores expertos te guiarán en tu viaje musical.</p>
        <button
        onClick={toggleSaludo}
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
      >
        {visible ? "ocultar saludo" : "Mostrar saludo"}
      </button>

        {mensaje && <p className="mt-4 text-xl">{mensaje}</p>}
        
        <div style={{ width: "100%", height: "170px", opacity: 0 }}></div>

        <div className="flex justify-center gap-1 flex-wrap max-w-6xl mx-auto mt-8">
          <ActionAreaCard
            image="/card1.svg"
            title="Horarios Flexibles"
            description="Aprende a tocar guitarra con profesores expertos."
          />
          <ActionAreaCard
            image="/card2.svg"
            title="Multiples Instrumentos"
            description="Clases personalizadas de piano para todos los niveles."
          />
          <ActionAreaCard
            image="/card3.svg"
            title="Profesores Expertos"
            description="Desarrolla tu voz con nuestras clases de canto."
          />
        </div>
      </div>
    </header>
  );
};

export default Hero;

