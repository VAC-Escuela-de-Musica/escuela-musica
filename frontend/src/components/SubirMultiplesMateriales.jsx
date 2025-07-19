import { useState, useEffect, useRef } from "react";
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import { logger } from '../utils/logger.js';
import './darkmode.css';
import './SubirMultiplesMateriales.css';

// Componente para mostrar tiempo transcurrido
function TiempoTranscurrido({ inicio }) {
  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio]);

  const minutos = Math.floor(tiempo / 60);
  const segundos = tiempo % 60;

  return (
    <div style={{ 
      marginTop: '8px', 
      fontSize: '12px', 
      color: '#666',
      fontFamily: 'monospace'
    }}>
      <span className="timer-icon">⏱️</span> Tiempo transcurrido: {minutos}:{segundos.toString().padStart(2, '0')}
      {tiempo > 30 && (
        <span style={{ color: '#ff9800', marginLeft: '10px' }}>
          <span className="warning-icon">⚠️</span> Subida tomando más tiempo del esperado
        </span>
      )}
    </div>
  );
}

function SubirMultiplesMateriales() {
  const [archivos, setArchivos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [materiales, setMateriales] = useState([]);
  const [progreso, setProgreso] = useState(''); // Nuevo estado para mostrar progreso
  const [tiempoInicio, setTiempoInicio] = useState(null); // Para mostrar tiempo transcurrido
  const fileInputRef = useRef(null);

  // Función para obtener la extensión del archivo
  const getFileExtension = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toUpperCase() : '';
  };

  // Función para verificar si el usuario es admin
  const isUserAdmin = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles?.some(role => role.name === 'admin' || role === 'admin');
    } catch (error) {
      console.error('Error decodificando token:', error);
      return false;
    }
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Crear objetos de material para cada archivo nuevo
    const nuevosArchivos = files.map(file => {
      // Extraer nombre sin extensión (maneja archivos con múltiples puntos)
      const nombreSinExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      return {
        file,
        nombre: nombreSinExtension,
        descripcion: '',
        bucketTipo: 'privado' // por defecto privado
      };
    });
    
    // Agregar a los archivos existentes
    const todosLosArchivos = [...archivos, ...nuevosArchivos];
    const todosMateriales = [...materiales, ...nuevosArchivos.map(a => ({
      ...a,
      nombre: a.nombre,
      descripcion: a.descripcion
    }))];
    
    setArchivos(todosLosArchivos);
    setMateriales(todosMateriales);
    
    // Limpiar el input file para permitir seleccionar de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Mostrar mensaje informativo
    const mensaje = nuevosArchivos.length === 1 
      ? `✅ Archivo "${nuevosArchivos[0].file.name}" agregado` 
      : `✅ ${nuevosArchivos.length} archivos agregados`;
    console.log(mensaje);
  };

  const handleMaterialChange = (index, field, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index][field] = value;
    setMateriales(nuevosMateriales);
  };

  const removeFile = (index) => {
    const nuevosArchivos = archivos.filter((_, i) => i !== index);
    const nuevosMateriales = materiales.filter((_, i) => i !== index);
    setArchivos(nuevosArchivos);
    setMateriales(nuevosMateriales);
    
    // Si no quedan archivos, limpiar el input
    if (nuevosArchivos.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);
    setTiempoInicio(Date.now());
    setProgreso('🔄 Iniciando subida...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('No hay token de autenticación. Por favor, inicia sesión.');
      setSubiendo(false);
      setProgreso('');
      return;
    }

    try {
      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        const materialData = materiales[i];
        
        setProgreso(`📤 Procesando archivo ${i + 1}/${archivos.length}: ${archivo.file.name}`);
        logger.upload(`Subiendo archivo ${i + 1}/${archivos.length}: ${archivo.file.name}`);
        
        // 1. Obtener URL pre-firmada para subida
        setProgreso(`🔗 Obteniendo URL de subida para: ${archivo.file.name}`);
        const extension = archivo.file.name.split('.').pop();
        logger.request('Solicitando URL pre-firmada...');
        logger.data('Datos enviados:', {
          extension,
          contentType: archivo.file.type,
          nombre: materialData.nombre,
          descripcion: materialData.descripcion,
          bucketTipo: materialData.bucketTipo
        });
        
        const urlResponse = await fetch(API_ENDPOINTS.materials.uploadUrl, {
          method: 'POST',
          headers: API_HEADERS.withAuth(),
          body: JSON.stringify({
            extension,
            contentType: archivo.file.type,
            nombre: materialData.nombre,
            descripcion: materialData.descripcion,
            bucketTipo: materialData.bucketTipo
          })
        });

        if (!urlResponse.ok) {
          const errorData = await urlResponse.text();
          logger.error('Error en URL response:', errorData);
          throw new Error(`Error obteniendo URL de subida: ${urlResponse.status} - ${errorData}`);
        }

        const responseData = await urlResponse.json();
        logger.structure('Respuesta completa del servidor:', responseData);
        
        // Extraer datos según la estructura de respuesta del backend
        const { uploadUrl, materialId, filename } = responseData.data || responseData;
        logger.success('URL pre-firmada obtenida:', { uploadUrl, materialId, filename });

        // Validar que tenemos todos los datos necesarios
        if (!uploadUrl || !materialId || !filename) {
          logger.error('Datos incompletos:', { uploadUrl: !!uploadUrl, materialId: !!materialId, filename: !!filename });
          throw new Error(`Datos incompletos del servidor: uploadUrl=${!!uploadUrl}, materialId=${!!materialId}, filename=${!!filename}`);
        }

        // 2. Subir archivo a MinIO usando la URL pre-firmada
        setProgreso(`📤 Subiendo archivo a MinIO: ${archivo.file.name}`);
        logger.upload('Subiendo archivo a MinIO...');
        logger.url('URL de subida:', uploadUrl);
        logger.file('Archivo info:', {
          name: archivo.file.name,
          size: archivo.file.size,
          type: archivo.file.type
        });
        
        // Crear AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 60000); // 60 segundos timeout
        
        try {
          // IMPORTANTE: NO enviar Authorization header con URL pre-firmada
          // Usar fetch original sin interceptor para evitar auth conflicts
          const originalFetch = window.fetch.__originalFetch || window.fetch;
          
          const uploadResponse = await originalFetch(uploadUrl, {
            method: 'PUT',
            body: archivo.file,
            headers: {
              'Content-Type': archivo.file.type
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId); // Limpiar timeout si la request se completa

          logger.data('Upload response status:', uploadResponse.status);
          logger.headers('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            logger.error('Error en upload response:', errorText);
            throw new Error(`Error subiendo archivo a MinIO: ${uploadResponse.status} - ${errorText}`);
          }
          logger.success('Archivo subido a MinIO exitosamente');
        } catch (uploadError) {
          clearTimeout(timeoutId);
          
          if (uploadError.name === 'AbortError') {
            throw new Error(`Timeout: La subida del archivo "${archivo.file.name}" tardó más de 60 segundos. Verifica tu conexión y el tamaño del archivo.`);
          } else if (uploadError.message.includes('fetch')) {
            throw new Error(`Error de red al subir "${archivo.file.name}". Verifica que MinIO esté disponible.`);
          } else {
            throw uploadError;
          }
        }

        // 3. Confirmar subida en el backend
        setProgreso(`✅ Confirmando subida: ${archivo.file.name}`);
        logger.success('Confirmando subida...');
        const confirmResponse = await fetch(API_ENDPOINTS.materials.confirmUpload, {
          method: 'POST',
          headers: API_HEADERS.withAuth(),
          body: JSON.stringify({
            materialId,
            nombre: materialData.nombre,
            descripcion: materialData.descripcion
          })
        });

        logger.data('Confirm response status:', confirmResponse.status);

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.text();
          logger.error('Error en confirm response:', errorData);
          throw new Error(`Error confirmando subida: ${confirmResponse.status} - ${errorData}`);
        }

        const confirmData = await confirmResponse.json();
        logger.success('Confirmación exitosa:', confirmData);
        logger.success(`Archivo completado: ${archivo.file.name}`);
      }

      setProgreso('🎉 ¡Todos los archivos subidos exitosamente!');
      alert(`✅ Todos los archivos (${archivos.length}) subidos exitosamente`);
      
      // Limpiar formulario
      setArchivos([]);
      setMateriales([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      logger.error('Error en la subida:', error);
      logger.stack('Stack trace:', error.stack);
      setProgreso(`❌ Error: ${error.message}`);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSubiendo(false);
      setTiempoInicio(null);
      // Limpiar progreso después de 3 segundos si fue exitoso
      setTimeout(() => {
        setProgreso('');
      }, 3000);
    }
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">
        Cargar Materiales
      </h1>
      <hr className="title-separator" />
      
      <form onSubmit={handleSubmit}>
        <div className="file-input-section">
          <h3 className="file-section-title">
            <span className="config-icon">📁</span> Agregar archivos:
          </h3>
          <input 
            ref={fileInputRef}
            id="archivos"
            type="file" 
            multiple 
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
            className="file-input"
          />
          {archivos.length > 0 && (
            <div className="selected-files-info">
              <div className="selected-files-count">
                <span className="count-icon">📎</span> 
                {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} seleccionado{archivos.length !== 1 ? 's' : ''}
              </div>
              <button 
                type="button" 
                className="clear-all-btn"
                onClick={() => {
                  setArchivos([]);
                  setMateriales([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                title="Limpiar todos los archivos"
              >
                🗑️ Limpiar todo
              </button>
            </div>
          )}
          <small className="file-help-text">
            Formatos soportados: PDF, JPG, PNG, DOCX, MP3, MP4<br/>
            <span className="help-tip">💡 Puedes agregar archivos de uno en uno, varios a la vez, e incluso el mismo archivo múltiples veces</span>
          </small>
        </div>

        {archivos.length > 0 && (
          <>
            <h2 className="config-section-title">
              Configurar Materiales
            </h2>
            <hr className="title-separator" />
            
            <div className="materials-config-section">
              {archivos.map((archivo, index) => (
              <div key={index} className="material-card">
                <div className="material-card-header">
                  <h4 className="material-card-title">
                    <span className="file-icon">📄</span> 
                    <span className="file-number">#{index + 1}</span>
                    <span className="file-name">{archivo.file.name}</span>
                    <span className="file-extension">{getFileExtension(archivo.file.name)}</span>
                  </h4>
                  <button 
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    title="Remover archivo"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="material-form-grid">
                  <div className="form-field">
                    <label className="form-label">
                      Nombre del material:
                    </label>
                    <input
                      type="text"
                      value={materiales[index]?.nombre || ''}
                      onChange={(e) => handleMaterialChange(index, 'nombre', e.target.value)}
                      className="form-input"
                      placeholder="Nombre descriptivo del material"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">
                      Tipo de acceso:
                    </label>
                    <select
                      value={materiales[index]?.bucketTipo || 'privado'}
                      onChange={(e) => handleMaterialChange(index, 'bucketTipo', e.target.value)}
                      className="form-select"
                    >
                      <option value="privado">
                        <span className="option-icon">🔒</span> Privado (solo miembros)
                      </option>
                      {isUserAdmin() && (
                        <option value="publico">
                          <span className="option-icon">🌐</span> Público (todos pueden ver)
                        </option>
                      )}
                    </select>
                    {!isUserAdmin() && (
                      <small className="form-help-text">
                        <span className="info-icon">ℹ️</span> Solo usuarios admin pueden subir contenido público
                      </small>
                    )}
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    Descripción:
                  </label>
                  <textarea
                    value={materiales[index]?.descripcion || ''}
                    onChange={(e) => handleMaterialChange(index, 'descripcion', e.target.value)}
                    rows="3"
                    className="form-textarea"
                    placeholder="Descripción opcional del material..."
                  />
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={subiendo || archivos.length === 0}
          className={`submit-button ${subiendo ? 'submit-button--loading' : ''}`}
        >
          {subiendo 
            ? (<><span className="loading-icon">⏳</span> Subiendo archivos...</>) 
            : (<><span className="upload-button-icon">📤</span> Subir {archivos.length} archivo{archivos.length !== 1 ? 's' : ''}</>)
          }
        </button>
      </form>

      {(subiendo || progreso) && (
        <div className={`progress-container ${progreso.includes('❌') ? 'progress-container--error' : ''}`}>
          <p className="progress-text">
            {progreso || (<><span className="loading-icon">⏳</span> Subiendo archivos... Por favor, no cierres esta ventana.</>)}
          </p>
          
          {tiempoInicio && (
            <TiempoTranscurrido inicio={tiempoInicio} />
          )}
          
          {subiendo && (
            <div className="progress-tips">
              <span className="tip-icon">💡</span> Si la subida tarda mucho, verifica:
              <ul className="tips-list">
                <li>Que el backend esté corriendo</li>
                <li>El tamaño del archivo (archivos grandes tardan más)</li>
                <li>Tu conexión a internet</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SubirMultiplesMateriales;
