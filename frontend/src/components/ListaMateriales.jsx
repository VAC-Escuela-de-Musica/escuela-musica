
// ...existing code...


// ...existing code...
import React, { useState, useEffect } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatFileSize, getFileTypeFromExtension, getFileTypeIcon } from '../utils/helpers';
import ImageViewer from './ImageViewer';
import './ListaMateriales.css';

const ListaMateriales = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  const { materials, loading, error, pagination, fetchMaterials, deleteMaterial, prevPage, nextPage } = useMaterials();
  
  // Estados para modales
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  // Estado para vista de lista vs grid
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'grid'
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Función para determinar si el usuario puede eliminar un material
  const canDeleteMaterial = (material) => {
    // Admin puede eliminar todo
    if (isAdmin()) return true;
    
    // El propietario puede eliminar su propio material
    if (material.usuario === user?.email) return true;
    
    // Nadie más puede eliminar
    return false;
  };

  // Funciones para manejo de vistas
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const toggleRowExpansion = (materialId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedRows(newExpanded);
  };

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
        <div className="header-left">
          <h1>Materiales</h1>
          <button 
            onClick={toggleViewMode} 
            className="view-toggle-btn"
            title={viewMode === 'grid' ? 'Cambiar a vista de lista' : 'Cambiar a vista de tarjetas'}
          >
            {viewMode === 'grid' ? '☰' : '⊞'} {viewMode === 'grid' ? 'Lista' : 'Tarjetas'}
          </button>
        </div>
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
          {/* Vista de Lista Compacta */}
          {viewMode === 'list' && (
            <div className="materials-table-container">
              <div className="materials-table-wrapper">
                <table className="materials-table">
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Tamaño</th>
                      <th>Fecha de subida</th>
                      {/* Admin: acceso y acciones, Profesor: solo acciones */}
                      {isAdmin() && <th>Acceso</th>}
                      {(isAdmin() || isTeacher()) && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {materials?.map((material) => (
                      <tr key={material._id}>
                        <td>
                          <a href={material.downloadUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                            {/* Icono según el tipo de archivo */}
                            {getFileTypeFromExtension(material.title) === 'PDF' && (
                              <span className="file-icon pdf">📄</span>
                            )}
                            {getFileTypeFromExtension(material.title) === 'Imagen' && (
                              <span className="file-icon image">🖼️</span>
                            )}
                            {getFileTypeFromExtension(material.title) === 'Audio' && (
                              <span className="file-icon audio">🎵</span>
                            )}
                            {getFileTypeFromExtension(material.title) === 'Video' && (
                              <span className="file-icon video">🎬</span>
                            )}
                            {getFileTypeFromExtension(material.title) === 'Archivo' && (
                              <span className="file-icon file">📎</span>
                            )}
                            {material.title}
                          </a>
                        </td>
                        <td>{material.fileSize ? formatFileSize(material.fileSize) : '-'}</td>
                        <td>{formatDate(material.createdAt)}</td>
                        {/* Admin: acceso */}
                        {isAdmin() && (
                          <td>
                            <span className={`privacy-badge ${material.isPublic ? 'public' : 'private'}`}>
                              {material.isPublic ? 'Público' : 'Privado'}
                            </span>
                          </td>
                        )}
                        {/* Acciones: admin puede eliminar todo, profesor solo los suyos */}
                        {(isAdmin() || isTeacher()) && (
                          <td>
                            {canDeleteMaterial(material) && (
                              <button
                                onClick={() => handleDeleteClick(material)}
                                className="action-btn delete-btn"
                                style={{marginLeft: 4}}
                              >
                                Eliminar
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vista de Tarjetas Original */}
          {viewMode === 'grid' && (
            <div className="materials-grid-container">
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

                    {/* Metadatos del archivo, condicionales por rol */}
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
                      {isAdmin() && (
                        <div className="metadata-item">
                          <span className="metadata-label">Acceso:</span>
                          <span className={`privacy-badge ${material.isPublic ? 'public' : 'private'}`}>
                            {material.isPublic ? 'Público' : 'Privado'}
                          </span>
                        </div>
                      )}
                      <div className="metadata-item">
                        <span className="metadata-label">Tamaño:</span>
                        <span>{material.fileSize ? formatFileSize(material.fileSize) : 'N/A'}</span>
                      </div>
                      {isAdmin() && (
                        <div className="metadata-item">
                          <span className="metadata-label">Propietario:</span>
                          <span>{material.usuario || '-'}</span>
                        </div>
                      )}
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
                          Descargar
                        </a>
                      )}
                      {(isAdmin() || isTeacher()) && canDeleteMaterial(material) && (
                        <button
                          onClick={() => handleDeleteClick(material)}
                          className="action-btn delete-btn"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}

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
