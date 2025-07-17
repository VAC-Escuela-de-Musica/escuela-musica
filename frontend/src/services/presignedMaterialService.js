// Servicio del Frontend SOLO con URLs prefirmadas
class PresignedMaterialService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // ============= SUBIDA DE MATERIALES =============
  
  /**
   * Flujo completo: Obtener URL prefirmada + Subir archivo + Confirmar
   */
  async uploadMaterial(file, materialData) {
    try {
      // 1. Obtener URL prefirmada para subida
      const extension = file.name.split('.').pop();
      const uploadResponse = await fetch(`${this.baseURL}/api/materials/upload-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extension,
          contentType: file.type,
          nombre: materialData.nombre,
          descripcion: materialData.descripcion,
          bucketTipo: materialData.bucketTipo || 'privado'
        })
      });

      if (!uploadResponse.ok) {
        throw new Error('Error obteniendo URL de subida');
      }

      const { uploadUrl, materialId } = await uploadResponse.json();

      console.log("URL de subida obtenida:", uploadUrl);
      console.log("Material ID:", materialId);
      
      // 2. Subir archivo directamente a MinIO
      console.log("Iniciando subida a MinIO...");
      
      const uploadFileResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });
      
      console.log("Respuesta de MinIO:", uploadFileResponse.status, uploadFileResponse.statusText);

      if (!uploadFileResponse.ok) {
        console.error("Error de respuesta de MinIO:", uploadFileResponse);
        throw new Error(`Error subiendo archivo a MinIO: ${uploadFileResponse.status} ${uploadFileResponse.statusText}`);
      }

      // 3. Confirmar subida exitosa en backend
      const confirmResponse = await fetch(`${this.baseURL}/api/materials/confirm-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          materialId,
          nombre: materialData.nombre,
          descripcion: materialData.descripcion
        })
      });

      if (!confirmResponse.ok) {
        throw new Error('Error confirmando subida');
      }

      return await confirmResponse.json();

    } catch (error) {
      console.error('Error en uploadMaterial:', error);
      throw error;
    }
  }

  // ============= DESCARGA DE MATERIALES =============
  
  /**
   * Obtener URL temporal para descargar material
   */
  async getDownloadUrl(materialId, expiryMinutes = 60) {
    try {
      const response = await fetch(
        `${this.baseURL}/api/materials/download-url/${materialId}?expiryMinutes=${expiryMinutes}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error obteniendo URL de descarga');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getDownloadUrl:', error);
      throw error;
    }
  }

  /**
   * Descargar archivo con URL temporal
   */
  async downloadMaterial(materialId, filename) {
    try {
      const { url } = await this.getDownloadUrl(materialId);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error descargando material:', error);
      throw error;
    }
  }

  // ============= LISTADO DE MATERIALES =============
  
  /**
   * Obtener lista de materiales con URLs prefirmadas incluidas
   */
  async getMaterials() {
    try {
      const response = await fetch(`${this.baseURL}/api/materials/`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo materiales');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getMaterials:', error);
      throw error;
    }
  }

  // ============= ELIMINACIÓN =============
  
  /**
   * Eliminar material
   */
  async deleteMaterial(materialId) {
    try {
      const response = await fetch(`${this.baseURL}/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error eliminando material');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteMaterial:', error);
      throw error;
    }
  }

  // ============= HELPERS PARA UI =============
  
  /**
   * Crear elemento de imagen con URL temporal (para previews)
   */
  async createImageElement(materialId, alt = "") {
    try {
      const { url } = await this.getDownloadUrl(materialId, 15); // 15 minutos para preview
      
      const img = document.createElement('img');
      img.src = url;
      img.alt = alt;
      img.className = 'material-preview';
      
      return img;
    } catch (error) {
      console.error('Error creando elemento imagen:', error);
      return null;
    }
  }

  /**
   * Crear elemento video con URL temporal
   */
  async createVideoElement(materialId) {
    try {
      const { url } = await this.getDownloadUrl(materialId, 30); // 30 minutos para video
      
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.className = 'material-video';
      
      return video;
    } catch (error) {
      console.error('Error creando elemento video:', error);
      return null;
    }
  }
}

// ============= COMPONENTE REACT EJEMPLO =============

/**
 * Ejemplo de uso en React
 */
export function MaterialUploadComponent({ token, baseURL, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    bucketTipo: 'privado'
  });

  const materialService = new PresignedMaterialService(baseURL, token);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await materialService.uploadMaterial(file, formData);
      onUploadSuccess(result);
      
      // Resetear formulario
      setFormData({ nombre: '', descripcion: '', bucketTipo: 'privado' });
      event.target.value = '';
      
    } catch (error) {
      alert('Error subiendo archivo: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="material-upload">
      <h3>Subir Material</h3>
      
      <input
        type="text"
        placeholder="Nombre del material"
        value={formData.nombre}
        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
      />
      
      <textarea
        placeholder="Descripción"
        value={formData.descripcion}
        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
      />
      
      <select
        value={formData.bucketTipo}
        onChange={(e) => setFormData({...formData, bucketTipo: e.target.value})}
      >
        <option value="privado">Privado</option>
        <option value="publico">Público</option>
      </select>
      
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png,.docx,.mp3,.mp4"
      />
      
      {uploading && <p>Subiendo archivo...</p>}
    </div>
  );
}

/**
 * Componente para mostrar lista de materiales
 */
export function MaterialListComponent({ token, baseURL }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const materialService = new PresignedMaterialService(baseURL, token);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const result = await materialService.getMaterials();
      setMaterials(result.data || []);
    } catch (error) {
      console.error('Error cargando materiales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId, filename) => {
    try {
      await materialService.downloadMaterial(materialId, filename);
    } catch (error) {
      alert('Error descargando archivo: ' + error.message);
    }
  };

  const handleDelete = async (materialId) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return;
    
    try {
      await materialService.deleteMaterial(materialId);
      loadMaterials(); // Recargar lista
    } catch (error) {
      alert('Error eliminando material: ' + error.message);
    }
  };

  if (loading) return <p>Cargando materiales...</p>;

  return (
    <div className="material-list">
      <h3>Materiales Disponibles</h3>
      
      {materials.map((material) => (
        <div key={material._id} className="material-item">
          <h4>{material.nombre}</h4>
          <p>{material.descripcion}</p>
          <p>Tipo: {material.bucketTipo}</p>
          <p>Subido por: {material.usuario}</p>
          
          {material.downloadUrl && (
            <div>
              <button onClick={() => handleDownload(material._id, material.filename)}>
                Descargar
              </button>
              
              {material.urlType === 'presigned' && (
                <small>URL expira: {new Date(material.urlExpiresAt).toLocaleString()}</small>
              )}
            </div>
          )}
          
          <button 
            onClick={() => handleDelete(material._id)}
            className="delete-btn"
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}

export default PresignedMaterialService;
