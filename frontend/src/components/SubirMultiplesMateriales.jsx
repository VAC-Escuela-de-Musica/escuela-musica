import { useState, useEffect } from "react";
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import './darkmode.css';

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
      ⏱️ Tiempo transcurrido: {minutos}:{segundos.toString().padStart(2, '0')}
      {tiempo > 30 && (
        <span style={{ color: '#ff9800', marginLeft: '10px' }}>
          ⚠️ Subida tomando más tiempo del esperado
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
    // Crear objetos de material para cada archivo
    const nuevosArchivos = files.map(file => ({
      file,
      nombre: file.name.split('.')[0], // nombre sin extensión
      descripcion: '',
      bucketTipo: 'privado' // por defecto privado
    }));
    setArchivos(nuevosArchivos);
    setMateriales(nuevosArchivos.map(a => ({
      ...a,
      nombre: a.nombre,
      descripcion: a.descripcion
    })));
  };

  const handleMaterialChange = (index, field, value) => {
    const nuevosMateriales = [...materiales];
    nuevosMateriales[index][field] = value;
    setMateriales(nuevosMateriales);
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
        console.log(`📤 Subiendo archivo ${i + 1}/${archivos.length}: ${archivo.file.name}`);
        
        // 1. Obtener URL pre-firmada para subida
        setProgreso(`🔗 Obteniendo URL de subida para: ${archivo.file.name}`);
        const extension = archivo.file.name.split('.').pop();
        console.log('🔗 Solicitando URL pre-firmada...');
        console.log('📊 Datos enviados:', {
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
          console.error('❌ Error en URL response:', errorData);
          throw new Error(`Error obteniendo URL de subida: ${urlResponse.status} - ${errorData}`);
        }

        const responseData = await urlResponse.json();
        console.log('🔍 Respuesta completa del servidor:', responseData);
        
        // Extraer datos según la estructura de respuesta del backend
        const { uploadUrl, materialId, filename } = responseData.data || responseData;
        console.log('✅ URL pre-firmada obtenida:', { uploadUrl, materialId, filename });

        // Validar que tenemos todos los datos necesarios
        if (!uploadUrl || !materialId || !filename) {
          console.error('❌ Datos incompletos:', { uploadUrl: !!uploadUrl, materialId: !!materialId, filename: !!filename });
          throw new Error(`Datos incompletos del servidor: uploadUrl=${!!uploadUrl}, materialId=${!!materialId}, filename=${!!filename}`);
        }

        // 2. Subir archivo a MinIO usando la URL pre-firmada
        setProgreso(`📤 Subiendo archivo a MinIO: ${archivo.file.name}`);
        console.log('📤 Subiendo archivo a MinIO...');
        console.log('🔗 URL de subida:', uploadUrl);
        console.log('📄 Archivo info:', {
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
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: archivo.file,
            headers: {
              'Content-Type': archivo.file.type
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId); // Limpiar timeout si la request se completa

          console.log('📊 Upload response status:', uploadResponse.status);
          console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('❌ Error en upload response:', errorText);
            throw new Error(`Error subiendo archivo a MinIO: ${uploadResponse.status} - ${errorText}`);
          }
          console.log('✅ Archivo subido a MinIO exitosamente');
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
        console.log('✅ Confirmando subida...');
        const confirmResponse = await fetch(API_ENDPOINTS.materials.confirmUpload, {
          method: 'POST',
          headers: API_HEADERS.withAuth(),
          body: JSON.stringify({
            materialId,
            nombre: materialData.nombre,
            descripcion: materialData.descripcion
          })
        });

        console.log('📊 Confirm response status:', confirmResponse.status);

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.text();
          console.error('❌ Error en confirm response:', errorData);
          throw new Error(`Error confirmando subida: ${confirmResponse.status} - ${errorData}`);
        }

        const confirmData = await confirmResponse.json();
        console.log('✅ Confirmación exitosa:', confirmData);
        console.log(`✅ Archivo completado: ${archivo.file.name}`);
      }

      setProgreso('🎉 ¡Todos los archivos subidos exitosamente!');
      alert(`✅ Todos los archivos (${archivos.length}) subidos exitosamente`);
      
      // Limpiar formulario
      setArchivos([]);
      setMateriales([]);
      document.querySelector('input[type="file"]').value = '';
      
    } catch (error) {
      console.error('❌ Error en la subida:', error);
      console.error('❌ Stack trace:', error.stack);
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📁 Subir Materiales</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="archivos" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Seleccionar archivos:
          </label>
          <input 
            id="archivos"
            type="file" 
            multiple 
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
            style={{ 
              padding: '10px',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              width: '100%'
            }}
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Formatos soportados: PDF, JPG, PNG, DOCX, MP3, MP4
          </small>
        </div>

        {archivos.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>📝 Configurar materiales:</h3>
            {archivos.map((archivo, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                marginBottom: '10px',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                  📄 {archivo.file.name}
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Nombre del material:
                    </label>
                    <input
                      type="text"
                      value={materiales[index]?.nombre || ''}
                      onChange={(e) => handleMaterialChange(index, 'nombre', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                      placeholder="Nombre descriptivo del material"
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Tipo de acceso:
                    </label>
                    <select
                      value={materiales[index]?.bucketTipo || 'privado'}
                      onChange={(e) => handleMaterialChange(index, 'bucketTipo', e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}
                    >
                      <option value="privado">🔒 Privado (solo miembros)</option>
                      {isUserAdmin() && (
                        <option value="publico">🌐 Público (todos pueden ver)</option>
                      )}
                    </select>
                    {!isUserAdmin() && (
                      <small style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        ℹ️ Solo usuarios admin pueden subir contenido público
                      </small>
                    )}
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Descripción:
                  </label>
                  <textarea
                    value={materiales[index]?.descripcion || ''}
                    onChange={(e) => handleMaterialChange(index, 'descripcion', e.target.value)}
                    rows="3"
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      border: '1px solid #ccc', 
                      borderRadius: '4px',
                      resize: 'vertical'
                    }}
                    placeholder="Descripción opcional del material..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          disabled={subiendo || archivos.length === 0}
          style={{
            backgroundColor: subiendo ? '#ccc' : '#007bff',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: subiendo ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {subiendo 
            ? `⏳ Subiendo archivos...` 
            : `📤 Subir ${archivos.length} archivo${archivos.length !== 1 ? 's' : ''}`
          }
        </button>
      </form>

      {(subiendo || progreso) && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: progreso.includes('❌') ? '#ffebee' : '#e3f2fd', 
          border: `1px solid ${progreso.includes('❌') ? '#f44336' : '#2196f3'}`,
          borderRadius: '4px'
        }}>
          <p style={{ 
            margin: 0, 
            color: progreso.includes('❌') ? '#c62828' : '#1976d2',
            fontFamily: 'monospace'
          }}>
            {progreso || '⏳ Subiendo archivos... Por favor, no cierres esta ventana.'}
          </p>
          
          {tiempoInicio && (
            <TiempoTranscurrido inicio={tiempoInicio} />
          )}
          
          {subiendo && (
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
              💡 Si la subida tarda mucho, verifica:
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
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
