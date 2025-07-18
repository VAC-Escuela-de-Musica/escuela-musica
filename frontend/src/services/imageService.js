// Servicio para gestión de imágenes
class ImageService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    // Cache simple para URLs temporales
    this.cache = new Map();
  }

  // ============= IMÁGENES PÚBLICAS =============
  
  /**
   * Obtener URL de imagen pública
   */
  getPublicImageUrl(filename) {
    return `${this.baseURL}/api/files/serve/${filename}`;
  }
  
  /**
   * Obtener URL de imagen privada con token de autenticación
   */
  getPrivateImageUrl(materialId) {
    if (this.token) {
      return `${this.baseURL}/api/files/serve/${materialId}?token=${this.token}`;
    }
    return `${this.baseURL}/api/files/serve/${materialId}`;
  }
  
  /**
   * Obtener URL para descarga como archivo adjunto
   */
  getDownloadUrl(materialId) {
    if (this.token) {
      return `${this.baseURL}/api/files/download/${materialId}?token=${this.token}`;
    }
    return `${this.baseURL}/api/files/download/${materialId}`;
  }
  
  /**
   * Obtener URL de vista previa (inline)
   */
  getViewUrl(materialId) {
    if (this.token) {
      return `${this.baseURL}/api/files/serve/${materialId}?token=${this.token}`;
    }
    return `${this.baseURL}/api/files/serve/${materialId}`;
  }
  
  /**
   * Limpiar cache de URLs expiradas
   */
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export default ImageService;
