import { useState, useCallback } from 'react';

/**
 * Hook específico para upload de imágenes a MinIO
 * Capa 3 - Lógica específica del dominio de galería
 * 
 * @param {Object} options - Opciones del upload
 * @returns {Object} - Estados y funciones de upload
 */
export const useImageUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    compressionQuality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080
  } = options;

  // Estados
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [preview, setPreview] = useState(null);

  // Validación de archivo
  const validateFile = useCallback((file) => {
    const errors = [];

    if (!file) {
      errors.push('No se ha seleccionado ningún archivo');
      return { isValid: false, errors };
    }

    // Validar tipo
    if (!allowedFormats.includes(file.type)) {
      errors.push(`Formato no válido. Permitidos: ${allowedFormats.join(', ')}`);
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`Archivo demasiado grande. Máximo: ${maxSizeMB}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [allowedFormats, maxSize]);

  // Comprimir imagen si es necesario
  const compressImage = useCallback((file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Dibujar imagen comprimida
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          file.type,
          compressionQuality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth, maxHeight, compressionQuality]);

  // Generar preview
  const generatePreview = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Upload principal
  const uploadImage = useCallback(async (file, additionalData = {}) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Validar archivo
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Comprimir si es necesario
      let processedFile = file;
      if (file.size > 1024 * 1024) { // Comprimir si es > 1MB
        processedFile = await compressImage(file);
        console.log(`Imagen comprimida: ${file.size} → ${processedFile.size} bytes`);
      }

      // Generar preview
      generatePreview(processedFile);

      // Preparar FormData para upload
      const formData = new FormData();
      formData.append('image', processedFile);
      
      // Agregar datos adicionales
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Realizar upload a la API
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/galeria/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el upload');
      }

      const result = await response.json();
      setUploadedUrl(result.data.imageUrl);
      
      console.log('✅ Upload exitoso:', result.data.imageUrl);
      return {
        success: true,
        url: result.data.imageUrl,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error en upload:', error);
      setUploadError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setUploading(false);
    }
  }, [validateFile, compressImage, generatePreview]);

  // Upload múltiple
  const uploadMultipleImages = useCallback(async (files, additionalData = {}) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Subiendo imagen ${i + 1}/${files.length}: ${file.name}`);
      
      const result = await uploadImage(file, {
        ...additionalData,
        batch: true,
        batchIndex: i,
        batchTotal: files.length
      });
      
      results.push(result);
    }

    return results;
  }, [uploadImage]);

  // Limpiar estados
  const resetUpload = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedUrl(null);
    setPreview(null);
  }, []);

  // Eliminar imagen del servidor
  const deleteImage = useCallback(async (imageUrl) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/galeria/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });

      if (!response.ok) {
        throw new Error('Error al eliminar imagen');
      }

      console.log('✅ Imagen eliminada del servidor');
      return { success: true };

    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    // Estados
    uploading,
    uploadProgress,
    uploadError,
    uploadedUrl,
    preview,

    // Funciones
    uploadImage,
    uploadMultipleImages,
    validateFile,
    generatePreview,
    resetUpload,
    deleteImage,

    // Configuración
    options: {
      maxSize,
      allowedFormats,
      compressionQuality,
      maxWidth,
      maxHeight
    }
  };
};