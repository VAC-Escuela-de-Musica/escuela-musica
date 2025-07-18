import React, { useEffect, useState } from 'react';
import { useMaterials } from '../hooks/useMaterials.js';
import { useAuth } from './AuthProvider.jsx';
import ImageViewer from './ImageViewer';
import MaterialFilters from './MaterialFilters';
import { logger } from '../utils/logger.js';
import './darkmode.css';

const ListaMateriales = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  
  const { 
    materials, 
    loading, 
    error, 
    fetchMaterials, 
    searchMaterials,
    toggleFavorite,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    clearError 
  } = useMaterials();
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaterials();
    }
  }, [isAuthenticated, fetchMaterials]);

  const handleFilterChange = async (filters) => {
    setActiveFilters(filters);
    logger.filters('Aplicando filtros:', filters);
    
    // Si hay término de búsqueda, usar búsqueda
    if (filters.searchTerm) {
      await searchMaterials(filters.searchTerm, {
        category: filters.category,
        level: filters.level,
        instrument: filters.instrument,
        tags: filters.tags
      });
    } else {
      // Si no hay búsqueda, usar filtros normales
      await fetchMaterials({
        page: 1,
        filters: {
          category: filters.category,
          level: filters.level,
          instrument: filters.instrument,
          tags: filters.tags,
          isPublic: filters.isPublic
        }
      });
    }
  };

  const handleImageClick = (material) => {
    if (isImageFile(material.mimeType)) {
      setSelectedImage({
        url: material.viewUrl,
        title: material.title,
        description: material.description
      });
      setIsImageViewerOpen(true);
    }
  };

  const handleFavoriteToggle = async (materialId) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para marcar favoritos');
      return;
    }
    
    const result = await toggleFavorite(materialId);
    if (result.success) {
      logger.success('Favorito actualizado');
    } else {
      logger.error('Error actualizando favorito:', result.error);
    }
  };

  const isImageFile = (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  };

  const isPDFFile = (mimeType) => {
    return mimeType === 'application/pdf';
  };

  const isAudioFile = (mimeType) => {
    return mimeType && mimeType.startsWith('audio/');
  };

  const isVideoFile = (mimeType) => {
    return mimeType && mimeType.startsWith('video/');
  };

  const getFileIcon = (mimeType) => {
    if (isImageFile(mimeType)) return '🖼️';
    if (isPDFFile(mimeType)) return '📄';
    if (isAudioFile(mimeType)) return '🎵';
    if (isVideoFile(mimeType)) return '🎬';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      default: return level || 'No especificado';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="lista-materiales">
        <div className="no-auth-message">
          <h2>Acceso requerido</h2>
          <p>Debes iniciar sesión para ver los materiales.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lista-materiales">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando materiales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-materiales">
        <div className="error-container">
          <h2>Error al cargar materiales</h2>
          <p>{error}</p>
          <button onClick={clearError} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-materiales">
      <div className="header">
        <h1>📚 Materiales Educativos</h1>
        <div className="summary">
          <span>Total: {pagination.totalCount || materials.length} materiales</span>
          {user && (
            <span className="welcome">
              Bienvenido, {user.username || user.email}
            </span>
          )}
        </div>
      </div>

      <MaterialFilters 
        onFilterChange={handleFilterChange}
        loading={loading}
      />

      {materials.length === 0 ? (
        <div className="no-materials">
          <h2>No hay materiales disponibles</h2>
          <p>
            {Object.keys(activeFilters).length > 0 
              ? 'No se encontraron materiales con los filtros aplicados.'
              : 'No hay materiales para mostrar en este momento.'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="materials-grid">
            {materials.map((material) => (
              <div key={material._id} className="material-card">
                <div className="material-header">
                  <div className="material-type">
                    {getFileIcon(material.mimeType)}
                    <span className="file-type">{material.mimeType || 'Desconocido'}</span>
                  </div>
                  <div className="material-actions">
                    <button
                      onClick={() => handleFavoriteToggle(material._id)}
                      className={`favorite-btn ${material.isFavorite ? 'active' : ''}`}
                      title={material.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      {material.isFavorite ? '❤️' : '🤍'}
                    </button>
                  </div>
                </div>

                <div className="material-content">
                  <h3 className="material-title">{material.title}</h3>
                  <p className="material-description">{material.description}</p>
                  
                  <div className="material-metadata">
                    <div className="metadata-row">
                      <span className="label">Categoría:</span>
                      <span className="value">{material.category || 'Sin categoría'}</span>
                    </div>
                    
                    {material.level && (
                      <div className="metadata-row">
                        <span className="label">Nivel:</span>
                        <span 
                          className="value level-badge"
                          style={{ backgroundColor: getLevelColor(material.level) }}
                        >
                          {getLevelText(material.level)}
                        </span>
                      </div>
                    )}
                    
                    {material.instrument && (
                      <div className="metadata-row">
                        <span className="label">Instrumento:</span>
                        <span className="value">{material.instrument}</span>
                      </div>
                    )}
                    
                    {material.tags && material.tags.length > 0 && (
                      <div className="metadata-row">
                        <span className="label">Tags:</span>
                        <div className="tags-container">
                          {material.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="material-info">
                    <div className="info-row">
                      <span>Tamaño: {formatFileSize(material.fileSize)}</span>
                      <span>Fecha: {formatDate(material.createdAt)}</span>
                    </div>
                    <div className="info-row">
                      <span>Autor: {material.userId?.username || material.userId?.email || 'Desconocido'}</span>
                      <span className={`visibility ${material.isPublic ? 'public' : 'private'}`}>
                        {material.isPublic ? '🌍 Público' : '🔒 Privado'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="material-actions-footer">
                  {isImageFile(material.mimeType) && (
                    <button
                      onClick={() => handleImageClick(material)}
                      className="action-btn view-btn"
                    >
                      👁️ Ver
                    </button>
                  )}
                  
                  {material.viewUrl && (
                    <a
                      href={material.viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn view-btn"
                    >
                      🔗 Abrir
                    </a>
                  )}
                  
                  {material.downloadUrl && (
                    <a
                      href={material.downloadUrl}
                      download
                      className="action-btn download-btn"
                    >
                      ⬇️ Descargar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={prevPage}
                disabled={!pagination.hasPrevPage}
                className="pagination-btn"
              >
                ← Anterior
              </button>
              
              <div className="pagination-info">
                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <span>
                  ({pagination.totalCount} materiales total)
                </span>
              </div>
              
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className="pagination-btn"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        image={selectedImage}
      />
    </div>
  );
};

export default ListaMateriales;
