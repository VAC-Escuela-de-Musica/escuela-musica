import React, { useEffect, useState } from 'react';
import ImageViewer from './ImageViewer';
import MaterialFilters from './MaterialFilters';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import { logger } from '../utils/logger.js';
import './darkmode.css';

const ListaMateriales = () => {
  const [materiales, setMateriales] = useState([]);
  const [materialesFiltrados, setMaterialesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        logger.materials('Obteniendo lista de materiales...');
        logger.token('Token:', token ? 'Presente' : 'Ausente');
        logger.endpoint('URL del endpoint:', API_ENDPOINTS.materials.list);
        
        // Usar la configuración centralizada
        const res = await fetch(API_ENDPOINTS.materials.list, {
          headers: API_HEADERS.withAuth()
        });
        
        logger.response('Status de respuesta:', res.status, res.statusText);
        logger.headers('Headers de respuesta:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ Error text response:', errorText);
          throw new Error(`Error HTTP: ${res.status} - ${errorText}`);
        }
        
        const response = await res.json();
        logger.success('Materiales obtenidos - respuesta completa:', response);
        logger.structure('Estructura de respuesta detallada:', {
          success: response.success,
          statusCode: response.statusCode,
          hasData: !!response.data,
          dataType: typeof response.data,
          dataIsArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 'No es array',
          allKeys: Object.keys(response)
        });
        
        // Extraer datos usando el nuevo formato de respuesta
        let materialesData = [];
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Nuevo formato: { success: true, data: [...] }
          materialesData = response.data;
          logger.format('Usando nuevo formato response.data');
        } else if (response.data && Array.isArray(response.data)) {
          // Formato con data: { data: [...] }
          materialesData = response.data;
          logger.format('Usando response.data');
        } else if (Array.isArray(response)) {
          // Formato directo: [...]
          materialesData = response;
          logger.format('Usando response directamente');
        } else if (response.materiales && Array.isArray(response.materiales)) {
          // Formato legacy: { materiales: [...] }
          materialesData = response.materiales;
          logger.format('Usando response.materiales');
        } else {
          logger.warn('Formato de respuesta no reconocido, usando array vacío');
          materialesData = [];
        }
        
        logger.final('Materiales finales a mostrar:', materialesData);
        logger.finalCount('Cantidad final de materiales:', materialesData.length);
        
        if (materialesData.length > 0) {
          logger.first('Primer material como ejemplo:', materialesData[0]);
        }
        
        setMateriales(materialesData);
        setMaterialesFiltrados(materialesData); // Inicializar filtrados con todos los materiales
        
      } catch (err) {
        console.error('❌ Error obteniendo materiales:', err);
        console.error('❌ Stack trace:', err.stack);
        
        // Detectar error de conexión
        if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          setError('No se puede conectar al servidor backend. Asegúrate de que esté corriendo en http://localhost:1230');
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchMateriales();
  }, []);

  const handleDownload = async (materialId, filename) => {
    try {
      // Ya no necesitamos obtener una URL prefirmada, podemos usar directamente la URL del backend
      logger.download(`Descargando archivo: ${filename}`);
      
      // Buscar el material en la lista para determinar si es público o privado
      const material = materiales.find(m => m._id === materialId);
      
      if (!material) {
        throw new Error('Material no encontrado');
      }
      
      // Crear enlace de descarga usando la configuración centralizada
      const link = document.createElement('a');
      link.href = API_ENDPOINTS.files.download(materialId);
      
      // Añadir token si es necesario (material privado)
      if (material.bucketTipo !== 'publico') {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación para material privado');
        }
        link.href += `?token=${encodeURIComponent(token)}`;
      }
      
      link.download = filename;
      link.style.display = 'none';
      
      logger.download(`Iniciando descarga: ${link.href.substring(0, 100)}...`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('❌ Error descargando:', error);
      alert(`Error descargando archivo: ${error.message}`);
    }
  };

  const handleDelete = async (materialId, filename) => {
    if (!confirm(`¿Estás seguro de eliminar "${filename}"?`)) {
      return;
    }
    
    try {
      logger.log(`🗑️ Eliminando material: ${materialId}`);
      
      const response = await fetch(API_ENDPOINTS.materials.delete(materialId), {
        method: 'DELETE',
        headers: API_HEADERS.withAuth()
      });
      
      logger.data(`Delete response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Error en delete response:', errorData);
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      
      const result = await response.json();
      logger.success('Material eliminado exitosamente:', result);
      
      // Actualizar la lista local sin recargar la página
      setMateriales(prev => prev.filter(m => m._id !== materialId));
      setMaterialesFiltrados(prev => prev.filter(m => m._id !== materialId));
      
      alert('✅ Material eliminado exitosamente');
      
    } catch (error) {
      console.error('❌ Error eliminando:', error);
      alert(`❌ Error eliminando archivo: ${error.message}`);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p>⏳ Cargando materiales...</p>
    </div>
  );
  
  if (error) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <p style={{ color: 'var(--danger-color)', marginBottom: '15px' }}>❌ Error: {error}</p>
      
      {error.includes('conectar al servidor') && (
        <div className="alert-warning" style={{ 
          borderRadius: '4px', 
          padding: '15px', 
          marginBottom: '15px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🔧 Solución:</h4>
          <ol style={{ paddingLeft: '20px' }}>
            <li>Abre una terminal en la carpeta <code>backend</code></li>
            <li>Ejecuta: <code>npm run dev</code></li>
            <li>Espera a que aparezca: "Servidor corriendo en localhost:1230"</li>
            <li>Recarga esta página</li>
          </ol>
        </div>
      )}
      
      <button 
        className="btn-primary"
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        🔄 Reintentar
      </button>
    </div>
  );
  
  if (!materiales.length) {
    logger.warn('Mostrando mensaje "No hay materiales" porque:', {
      materialesLength: materiales.length,
      materialesArray: materiales,
      isArray: Array.isArray(materiales)
    });
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>📁 No hay materiales subidos para tu rol.</p>
        <div style={{ marginTop: '15px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Los materiales visibles dependen de tu rol:
          </p>
          <ul style={{ 
            textAlign: 'left', 
            display: 'inline-block', 
            fontSize: '14px', 
            color: 'var(--text-muted)' 
          }}>
            <li>👑 Admin: Ve todos los materiales</li>
            <li>👨‍🏫 Profesor: Ve sus materiales + públicos</li>
            <li>👤 Usuario: Solo materiales públicos</li>
          </ul>
        </div>
        <button 
          className="btn-primary"
          onClick={() => window.location.reload()} 
          style={{ 
            marginTop: '10px',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          🔄 Recargar página
        </button>
      </div>
    );
  }

  logger.finalRender('Renderizando lista con', materialesFiltrados.length, 'materiales filtrados de', materiales.length, 'totales');

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
    
      <MaterialFilters 
        materiales={materiales}
        onFilterChange={setMaterialesFiltrados}
      />
      
      <div style={{ overflowX: 'auto' }}>
        <table className="material-table" style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>
                🖼️ Vista Previa
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                📄 Información
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                👤 Usuario
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                🔒 Tipo
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                📅 Fecha
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>
                ⚡ Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {materialesFiltrados.map((material) => (
              <tr key={material._id}>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <ImageViewer 
                    material={material} 
                    width="80px" 
                    height="80px" 
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <strong>{material.nombre || 'Sin nombre'}</strong>
                  <br />
                  <small style={{ color: 'var(--text-muted)' }}>
                    📁 {material.filename || material.nombreArchivo}
                  </small>
                  {material.descripcion && (
                    <>
                      <br />
                      <small style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        📝 {material.descripcion}
                      </small>
                    </>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      backgroundColor: 'var(--success-color)',
                      color: 'white',
                      textAlign: 'center',
                      width: 'fit-content'
                    }}>
                      👤 Usuario
                    </span>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {material.usuario}
                    </small>
                  </div>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: material.bucketTipo === 'publico' ? 'var(--success-color)' : 'var(--danger-color)',
                    color: 'white'
                  }}>
                    {material.bucketTipo === 'publico' ? '🌐 Público' : '🔒 Privado'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {new Date(material.fechaSubida).toLocaleDateString('es-ES')}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {material.downloadUrl ? (
                      // Si ya tiene URL directa del backend
                      <a 
                        href={`http://localhost:1230${material.downloadUrl}${material.bucketTipo !== 'publico' ? `?token=${encodeURIComponent(localStorage.getItem('token') || '')}` : ''}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{
                          padding: '6px 12px',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        📥 Descargar
                      </a>
                    ) : (
                      // Fallback por si no tiene URL
                      <button 
                        onClick={() => handleDownload(material._id, material.filename)}
                        className="btn-primary"
                        style={{
                          padding: '6px 12px',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📥 Descargar
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(material._id, material.nombre)}
                      className="btn-danger"
                      style={{
                        padding: '6px 12px',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                  
                  {material.urlType === 'presigned' && material.urlExpiresAt && (
                    <div style={{ marginTop: '4px' }}>
                      <small style={{ color: 'var(--text-muted)' }}>
                        URL expira: {new Date(material.urlExpiresAt).toLocaleTimeString('es-ES')}
                      </small>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaMateriales;
