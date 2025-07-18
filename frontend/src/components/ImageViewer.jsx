import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS, API_UTILS } from '../config/api.js';
import './darkmode.css';

const ImageViewer = ({ material, width = "100px", height = "100px" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔄 Cargando imagen: ${material.filename}, ID: ${material._id}, tipo: ${material.bucketTipo}`);
        
        // Obtener el token de autenticación solo para materiales privados
        let tokenParam = '';
        if (material.bucketTipo !== 'publico') {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error(`❌ No hay token para material privado: ${material.filename}`);
            throw new Error('No hay token de autenticación para material privado');
          }
          tokenParam = `?token=${encodeURIComponent(token)}`;
        }

        if (material.viewUrl) {
          // Ya tiene URL prefirmada del backend
          const baseUrl = API_UTILS.config.baseUrl;
          const fullUrl = `${baseUrl}${material.viewUrl}${tokenParam}`;
          setImageUrl(fullUrl);
          console.log(`🖼️ Cargando imagen con URL de backend: ${fullUrl.substring(0, 100)}...`);
        } else {
          // Necesita generar nueva URL para visualización
          console.log(`🔗 Generando nueva URL para: ${material.filename}`);
          // Para visualización ahora usamos el endpoint serve directamente 
          const viewUrl = API_ENDPOINTS.files.serve(material._id) + tokenParam;
          setImageUrl(viewUrl);
          console.log(`✅ URL de visualización generada: ${viewUrl.substring(0, 100)}...`);
        }
      } catch (err) {
        console.error(`❌ Error cargando imagen ${material.filename}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (material && material._id) {
      loadImage();
    }
  }, [material]);

  if (loading) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        <span style={{ fontSize: '12px', color: '#666' }}>⏳</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#ffe6e6',
          border: '1px solid #ff9999',
          borderRadius: '4px',
          flexDirection: 'column'
        }}
      >
        <span style={{ fontSize: '12px', color: '#cc0000', marginBottom: '2px' }}>❌</span>
        <span style={{ fontSize: '10px', color: '#cc0000', textAlign: 'center', padding: '2px' }}>
          {error.substring(0, 20)}...
        </span>
      </div>
    );
  }

  // Determinar si es una imagen
  const isImage = material.filename && 
    (material.filename.toLowerCase().endsWith('.jpg') ||
     material.filename.toLowerCase().endsWith('.jpeg') ||
     material.filename.toLowerCase().endsWith('.png') ||
     material.filename.toLowerCase().endsWith('.gif') ||
     material.filename.toLowerCase().endsWith('.webp') ||
     material.filename.toLowerCase().endsWith('.svg'));

  if (!isImage) {
    // Mostrar icono para archivos no imagen
    const getFileIcon = (filename) => {
      if (!filename) return '📄';
      const ext = filename.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'pdf': return '📕';
        case 'doc':
        case 'docx': return '📘';
        case 'xls':
        case 'xlsx': return '📗';
        case 'ppt':
        case 'pptx': return '📙';
        case 'txt': return '📝';
        case 'mp3':
        case 'wav':
        case 'flac': return '🎵';
        case 'mp4':
        case 'avi':
        case 'mov': return '🎬';
        case 'zip':
        case 'rar':
        case '7z': return '📦';
        default: return '📄';
      }
    };

    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          flexDirection: 'column'
        }}
      >
        <span style={{ fontSize: '24px', marginBottom: '4px' }}>
          {getFileIcon(material.filename)}
        </span>
        <span style={{ fontSize: '10px', color: '#6c757d', textAlign: 'center' }}>
          {material.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width, height, position: 'relative' }}>
      <img
        src={imageUrl}
        alt={material.filename}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}
        onLoad={() => {
          console.log(`✅ Imagen cargada exitosamente: ${material.filename}`);
        }}
        onError={(e) => {
          console.error(`❌ Error cargando imagen ${material.filename}:`, e);
          setError('Error al cargar imagen');
        }}
      />
    </div>
  );
};

export default ImageViewer;
