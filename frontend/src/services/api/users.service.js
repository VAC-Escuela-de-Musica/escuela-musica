import apiService from '../api.service.js';

/**
 * Servicio especializado para operaciones de usuarios
 * Centraliza toda la lógica de negocio relacionada con usuarios
 */
export class UsersService {
  
  /**
   * Obtener todos los usuarios con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>}
   */
  static async getUsers(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.role) params.append('role', filters.role);
    if (filters.activo !== undefined) params.append('activo', filters.activo);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return await apiService.get(endpoint);
  }

  /**
   * Obtener un usuario específico por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>}
   */
  static async getUserById(id) {
    return await apiService.get(`/users/${id}`);
  }

  /**
   * Crear nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>}
   */
  static async createUser(userData) {
    // Validaciones específicas del dominio
    const validation = this.validateUserData(userData, true);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Procesar datos antes de enviar
    const processedData = this.processUserData(userData);
    
    return await apiService.post('/users', processedData);
  }

  /**
   * Actualizar usuario existente
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   * @returns {Promise<Object>}
   */
  static async updateUser(id, userData) {
    const validation = this.validateUserData(userData, false);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const processedData = this.processUserData(userData);
    
    return await apiService.put(`/users/${id}`, processedData);
  }

  /**
   * Eliminar usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>}
   */
  static async deleteUser(id) {
    return await apiService.delete(`/users/${id}`);
  }

  /**
   * Cambiar estado activo/inactivo de un usuario
   * @param {string} id - ID del usuario
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>}
   */
  static async toggleUserStatus(id, activo) {
    return await apiService.patch(`/users/${id}/status`, { activo });
  }

  /**
   * Cambiar rol de un usuario
   * @param {string} id - ID del usuario
   * @param {string} newRole - Nuevo rol
   * @returns {Promise<Object>}
   */
  static async changeUserRole(id, newRole) {
    const validation = this.validateRole(newRole);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return await apiService.patch(`/users/${id}/role`, { role: newRole });
  }

  /**
   * Resetear contraseña de usuario
   * @param {string} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña (opcional, se genera automáticamente si no se proporciona)
   * @returns {Promise<Object>}
   */
  static async resetUserPassword(id, newPassword = null) {
    const data = newPassword ? { password: newPassword } : {};
    return await apiService.post(`/users/${id}/reset-password`, data);
  }

  /**
   * Obtener usuarios por rol
   * @param {string} role - Rol a filtrar
   * @returns {Promise<Object>}
   */
  static async getUsersByRole(role) {
    return await this.getUsers({ role });
  }

  /**
   * Buscar usuarios por término
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Object>}
   */
  static async searchUsers(query) {
    return await this.getUsers({ search: query });
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>}
   */
  static async getUserStats() {
    return await apiService.get('/users/stats');
  }

  /**
   * Exportar usuarios a CSV/Excel
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Blob>}
   */
  static async exportUsers(options = {}) {
    const params = new URLSearchParams();
    
    if (options.format) params.append('format', options.format);
    if (options.role) params.append('role', options.role);
    if (options.includeInactive) params.append('includeInactive', options.includeInactive);

    const response = await apiService.get(`/users/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response;
  }

  /**
   * Importar usuarios desde archivo
   * @param {File} file - Archivo CSV/Excel
   * @param {Object} options - Opciones de importación
   * @returns {Promise<Object>}
   */
  static async importUsers(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.skipDuplicates) {
      formData.append('skipDuplicates', 'true');
    }
    
    if (options.defaultRole) {
      formData.append('defaultRole', options.defaultRole);
    }

    return await apiService.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  /**
   * Verificar disponibilidad de username
   * @param {string} username - Username a verificar
   * @param {string} excludeId - ID del usuario a excluir (para edición)
   * @returns {Promise<Object>}
   */
  static async checkUsernameAvailability(username, excludeId = null) {
    const params = new URLSearchParams({ username });
    if (excludeId) params.append('excludeId', excludeId);
    
    return await apiService.get(`/users/check-username?${params.toString()}`);
  }

  /**
   * Verificar disponibilidad de email
   * @param {string} email - Email a verificar
   * @param {string} excludeId - ID del usuario a excluir (para edición)
   * @returns {Promise<Object>}
   */
  static async checkEmailAvailability(email, excludeId = null) {
    const params = new URLSearchParams({ email });
    if (excludeId) params.append('excludeId', excludeId);
    
    return await apiService.get(`/users/check-email?${params.toString()}`);
  }

  /**
   * Validar datos de usuario
   * @param {Object} userData - Datos a validar
   * @param {boolean} isCreating - Si es creación (requiere contraseña)
   * @returns {Object} - {isValid, errors}
   */
  static validateUserData(userData, isCreating = false) {
    const errors = [];

    // Validar username
    if (!userData.username || userData.username.trim().length === 0) {
      errors.push('El nombre de usuario es requerido');
    }

    if (userData.username && userData.username.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres');
    }

    if (userData.username && !/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.push('El nombre de usuario solo puede contener letras, números y guiones bajos');
    }

    // Validar email
    if (!userData.email || userData.email.trim().length === 0) {
      errors.push('El email es requerido');
    }

    if (userData.email && !this.validateEmail(userData.email)) {
      errors.push('El formato del email no es válido');
    }

    // Validar RUT (si está presente)
    if (userData.rut && !this.validateRUT(userData.rut)) {
      errors.push('El formato del RUT no es válido');
    }

    // Validar rol
    if (!userData.role) {
      errors.push('El rol es requerido');
    }

    const roleValidation = this.validateRole(userData.role);
    if (!roleValidation.isValid) {
      errors.push(roleValidation.error);
    }

    // Validar contraseña (solo en creación)
    if (isCreating) {
      if (!userData.password || userData.password.length === 0) {
        errors.push('La contraseña es requerida');
      }

      if (userData.password && userData.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar RUT chileno
   * @param {string} rut - RUT a validar
   * @returns {boolean}
   */
  static validateRUT(rut) {
    if (!rut) return false;
    
    // Formato básico: 12345678-9 o 12345678-K
    const rutRegex = /^\d{7,8}-[\dKk]$/;
    if (!rutRegex.test(rut)) return false;

    // Validación del dígito verificador
    const [rutNumber, dv] = rut.split('-');
    const dvCalculated = this.calculateRUTDV(rutNumber);
    
    return dv.toLowerCase() === dvCalculated.toLowerCase();
  }

  /**
   * Calcular dígito verificador del RUT
   * @param {string} rutNumber - Número del RUT sin DV
   * @returns {string} - Dígito verificador
   */
  static calculateRUTDV(rutNumber) {
    let sum = 0;
    let multiplier = 2;

    for (let i = rutNumber.length - 1; i >= 0; i--) {
      sum += parseInt(rutNumber[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const remainder = sum % 11;
    const dv = 11 - remainder;

    if (dv === 11) return '0';
    if (dv === 10) return 'K';
    return dv.toString();
  }

  /**
   * Validar rol de usuario
   * @param {string} role - Rol a validar
   * @returns {Object} - {isValid, error}
   */
  static validateRole(role) {
    const validRoles = ['administrador', 'profesor', 'asistente'];
    
    if (!validRoles.includes(role)) {
      return {
        isValid: false,
        error: `Rol no válido. Roles permitidos: ${validRoles.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Procesar datos de usuario antes de enviar a la API
   * @param {Object} userData - Datos del usuario
   * @returns {Object} - Datos procesados
   */
  static processUserData(userData) {
    const processedData = { ...userData };

    // Normalizar username
    if (processedData.username) {
      processedData.username = processedData.username.trim().toLowerCase();
    }

    // Normalizar email
    if (processedData.email) {
      processedData.email = processedData.email.trim().toLowerCase();
    }

    // Normalizar RUT
    if (processedData.rut) {
      processedData.rut = processedData.rut.toUpperCase().replace(/\s/g, '');
    }

    // Asegurar valor booleano para activo
    if (processedData.activo === undefined) {
      processedData.activo = true;
    }

    return processedData;
  }

  /**
   * Obtener permisos de un rol
   * @param {string} role - Rol
   * @returns {Object} - Permisos del rol
   */
  static getRolePermissions(role) {
    const permissions = {
      'administrador': {
        users: { create: true, read: true, update: true, delete: true },
        galeria: { create: true, read: true, update: true, delete: true },
        clases: { create: true, read: true, update: true, delete: true },
        configuracion: { read: true, update: true }
      },
      'profesor': {
        users: { create: false, read: true, update: false, delete: false },
        galeria: { create: true, read: true, update: true, delete: false },
        clases: { create: true, read: true, update: true, delete: true },
        configuracion: { read: true, update: false }
      },
      'asistente': {
        users: { create: false, read: true, update: false, delete: false },
        galeria: { create: false, read: true, update: false, delete: false },
        clases: { create: false, read: true, update: false, delete: false },
        configuracion: { read: true, update: false }
      }
    };

    return permissions[role] || permissions['asistente'];
  }
}