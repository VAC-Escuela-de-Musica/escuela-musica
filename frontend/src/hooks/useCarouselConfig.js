import { useState, useEffect } from 'react';

const CAROUSEL_CONFIG_KEY = 'carouselConfig';

export const useCarouselConfig = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar configuración al inicializar
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Primero intentar obtener desde el backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://146.83.198.35:1230'}/api/carousel/active-with-urls`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Hook - Datos del carrusel desde backend:', data);
        
        // Usar datos del backend como fuente principal
        const backendImages = Array.isArray(data) ? data : 
                             Array.isArray(data.data) ? data.data : [];
        
        if (backendImages.length > 0) {
          setSelectedImages(backendImages);
          setError(null);
          return;
        }
      }
      
      // Fallback a localStorage si no hay datos en el backend
      const savedConfig = localStorage.getItem(CAROUSEL_CONFIG_KEY);
      console.log('Hook - Fallback a localStorage:', savedConfig);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        console.log('Hook - Configuración localStorage parseada:', config);
        setSelectedImages(config.selectedImages || []);
      } else {
        // Si no hay nada, array vacío
        setSelectedImages([]);
      }
      
    } catch (error) {
      console.error('Error al cargar la configuración del carrusel:', error);
      setError(error.message);
      
      // Fallback a localStorage en caso de error de red
      try {
        const savedConfig = localStorage.getItem(CAROUSEL_CONFIG_KEY);
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setSelectedImages(config.selectedImages || []);
        }
      } catch (localError) {
        console.error('Error al cargar localStorage:', localError);
        setSelectedImages([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = (newSelectedImages) => {
    try {
      const config = {
        selectedImages: newSelectedImages,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(CAROUSEL_CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error al guardar la configuración del carrusel:', error);
    }
  };

  const addImage = (image) => {
    console.log('Hook - Agregando imagen:', image);
    const newSelectedImages = [...selectedImages, { ...image, orden: selectedImages.length }];
    console.log('Hook - Nuevas imágenes seleccionadas:', newSelectedImages);
    setSelectedImages(newSelectedImages);
    saveConfig(newSelectedImages);
  };

  const removeImage = (imageId) => {
    const newSelectedImages = selectedImages.filter(img => img._id !== imageId);
    // Reordenar las imágenes restantes
    newSelectedImages.forEach((img, index) => {
      img.orden = index;
    });
    setSelectedImages(newSelectedImages);
    saveConfig(newSelectedImages);
  };

  const reorderImages = (fromIndex, toIndex) => {
    const newSelectedImages = [...selectedImages];
    const [movedImage] = newSelectedImages.splice(fromIndex, 1);
    newSelectedImages.splice(toIndex, 0, movedImage);
    
    // Actualizar orden
    newSelectedImages.forEach((img, index) => {
      img.orden = index;
    });
    
    setSelectedImages(newSelectedImages);
    saveConfig(newSelectedImages);
  };

  const clearConfig = () => {
    setSelectedImages([]);
    localStorage.removeItem(CAROUSEL_CONFIG_KEY);
  };

  const isImageSelected = (imageId) => {
    return selectedImages.some(img => img._id === imageId);
  };

  const refreshFromBackend = () => {
    loadConfig();
  };

  return {
    selectedImages,
    loading,
    error,
    addImage,
    removeImage,
    reorderImages,
    clearConfig,
    isImageSelected,
    loadConfig,
    refreshFromBackend
  };
}; 