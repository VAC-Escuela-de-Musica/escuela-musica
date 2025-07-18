import React, { useState, useEffect } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useAuth } from './AuthProvider.jsx';
import { formatDate, formatFileSize, getFileTypeFromExtension, getFileTypeIcon } from '../utils/helpers';
import ImageViewer from './ImageViewer';
import './ListaMateriales.css';

const ListaMateriales = () => {
  const { user } = useAuth();
  const { materials, loading, error, pagination, fetchMaterials, deleteMaterial, prevPage, nextPage } = useMaterials();
  
  // Estados para modales
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user, fetchMaterials]);

  // Manejar vista previa de imagen
  const handleImagePreview = (material) => {
    // Verificar si es una imagen usando ambos campos (compatibilidad)
    const mimeType = material.mimeType || material.tipoContenido;
    const imageUrl = material.viewUrl;
    
    if (imageUrl && mimeType && 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      setSelectedImage({
        url: imageUrl,
        title: material.title || material.nombre,
        description: material.description || material.descripcion,
        fileName: material.title || material.nombre,
        fileSize: material.fileSize || material.tamaño
      });
    } else {
      console.log('No se puede previsualizar:', { 
        imageUrl, 
        mimeType, 
        isImage: mimeType && mimeType.startsWith('image/') 
      });
    }
  };

  // Manejar eliminación
  const handleDeleteClick = (material) => {
    setDeleteConfirmation(material);
  };

  const confirmDelete = async () => {
    if (deleteConfirmation) {
      try {
        const result = await deleteMaterial(deleteConfirmation._id);
        if (result.success) {
          setDeleteConfirmation(null);
          // El hook ya recarga los materiales automáticamente
        } else {
          console.error('Error al eliminar material:', result.error);
          alert('Error al eliminar el material. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al eliminar material:', error);
        alert('Error al eliminar el material. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Obtener icono de tipo de archivo
  const getFileIcon = (mimeType) => {
    const icons = {
      'image/': '🖼️',
      'application/pdf': '📄',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'text/': '📄',
      'audio/': '🎵',
      'video/': '🎬',
    };
    
    for (const [type, icon] of Object.entries(icons)) {
      if (mimeType?.startsWith(type)) return icon;
    }
    return '📎';
  };

  // Estados de carga y error
  if (!user) {
    return (
      <div className="lista-materiales">
        <div className="no-auth-message">
          <h2>Acceso Restringido</h2>
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
          <button className="retry-button" onClick={fetchMaterials}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-materiales">
      {/* Header */}
      <div className="header">
        <h1>Materiales</h1>
        <div className="summary">
          <span className="welcome">Hola, {user?.nombre || user?.username || user?.email}</span>
          <span>{pagination?.totalCount || materials?.length || 0} materiales disponibles</span>
        </div>
      </div>

      {/* Lista de materiales */}
      {materials?.length === 0 ? (
        <div className="no-materials">
          <h2>No hay materiales disponibles</h2>
          <p>Los materiales aparecerán aquí cuando estén disponibles.</p>
        </div>
      ) : (
        <>
          <div className="materials-grid">
            {materials?.map((material) => (
              <div key={material._id} className="material-card">
                <div className="material-card-content">
                  {/* Header con miniatura e info básica */}
                  <div className="material-header">
                    <div 
                      className="material-thumbnail"
                      onClick={() => handleImagePreview(material)}
                      title={material.viewUrl ? "Click para ver imagen completa" : "Vista previa no disponible"}
                    >
                      {(material.viewUrl && 
                       (material.mimeType || material.tipoContenido) &&
                       ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(material.mimeType || material.tipoContenido)) ? (
                        <img 
                          src={material.viewUrl} 
                          alt={material.title}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <span className="material-thumbnail-icon">
                          {getFileIcon(material.mimeType || material.tipoContenido)}
                        </span>
                      )}
                    </div>
                    
                    <div className="material-info">
                      <h3 className="material-title">{material.title}</h3>
                      {material.description && (
                        <p className="material-description">{material.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Metadatos del archivo */}
                  <div className="material-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">Tipo:</span>
                      <span className="file-type-badge">
                        {getFileTypeFromExtension(material.title) || 'Archivo'}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Subido:</span>
                      <span>{formatDate(material.createdAt)}</span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Acceso:</span>
                      <span className={`privacy-badge ${material.isPublic ? 'public' : 'private'}`}>
                        {material.isPublic ? 'Público' : 'Privado'}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Tamaño:</span>
                      <span>{material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="material-actions">
                    {material.downloadUrl && (
                      <a 
                        href={material.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-btn download-btn"
                      >
                        ⬇️ Descargar
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteClick(material)}
                      className="action-btn delete-btn"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={!pagination.hasPrevPage}
                onClick={prevPage}
              >
                ← Anterior
              </button>
              
              <div className="pagination-info">
                <span>Página {pagination.page} de {pagination.totalPages}</span>
                <span>{pagination.totalCount} materiales en total</span>
              </div>
              
              <button
                className="pagination-btn"
                disabled={!pagination.hasNextPage}
                onClick={nextPage}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Confirmar eliminación</h3>
            </div>
            <div className="modal-content">
              <p>¿Estás seguro de que deseas eliminar este material?</p>
              <p><strong>{deleteConfirmation.title}</strong></p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="action-btn secondary-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="action-btn danger-btn"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista de imagen */}
      {selectedImage && (
        <ImageViewer
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />
      )}
    </div>
  );
};

export default ListaMateriales;
