import apiService from '../api.service.js';

/**
 * Servicio especializado para operaciones de galería
 * Centraliza toda la lógica de negocio relacionada con imágenes
 */
export class GaleriaService {
  
  /**
   * Obtener todas las imágenes de la galería
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>}
   */
  static async getImages(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.activo !== undefined) params.append('activo', filters.activo);
    if (filters.tags) params.append('tags', filters.tags.join(','));
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/galeria?${queryString}` : '/galeria';
    
    return await apiService.get(endpoint);
  }

  /**
   * Obtener una imagen específica por ID
   * @param {string} id - ID de la imagen
   * @returns {Promise<Object>}
   */
  static async getImageById(id) {
    return await apiService.get(`/galeria/${id}`);
  }

  /**
   * Crear nueva imagen en la galería
   * @param {Object} imageData - Datos de la imagen
   * @returns {Promise<Object>}
   */
  static async createImage(imageData) {
    // Validaciones específicas del dominio
    const validation = this.validateImageData(imageData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Preparar FormData si hay archivo
    if (imageData.image) {
      const formData = new FormData();
      formData.append('image', imageData.image);
      formData.append('titulo', imageData.titulo);
      formData.append('descripcion', imageData.descripcion || '');
      formData.append('categoria', imageData.categoria);
      formData.append('cols', imageData.cols || 1);
      formData.append('rows', imageData.rows || 1);
      formData.append('activo', imageData.activo !== undefined ? imageData.activo : true);
      
      if (imageData.tags) {
        formData.append('tags', JSON.stringify(imageData.tags));
      }

      return await apiService.post('/galeria', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return await apiService.post('/galeria', imageData);
  }

  /**
   * Actualizar imagen existente
   * @param {string} id - ID de la imagen
   * @param {Object} imageData - Datos actualizados
   * @returns {Promise<Object>}
   */
  static async updateImage(id, imageData) {
    const validation = this.validateImageData(imageData, false);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Si hay nueva imagen, usar FormData
    if (imageData.image) {
      const formData = new FormData();
      formData.append('image', imageData.image);
      formData.append('titulo', imageData.titulo);
      formData.append('descripcion', imageData.descripcion || '');
      formData.append('categoria', imageData.categoria);
      formData.append('cols', imageData.cols || 1);
      formData.append('rows', imageData.rows || 1);
      formData.append('activo', imageData.activo);
      
      if (imageData.tags) {
        formData.append('tags', JSON.stringify(imageData.tags));
      }

      return await apiService.put(`/galeria/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return await apiService.put(`/galeria/${id}`, imageData);
  }

  /**
   * Eliminar imagen de la galería
   * @param {string} id - ID de la imagen
   * @returns {Promise<Object>}
   */
  static async deleteImage(id) {
    return await apiService.delete(`/galeria/${id}`);
  }

  /**
   * Cambiar estado activo/inactivo de una imagen
   * @param {string} id - ID de la imagen
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>}
   */
  static async toggleImageStatus(id, activo) {
    return await apiService.patch(`/galeria/${id}/status`, { activo });
  }

  /**
   * Reordenar imágenes de la galería
   * @param {Array} items - Array con {id, orden}
   * @returns {Promise<Object>}
   */
  static async reorderImages(items) {
    return await apiService.put('/galeria/reorder', { items });
  }

  /**
   * Obtener estadísticas de la galería
   * @returns {Promise<Object>}
   */
  static async getGalleryStats() {
    return await apiService.get('/galeria/stats');
  }

  /**
   * Obtener imágenes por categoría
   * @param {string} categoria - Categoría a filtrar
   * @returns {Promise<Object>}
   */
  static async getImagesByCategory(categoria) {
    return await this.getImages({ categoria });
  }

  /**
   * Buscar imágenes por texto
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Object>}
   */
  static async searchImages(query) {
    return await this.getImages({ search: query });
  }

  /**
   * Exportar imágenes de la galería
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Blob>}
   */
  static async exportImages(options = {}) {
    const params = new URLSearchParams();
    
    if (options.format) params.append('format', options.format);
    if (options.categoria) params.append('categoria', options.categoria);
    if (options.dateRange) {
      params.append('startDate', options.dateRange.start);
      params.append('endDate', options.dateRange.end);
    }

    const response = await apiService.get(`/galeria/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response;
  }

  /**
   * Validar datos de imagen
   * @param {Object} imageData - Datos a validar
   * @param {boolean} requireImage - Si se requiere imagen
   * @returns {Object} - {isValid, errors}
   */
  static validateImageData(imageData, requireImage = true) {
    const errors = [];

    // Validar título
    if (!imageData.titulo || imageData.titulo.trim().length === 0) {
      errors.push('El título es requerido');
    }

    if (imageData.titulo && imageData.titulo.length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    // Validar categoría
    const validCategories = [
      'conciertos', 'clases', 'eventos', 'instrumentos', 
      'profesores', 'instalaciones', 'otros'
    ];
    
    if (!imageData.categoria || !validCategories.includes(imageData.categoria)) {
      errors.push('Categoría no válida');
    }

    // Validar imagen (solo si es requerida)
    if (requireImage && !imageData.image && !imageData.imagen) {
      errors.push('La imagen es requerida');
    }

    // Validar archivo de imagen
    if (imageData.image) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(imageData.image.type)) {
        errors.push('Formato de imagen no válido');
      }

      if (imageData.image.size > 10 * 1024 * 1024) { // 10MB
        errors.push('La imagen es demasiado grande (máximo 10MB)');
      }
    }

    // Validar dimensiones de layout
    if (imageData.cols && (imageData.cols < 1 || imageData.cols > 3)) {
      errors.push('Las columnas deben estar entre 1 y 3');
    }

    if (imageData.rows && (imageData.rows < 1 || imageData.rows > 3)) {
      errors.push('Las filas deben estar entre 1 y 3');
    }

    // Validar tags
    if (imageData.tags && Array.isArray(imageData.tags)) {
      const validTags = [
        'destacado', 'nuevo', 'popular', 'promocional',
        'principiante', 'intermedio', 'avanzado',
        'piano', 'guitarra', 'violín', 'batería', 'canto'
      ];
      
      const invalidTags = imageData.tags.filter(tag => !validTags.includes(tag));
      if (invalidTags.length > 0) {
        errors.push(`Tags no válidos: ${invalidTags.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener configuración de layout por categoría
   * @param {string} categoria - Categoría
   * @returns {Object} - Configuración de layout
   */
  static getLayoutConfig(categoria) {
    const layouts = {
      'conciertos': { cols: 2, rows: 1, description: 'Panorámica para conciertos' },
      'clases': { cols: 1, rows: 1, description: 'Cuadrado para clases' },
      'eventos': { cols: 2, rows: 2, description: 'Grande para eventos' },
      'instrumentos': { cols: 1, rows: 1, description: 'Cuadrado para instrumentos' },
      'profesores': { cols: 1, rows: 2, description: 'Vertical para retratos' },
      'instalaciones': { cols: 2, rows: 1, description: 'Panorámica para espacios' },
      'otros': { cols: 1, rows: 1, description: 'Formato estándar' }
    };

    return layouts[categoria] || layouts['otros'];
  }
}