// Servicio para gestión de materiales educativos
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
      console.log('🔄 Iniciando subida de archivo:', file.name);
      
      // 1. Obtener URL prefirmada para subida
      const extension = file.name.split('.').pop().toLowerCase(); // Asegurar minúsculas
      
      console.log('📝 Datos de subida:', {
        filename: file.name,
        extension,
        contentType: file.type,
        size: file.size,
        bucketTipo: materialData.bucketTipo || 'privado'
      });
      
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
        const errorText = await uploadResponse.text();
        console.error('❌ Error obteniendo URL de subida:', errorText);
        throw new Error(`Error obteniendo URL de subida: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ URL de subida obtenida:', {
        materialId: uploadData.materialId,
        filename: uploadData.filename,
        expiresIn: uploadData.expiresIn
      });
      
      // 2. Subir archivo directamente a MinIO
      console.log('📤 Subiendo archivo a MinIO...');
      const uploadFileResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadFileResponse.ok) {
        const errorText = await uploadFileResponse.text();
        console.error('❌ Error subiendo archivo a MinIO:', errorText);
        throw new Error(`Error subiendo archivo a MinIO: ${uploadFileResponse.status} ${uploadFileResponse.statusText} - ${errorText}`);
      }
      
      console.log('✅ Archivo subido a MinIO exitosamente');

      // 3. Confirmar subida exitosa en backend
      console.log('✅ Confirmando subida en backend...');
      const confirmResponse = await fetch(`${this.baseURL}/api/materials/confirm-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          materialId: uploadData.materialId,
          nombre: materialData.nombre,
          descripcion: materialData.descripcion
        })
      });

      if (!confirmResponse.ok) {
        const errorText = await confirmResponse.text();
        console.error('❌ Error confirmando subida:', errorText);
        throw new Error(`Error confirmando subida: ${confirmResponse.status} - ${errorText}`);
      }

      const result = await confirmResponse.json();
      console.log('🎉 Subida completada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error en uploadMaterial:', error);
      throw error;
    }
  }

  /**
   * Listar todos los materiales disponibles para el usuario
   */
  async listMaterials() {
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
      console.error('Error listando materiales:', error);
      throw error;
    }
  }

  /**
   * Eliminar un material
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
      console.error('Error eliminando material:', error);
      throw error;
    }
  }
}

export default PresignedMaterialService;
