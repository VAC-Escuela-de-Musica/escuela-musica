import apiService from '../api.service.js';

/**
 * Servicio especializado para operaciones de testimonios
 * Centraliza toda la lógica de negocio relacionada con testimonios/reseñas
 */
export class TestimoniosService {
  
  /**
   * Obtener todos los testimonios con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>}
   */
  static async getTestimonios(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.activo !== undefined) params.append('activo', filters.activo);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/testimonios?${queryString}` : '/testimonios';
    
    return await apiService.get(endpoint);
  }

  /**
   * Obtener un testimonio específico por ID
   * @param {string} id - ID del testimonio
   * @returns {Promise<Object>}
   */
  static async getTestimonioById(id) {
    return await apiService.get(`/testimonios/${id}`);
  }

  /**
   * Crear nuevo testimonio
   * @param {Object} testimonioData - Datos del testimonio
   * @returns {Promise<Object>}
   */
  static async createTestimonio(testimonioData) {
    // Validaciones específicas del dominio
    const validation = this.validateTestimonioData(testimonioData, true);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Procesar datos antes de enviar
    const processedData = this.processTestimonioData(testimonioData);
    
    return await apiService.post('/testimonios', processedData);
  }

  /**
   * Actualizar testimonio existente
   * @param {string} id - ID del testimonio
   * @param {Object} testimonioData - Datos actualizados
   * @returns {Promise<Object>}
   */
  static async updateTestimonio(id, testimonioData) {
    const validation = this.validateTestimonioData(testimonioData, false);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const processedData = this.processTestimonioData(testimonioData);
    
    return await apiService.put(`/testimonios/${id}`, processedData);
  }

  /**
   * Eliminar testimonio
   * @param {string} id - ID del testimonio
   * @returns {Promise<Object>}
   */
  static async deleteTestimonio(id) {
    return await apiService.delete(`/testimonios/${id}`);
  }

  /**
   * Cambiar estado activo/inactivo de un testimonio
   * @param {string} id - ID del testimonio
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>}
   */
  static async toggleTestimonioStatus(id, activo = null) {
    const endpoint = activo !== null 
      ? `/testimonios/${id}/status` 
      : `/testimonios/${id}/toggle`;
    
    const data = activo !== null ? { activo } : {};
    
    return await apiService.patch(endpoint, data);
  }

  /**
   * Reordenar testimonios
   * @param {Array} items - Array con {id, orden}
   * @returns {Promise<Object>}
   */
  static async reorderTestimonios(items) {
    const ordenData = items.map((item, index) => ({
      id: item.id || item._id,
      orden: item.orden !== undefined ? item.orden : index
    }));

    return await apiService.put('/testimonios/order/update', { ordenData });
  }

  /**
   * Obtener estadísticas de testimonios
   * @returns {Promise<Object>}
   */
  static async getTestimonioStats() {
    return await apiService.get('/testimonios/stats');
  }

  /**
   * Obtener testimonios por calificación
   * @param {number} rating - Calificación (1-5)
   * @returns {Promise<Object>}
   */
  static async getTestimoniosByRating(rating) {
    return await this.getTestimonios({ rating });
  }

  /**
   * Buscar testimonios por texto
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Object>}
   */
  static async searchTestimonios(query) {
    return await this.getTestimonios({ search: query });
  }

  /**
   * Obtener testimonios activos ordenados
   * @returns {Promise<Object>}
   */
  static async getActiveTestimonios() {
    return await this.getTestimonios({ 
      activo: true, 
      sortBy: 'orden', 
      sortOrder: 'asc' 
    });
  }

  /**
   * Exportar testimonios
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Blob>}
   */
  static async exportTestimonios(options = {}) {
    const params = new URLSearchParams();
    
    if (options.format) params.append('format', options.format);
    if (options.includeInactive) params.append('includeInactive', options.includeInactive);
    if (options.rating) params.append('rating', options.rating);

    const response = await apiService.get(`/testimonios/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response;
  }

  /**
   * Importar testimonios desde archivo
   * @param {File} file - Archivo CSV/Excel
   * @param {Object} options - Opciones de importación
   * @returns {Promise<Object>}
   */
  static async importTestimonios(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.skipDuplicates) {
      formData.append('skipDuplicates', 'true');
    }
    
    if (options.defaultRating) {
      formData.append('defaultRating', options.defaultRating);
    }

    return await apiService.post('/testimonios/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  /**
   * Validar datos de testimonio
   * @param {Object} testimonioData - Datos a validar
   * @param {boolean} isCreating - Si es creación (requiere campos obligatorios)
   * @returns {Object} - {isValid, errors}
   */
  static validateTestimonioData(testimonioData, isCreating = false) {
    const errors = [];

    // Validar nombre
    if (!testimonioData.nombre || testimonioData.nombre.trim().length === 0) {
      errors.push('El nombre es requerido');
    }

    if (testimonioData.nombre && testimonioData.nombre.length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres');
    }

    // Validar cargo
    if (!testimonioData.cargo || testimonioData.cargo.trim().length === 0) {
      errors.push('El cargo es requerido');
    }

    if (testimonioData.cargo && testimonioData.cargo.length > 100) {
      errors.push('El cargo no puede exceder 100 caracteres');
    }

    // Validar opinión
    if (!testimonioData.opinion || testimonioData.opinion.trim().length === 0) {
      errors.push('La opinión es requerida');
    }

    if (testimonioData.opinion && testimonioData.opinion.length > 500) {
      errors.push('La opinión no puede exceder 500 caracteres');
    }

    if (testimonioData.opinion && testimonioData.opinion.length < 10) {
      errors.push('La opinión debe tener al menos 10 caracteres');
    }

    // Validar foto URL
    if (testimonioData.foto && !this.validatePhotoURL(testimonioData.foto)) {
      errors.push('La URL de la foto no es válida');
    }

    // Validar calificación
    if (testimonioData.estrellas !== undefined) {
      const ratingValidation = this.validateRating(testimonioData.estrellas);
      if (!ratingValidation.isValid) {
        errors.push(ratingValidation.error);
      }
    }

    // Validar institución (opcional)
    if (testimonioData.institucion && testimonioData.institucion.length > 100) {
      errors.push('La institución no puede exceder 100 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar calificación (estrellas)
   * @param {number} rating - Calificación a validar
   * @returns {Object} - {isValid, error}
   */
  static validateRating(rating) {
    if (rating === null || rating === undefined) {
      return { isValid: true }; // Rating opcional
    }

    if (!Number.isInteger(rating)) {
      return {
        isValid: false,
        error: 'La calificación debe ser un número entero'
      };
    }

    if (rating < 1 || rating > 5) {
      return {
        isValid: false,
        error: 'La calificación debe estar entre 1 y 5 estrellas'
      };
    }

    return { isValid: true };
  }

  /**
   * Validar URL de foto
   * @param {string} url - URL a validar
   * @returns {boolean}
   */
  static validatePhotoURL(url) {
    if (!url || url.trim().length === 0) {
      return true; // Foto opcional
    }

    try {
      const urlObj = new URL(url);
      // Verificar que sea HTTP/HTTPS
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Verificar extensiones de imagen comunes
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      // Aceptar si tiene extensión de imagen o si es de servicios conocidos
      const imageServices = ['imgur.com', 'cloudinary.com', 'amazonaws.com', 'googleusercontent.com'];
      const isImageService = imageServices.some(service => urlObj.hostname.includes(service));
      
      return hasImageExtension || isImageService;
    } catch (error) {
      return false;
    }
  }

  /**
   * Procesar datos de testimonio antes de enviar a la API
   * @param {Object} testimonioData - Datos del testimonio
   * @returns {Object} - Datos procesados
   */
  static processTestimonioData(testimonioData) {
    const processedData = { ...testimonioData };

    // Normalizar nombre
    if (processedData.nombre) {
      processedData.nombre = processedData.nombre.trim();
    }

    // Normalizar cargo
    if (processedData.cargo) {
      processedData.cargo = processedData.cargo.trim();
    }

    // Sanitizar y normalizar opinión
    if (processedData.opinion) {
      processedData.opinion = this.sanitizeOpinion(processedData.opinion);
    }

    // Normalizar institución
    if (processedData.institucion) {
      processedData.institucion = processedData.institucion.trim();
    }

    // Normalizar foto URL
    if (processedData.foto) {
      processedData.foto = processedData.foto.trim();
    }

    // Asegurar valor booleano para activo
    if (processedData.activo === undefined) {
      processedData.activo = true;
    }

    // Asegurar calificación por defecto
    if (processedData.estrellas === undefined || processedData.estrellas === null) {
      processedData.estrellas = 5;
    }

    return processedData;
  }

  /**
   * Sanitizar texto de opinión
   * @param {string} opinion - Texto de opinión
   * @returns {string} - Texto sanitizado
   */
  static sanitizeOpinion(opinion) {
    if (!opinion) return '';

    return opinion
      .trim()
      // Remover múltiples espacios
      .replace(/\s+/g, ' ')
      // Remover caracteres especiales peligrosos pero mantener puntuación normal
      .replace(/[<>]/g, '')
      // Capitalizar primera letra
      .replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Generar orden automático para nuevo testimonio
   * @returns {Promise<number>}
   */
  static async generateDefaultOrder() {
    try {
      const response = await this.getTestimonios({ sortBy: 'orden', sortOrder: 'desc' });
      const testimonios = response.data || [];
      
      if (testimonios.length === 0) {
        return 1;
      }
      
      const maxOrder = Math.max(...testimonios.map(t => t.orden || 0));
      return maxOrder + 1;
    } catch (error) {
      console.error('Error al generar orden por defecto:', error);
      return 1;
    }
  }

  /**
   * Obtener configuración de validación
   * @returns {Object} - Configuración de límites y validaciones
   */
  static getValidationConfig() {
    return {
      nombre: { minLength: 1, maxLength: 50, required: true },
      cargo: { minLength: 1, maxLength: 100, required: true },
      opinion: { minLength: 10, maxLength: 500, required: true },
      institucion: { minLength: 0, maxLength: 100, required: false },
      foto: { required: false, type: 'url' },
      estrellas: { min: 1, max: 5, type: 'integer', required: false },
      activo: { type: 'boolean', default: true }
    };
  }

  /**
   * Obtener testimonios destacados (5 estrellas, activos)
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Object>}
   */
  static async getFeaturedTestimonios(limit = 6) {
    const response = await this.getTestimonios({ 
      activo: true, 
      rating: 5,
      sortBy: 'orden', 
      sortOrder: 'asc' 
    });
    
    const testimonios = response.data || [];
    return {
      ...response,
      data: testimonios.slice(0, limit)
    };
  }
}