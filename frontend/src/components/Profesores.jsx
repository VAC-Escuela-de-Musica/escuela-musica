import React from "react";

const profesores = [
  {
    nombre: "María López",
    descripcion: "Especialista en canto lírico y técnica vocal.",
    imagen: "/profesores/maria.jpg",
  },
  {
    nombre: "Carlos Pérez",
    descripcion: "Profesor de guitarra clásica y eléctrica.",
    imagen: "/profesores/carlos.jpg",
  },
];

const Profesores = () => {
  return (
    <div className="space-y-10 mt-10">
      {profesores.map((profesor, i) => (
        <div key={i} className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-6`}>
          <img src={profesor.imagen} alt={profesor.nombre} className="w-48 h-48 object-cover rounded-full shadow-md" />
          <div>
            <h3 className="text-2xl font-semibold">{profesor.nombre}</h3>
            <p className="text-gray-600">{profesor.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profesores;
