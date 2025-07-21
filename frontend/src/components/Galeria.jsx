import React from "react";

const imagenes = [
  "/galeria/1.jpg", "/galeria/2.jpg", "/galeria/3.jpg",
  "/galeria/4.jpg", "/galeria/5.jpg", "/galeria/6.jpg",
];

const Galeria = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#222222]">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-11/12 max-w-6xl">
        {imagenes.map((img, i) => (
          <img key={i} src={img} alt={`galeria-${i}`} className="w-full h-24 md:h-40 object-cover rounded-md" />
        ))}
      </div>
    </div>
  );
};

export default Galeria;