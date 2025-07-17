import React, { useState, useEffect } from 'react';
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
          // Ya tiene URL para visualización servida por el backend
          const fullUrl = `http://localhost:1230${material.viewUrl}${tokenParam}`;
          setImageUrl(fullUrl);
          console.log(`🖼️ Cargando imagen con URL de backend: ${fullUrl.substring(0, 100)}...`);
        } else {
          // Necesita generar nueva URL para visualización
          console.log(`🔗 Generando nueva URL para: ${material.filename}`);
          // Para visualización ahora usamos el endpoint serve directamente 
          const viewUrl = `http://localhost:1230/api/materials/serve/${material._id}${tokenParam}`;
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

    if (material) {
      loadImage();
    }
  }, [material]);

  // Verificar si es una imagen
  const isImage = material.filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);

  if (loading) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--table-header-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        ⏳ Cargando...
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
          backgroundColor: 'var(--warning-bg)',
          border: '1px solid var(--warning-border)',
          borderRadius: '4px',
          fontSize: '12px',
          color: 'var(--warning-text)',
          flexDirection: 'column',
          padding: '4px'
        }}
      >
        <div>❌</div>
        <div style={{ fontSize: '10px' }}>Error</div>
      </div>
    );
  }

  if (!isImage) {
    // Mostrar icono según tipo de archivo
    const getFileIcon = (filename) => {
      const ext = filename?.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'pdf': return '📄';
        case 'doc':
        case 'docx': return '📝';
        case 'mp3':
        case 'wav': return '🎵';
        case 'mp4':
        case 'avi': return '🎬';
        default: return '📁';
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
          backgroundColor: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          borderRadius: '4px',
          fontSize: '32px',
          flexDirection: 'column'
        }}
      >
        <div>{getFileIcon(material.filename)}</div>
        <div style={{ fontSize: '10px', color: 'var(--info-text)', marginTop: '2px' }}>
          {material.filename?.split('.').pop()?.toUpperCase()}
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={material.nombre || material.filename}
      style={{
        width,
        height,
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid var(--border-color)',
        cursor: 'pointer'
      }}
      onError={(e) => {
        console.error(`❌ Error cargando imagen: ${material.filename}`);
        setError('Error cargando imagen');
      }}
      onClick={() => {
        // Abrir imagen en nueva ventana para ver en tamaño completo
        if (imageUrl) {
          window.open(imageUrl, '_blank');
        }
      }}
      title={`Click para ver ${material.nombre || material.filename} en tamaño completo`}
    />
  );
};

export default ImageViewer;
