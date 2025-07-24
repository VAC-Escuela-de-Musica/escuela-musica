import React, { useState, useEffect } from 'react';
import { useMaterials } from '../../../hooks/useMaterials.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { logger } from '../../../utils/logger.js';
import './darkmode.css';
import './ImageViewer.styles.css';
import '../layout/darkmode.css';

const ImageViewer = ({ isOpen, onClose, image }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && image) {
      setImageLoaded(false);
      setImageError(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      logger.images('Abriendo visor de imagen:', image.title);
    }
  }, [isOpen, image]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    logger.images('Imagen cargada exitosamente');
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
    logger.error('Error cargando imagen en el visor');
  };

  const handleClose = () => {
    onClose();
    // Reset state when closing
    setTimeout(() => {
      setImageLoaded(false);
      setImageError(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }, 300);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case '0':
        handleZoomReset();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, isDragging, dragStart, position]);

  if (!isOpen || !image) {
    return null;
  }

  return (
    <div className="image-viewer-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div className="image-viewer-container" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {console.log('🖼️ Modal is rendering with display styles')}
        {/* Header con título y controles */}
        <div className="image-viewer-header">
          <div className="image-info">
            <h3 className="image-title">{image.title}</h3>
            {image.description && (
              <p className="image-description">{image.description}</p>
            )}
          </div>
          <div className="header-controls">
            <button
              onClick={handleZoomOut}
              className="control-btn"
              disabled={zoom <= 0.5}
              title="Alejar (tecla -)"
            >
              🔍➖
            </button>
            <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="control-btn"
              disabled={zoom >= 3}
              title="Acercar (tecla +)"
            >
              🔍➕
            </button>
            <button
              onClick={handleZoomReset}
              className="control-btn"
              title="Restablecer zoom (tecla 0)"
            >
              🔄
            </button>
            <button
              onClick={handleClose}
              className="close-btn"
              title="Cerrar (tecla Escape)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Área de imagen */}
        <div className="image-viewer-content">
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <div className="loading-spinner"></div>
              <p>Cargando imagen...</p>
            </div>
          )}

          {imageError && (
            <div className="image-error">
              <div className="error-icon">❌</div>
              <p>Error al cargar la imagen</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Reintentar
              </button>
            </div>
          )}

          {image.url && (
            <div 
              className="image-container"
              style={{
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
            >
              <img
                src={image.url}
                alt={image.title}
                className="viewer-image"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  opacity: imageLoaded ? 1 : 0
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Footer con información adicional */}
        <div className="image-viewer-footer">
          <div className="image-meta">
            <span className="meta-item">
              📁 {image.fileName || 'Imagen'}
            </span>
            {image.fileSize && (
              <span className="meta-item">
                📊 {formatFileSize(image.fileSize)}
              </span>
            )}
            {image.dimensions && (
              <span className="meta-item">
                📐 {image.dimensions.width} × {image.dimensions.height}
              </span>
            )}
          </div>
          
          <div className="keyboard-shortcuts">
            <small>
              <strong>Atajos:</strong> ESC (cerrar), +/- (zoom), 0 (restablecer), arrastrar para mover
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente simple para mostrar miniaturas
export const ImageThumbnail = ({ material, width = '100px', height = '100px', onClick }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (material && material.viewUrl) {
          setThumbnailUrl(material.viewUrl);
          logger.thumbnail('Cargando miniatura:', material.title);
        } else {
          throw new Error('No hay URL de visualización');
        }
      } catch (err) {
        logger.error('Error cargando miniatura:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (material && material._id) {
      loadThumbnail();
    }
  }, [material]);

  const isImage = material?.mimeType?.startsWith('image/');

  if (loading) {
    return (
      <div 
        className="thumbnail-container loading"
        style={{ width, height }}
      >
        <div className="thumbnail-spinner"></div>
      </div>
    );
  }

  if (error || !isImage) {
    const getFileIcon = (mimeType) => {
      if (!mimeType) return '📄';
      if (mimeType.includes('pdf')) return '📕';
      if (mimeType.includes('document')) return '📘';
      if (mimeType.includes('spreadsheet')) return '📗';
      if (mimeType.includes('presentation')) return '📙';
      if (mimeType.includes('text')) return '📝';
      if (mimeType.includes('audio')) return '🎵';
      if (mimeType.includes('video')) return '🎬';
      if (mimeType.includes('archive')) return '📦';
      return '📄';
    };

    return (
      <div 
        className="thumbnail-container file-icon"
        style={{ width, height }}
        onClick={onClick}
      >
        <span className="file-icon-emoji">
          {getFileIcon(material?.mimeType)}
        </span>
        <span className="file-extension">
          {material?.mimeType?.split('/').pop()?.toUpperCase() || 'FILE'}
        </span>
      </div>
    );
  }

  return (
    <div 
      className="thumbnail-container image"
      style={{ width, height }}
      onClick={onClick}
    >
      <img
        src={thumbnailUrl}
        alt={material.title}
        className="thumbnail-image"
        onLoad={() => logger.thumbnail('Miniatura cargada:', material.title)}
        onError={(e) => {
          logger.error('Error cargando miniatura:', e);
          setError('Error al cargar miniatura');
        }}
      />
      <div className="thumbnail-overlay">
        <span className="view-icon">👁️</span>
      </div>
    </div>
  );
};

// Función utilitaria para formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default ImageViewer;
