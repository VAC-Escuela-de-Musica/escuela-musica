import React from "react";

const testimonios = [
  {
    nombre: "Lucía Fernández",
    cargo: "Estudiante de piano",
    opinion: "¡Las clases han sido transformadoras! Los profesores realmente se preocupan.",
    foto: "/lucia.jpg",
    estrellas: 5,
  },
];

const Testimonios = () => {
  return (
    <section className="my-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Testimonios</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {testimonios.map((t, i) => (
          <div key={i} className="flex gap-4 bg-white rounded-xl shadow p-4">
            <img src={t.foto} alt={t.nombre} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <p className="italic">"{t.opinion}"</p>
              <p className="font-bold mt-2">{t.nombre}</p>
              <p className="text-sm text-gray-500">{t.cargo}</p>
              <p>{"⭐".repeat(t.estrellas)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonios;
