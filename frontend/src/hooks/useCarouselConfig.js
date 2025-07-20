import { useState, useEffect } from 'react';

const CAROUSEL_CONFIG_KEY = 'carouselConfig';

export const useCarouselConfig = () => {
  const [selectedImages, setSelectedImages] = useState([]);

  // Cargar configuración al inicializar
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(CAROUSEL_CONFIG_KEY);
      console.log('Hook - Configuración guardada:', savedConfig);
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        console.log('Hook - Configuración parseada:', config);
        setSelectedImages(config.selectedImages || []);
      }
    } catch (error) {
      console.error('Error al cargar la configuración del carrusel:', error);
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

  return {
    selectedImages,
    addImage,
    removeImage,
    reorderImages,
    clearConfig,
    isImageSelected,
    loadConfig
  };
}; 