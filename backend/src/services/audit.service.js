class AuditService {
  /**
   * Registra la creación de un material
   */
  async logMaterialCreation(material, user) {
    try {
      console.log(`📝 Material creado: ${material.nombre} por ${user.email}`);
      // Aquí podrías guardar en una tabla de auditoría o enviar a un servicio de logging
    } catch (error) {
      console.error('Error en auditoría de creación:', error);
    }
  }
  
  /**
   * Registra la subida de un archivo
   */
  async logFileUpload(material, user, fileInfo) {
    try {
      console.log(`📤 Archivo subido: ${material.filename} (${this.formatFileSize(fileInfo.size)}) por ${user.email}`);
      // Aquí podrías guardar estadísticas detalladas
    } catch (error) {
      console.error('Error en auditoría de subida:', error);
    }
  }
  
  /**
   * Registra el acceso a un material
   */
  async logMaterialAccess(material, user, accessType, requestInfo = {}) {
    try {
      const logEntry = {
        materialId: material._id,
        materialName: material.nombre,
        user: user.email,
        accessType, // 'view', 'download', 'presigned_url'
        timestamp: new Date(),
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        fileSize: material.tamaño
      };
      
      console.log(`🔍 Acceso a material: ${material.nombre} (${accessType}) por ${user.email}`);
      
      // Actualizar estadísticas en el material
      if (material.accesos) {
        material.accesos.push({
          usuario: user.email,
          fecha: new Date(),
          ip: requestInfo.ip,
          tipo: accessType
        });
      }
      
      return logEntry;
    } catch (error) {
      console.error('Error en auditoría de acceso:', error);
    }
  }
  
  /**
   * Registra la eliminación de un material
   */
  async logMaterialDeletion(material, user) {
    try {
      console.log(`🗑️ Material eliminado: ${material.nombre} por ${user.email}`);
      // Aquí podrías guardar en una tabla de auditoría
    } catch (error) {
      console.error('Error en auditoría de eliminación:', error);
    }
  }
  
  /**
   * Registra errores de acceso
   */
  async logAccessError(materialId, user, error, requestInfo = {}) {
    try {
      console.error(`❌ Error de acceso: Material ${materialId} por ${user?.email || 'anónimo'} - ${error.message}`);
      // Aquí podrías guardar errores para análisis
    } catch (auditError) {
      console.error('Error en auditoría de error:', auditError);
    }
  }
  
  /**
   * Genera estadísticas de uso
   */
  async generateUsageStats(dateRange = {}) {
    try {
      // Aquí podrías generar estadísticas desde la base de datos
      console.log('📊 Generando estadísticas de uso...');
      return {
        totalAccess: 0,
        topMaterials: [],
        activeUsers: [],
        period: dateRange
      };
    } catch (error) {
      console.error('Error generando estadísticas:', error);
      return null;
    }
  }
  
  /**
   * Formatea el tamaño de archivo para logs
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const auditService = new AuditService();
