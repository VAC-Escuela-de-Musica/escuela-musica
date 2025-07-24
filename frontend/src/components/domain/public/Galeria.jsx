import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api';

function Galeria() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.galeria.activeWithUrls, {
          headers: API_HEADERS.basic
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar las imágenes');
        }
        
        const data = await response.json();
        // Ensure we're setting an array - handle both direct array and object with data property
        const imageArray = Array.isArray(data) ? data : (data.data || []);
        setImages(imageArray);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError(err.message);
        // Fallback a imágenes estáticas si hay error
        setImages([
          { id: 1, url: '/galeria/1.jpg', alt: 'Imagen 1' },
          { id: 2, url: '/galeria/2.jpg', alt: 'Imagen 2' },
          // ... resto de imágenes estáticas como fallback
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando galería...</div>;
  }

  if (error) {
    console.warn('Error en galería, usando imágenes por defecto:', error);
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#222222]">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-11/12 max-w-6xl">
        {images.map((img, i) => (
          <img 
            key={i} 
            src={typeof img === 'string' ? img : img.imagen || img.url} 
            alt={typeof img === 'object' ? img.titulo : `galeria-${i}`} 
            className="w-full h-24 md:h-40 object-cover rounded-md"
            onError={(e) => {
              // Fallback si la imagen no carga
              e.target.src = `/galeria/${i + 1}.jpg`;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Galeria;