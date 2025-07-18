import React, { useState, useRef } from 'react';
import { useMaterials } from '../hooks/useMaterials.js';
import { useAuth } from './AuthProvider.jsx';
import { logger } from '../utils/logger.js';
import './darkmode.css';
import './SubirMaterial.styles.css';

const SubirMaterial = () => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    instrument: '',
    tags: '',
    isPublic: false
  });

  const { 
    uploadMaterial, 
    uploadMultipleMaterials, 
    loading, 
    error,
    clearError 
  } = useMaterials();
  
  const { user, isAuthenticated, hasPermission } = useAuth();

  const categories = [
    'Partitura',
    'Ejercicio',
    'Método',
    'Teoría',
    'Grabación',
    'Video',
    'Otro'
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  const instruments = [
    'Piano',
    'Violín',
    'Guitarra',
    'Batería',
    'Canto',
    'Saxofón',
    'Trompeta',
    'Clarinete',
    'Flauta',
    'Otro'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    logger.files('Archivos seleccionados:', fileList.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    // Resetear progreso
    setUploadProgress({});
    
    if (fileList.length === 1) {
      handleSingleUpload(fileList[0]);
    } else {
      handleMultipleUpload(fileList);
    }
  };

  const handleSingleUpload = async (file) => {
    if (!validateForm()) return;

    try {
      setUploadProgress({ [file.name]: 0 });
      
      const materialData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const result = await uploadMaterial(file, materialData, (progress) => {
        setUploadProgress({ [file.name]: progress });
      });

      if (result.success) {
        logger.success('Material subido exitosamente');
        resetForm();
        setUploadProgress({});
      } else {
        logger.error('Error subiendo material:', result.error);
      }
    } catch (error) {
      logger.error('Error en la subida:', error);
      setUploadProgress({});
    }
  };

  const handleMultipleUpload = async (files) => {
    if (!validateForm()) return;

    try {
      // Inicializar progreso para todos los archivos
      const initialProgress = {};
      files.forEach(file => {
        initialProgress[file.name] = 0;
      });
      setUploadProgress(initialProgress);

      const materialData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const result = await uploadMultipleMaterials(files, materialData, (fileName, progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileName]: progress
        }));
      });

      if (result.success) {
        logger.success(`${files.length} materiales subidos exitosamente`);
        resetForm();
        setUploadProgress({});
      } else {
        logger.error('Error subiendo materiales:', result.error);
      }
    } catch (error) {
      logger.error('Error en la subida múltiple:', error);
      setUploadProgress({});
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Por favor, ingresa un título');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Por favor, ingresa una descripción');
      return false;
    }
    if (!formData.category) {
      alert('Por favor, selecciona una categoría');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      level: '',
      instrument: '',
      tags: '',
      isPublic: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="subir-material">
        <div className="no-auth-message">
          <h2>Acceso requerido</h2>
          <p>Debes iniciar sesión para subir materiales.</p>
        </div>
      </div>
    );
  }

  if (!hasPermission('upload_materials')) {
    return (
      <div className="subir-material">
        <div className="no-permission-message">
          <h2>Sin permisos</h2>
          <p>No tienes permisos para subir materiales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subir-material">
      <div className="header">
        <h1>📁 Subir Material</h1>
        <p>Comparte recursos educativos con la comunidad</p>
      </div>

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={clearError} className="close-error-btn">✕</button>
        </div>
      )}

      <div className="upload-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-section">
            <h3>Información del Material</h3>
            
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Ejercicios de escalas para piano"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el contenido del material..."
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level">Nivel</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un nivel</option>
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="instrument">Instrumento</label>
                <select
                  id="instrument"
                  name="instrument"
                  value={formData.instrument}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona un instrumento</option>
                  {instruments.map(instrument => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Ej: principiante, escalas, ejercicios"
                />
                <small>Separa las etiquetas con comas</small>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                />
                <span>Hacer público este material</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Seleccionar Archivos</h3>
            
            <div
              className={`file-drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.avi,.mov"
                style={{ display: 'none' }}
              />
              
              <div className="drop-zone-content">
                <div className="drop-zone-icon">📁</div>
                <p>Arrastra archivos aquí o haz clic para seleccionar</p>
                <p className="file-types">
                  Formatos soportados: PDF, DOC, DOCX, JPG, PNG, GIF, MP3, MP4, WAV, AVI, MOV
                </p>
              </div>
            </div>

            {/* Progreso de subida */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="upload-progress">
                <h4>Progreso de subida</h4>
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="progress-item">
                    <div className="progress-info">
                      <span className="file-name">{fileName}</span>
                      <span className="progress-percent">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Subiendo material...</p>
        </div>
      )}
    </div>
  );
};

export default SubirMaterial;
