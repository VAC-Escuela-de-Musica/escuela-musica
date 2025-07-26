/**
 * Sistema de cache avanzado para optimizar rendimiento
 * Implementa estrategias de cache con TTL y invalidación inteligente
 */
export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.keyPatterns = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Establece un valor en cache con TTL
   * @param {string} key - Clave del cache
   * @param {*} value - Valor a cachear
   * @param {number} ttl - Tiempo de vida en milisegundos
   * @param {string} pattern - Patrón de invalidación
   */
  set(key, value, ttl = this.defaultTTL, pattern = null) {
    const expirationTime = Date.now() + ttl;
    
    this.cache.set(key, value);
    this.ttlMap.set(key, expirationTime);
    
    if (pattern) {
      if (!this.keyPatterns.has(pattern)) {
        this.keyPatterns.set(pattern, new Set());
      }
      this.keyPatterns.get(pattern).add(key);
    }

    // Programar limpieza automática
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave del cache
   * @returns {*} Valor cacheado o null si no existe o expiró
   */
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    const expirationTime = this.ttlMap.get(key);
    if (expirationTime && Date.now() > expirationTime) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Verifica si existe una clave en cache
   * @param {string} key - Clave del cache
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Elimina una clave del cache
   * @param {string} key - Clave del cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    
    // Limpiar de patrones
    for (const [pattern, keys] of this.keyPatterns) {
      keys.delete(key);
      if (keys.size === 0) {
        this.keyPatterns.delete(pattern);
      }
    }
  }

  /**
   * Invalida cache por patrón
   * @param {string} pattern - Patrón de invalidación
   */
  invalidateByPattern(pattern) {
    const keys = this.keyPatterns.get(pattern);
    if (keys) {
      keys.forEach(key => this.delete(key));
    }
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    this.keyPatterns.clear();
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const [key, expirationTime] of this.ttlMap) {
      if (now > expirationTime) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      totalKeys: this.cache.size,
      validKeys: valid,
      expiredKeys: expired,
      patterns: this.keyPatterns.size
    };
  }

  /**
   * Limpia claves expiradas
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expirationTime] of this.ttlMap) {
      if (now > expirationTime) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));
    return expiredKeys.length;
  }
}

/**
 * Implementación específica para API cache
 */
export class ApiCache extends CacheManager {
  constructor() {
    super();
    this.defaultTTL = 10 * 60 * 1000; // 10 minutos para API
  }

  /**
   * Genera clave de cache para requests
   * @param {string} url - URL del request
   * @param {Object} params - Parámetros del request
   * @returns {string}
   */
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${url}${sortedParams ? `?${sortedParams}` : ''}`;
  }

  /**
   * Cachea respuesta de API
   * @param {string} url - URL del request
   * @param {Object} params - Parámetros del request
   * @param {*} response - Respuesta de la API
   * @param {number} ttl - TTL personalizado
   */
  cacheResponse(url, params, response, ttl = this.defaultTTL) {
    const key = this.generateKey(url, params);
    const pattern = this.getPatternFromUrl(url);
    
    this.set(key, response, ttl, pattern);
  }

  /**
   * Obtiene respuesta cacheada
   * @param {string} url - URL del request
   * @param {Object} params - Parámetros del request
   * @returns {*}
   */
  getCachedResponse(url, params) {
    const key = this.generateKey(url, params);
    return this.get(key);
  }

  /**
   * Invalida cache por URL
   * @param {string} url - URL para invalidar
   */
  invalidateUrl(url) {
    const pattern = this.getPatternFromUrl(url);
    this.invalidateByPattern(pattern);
  }

  /**
   * Extrae patrón de URL para invalidación
   * @param {string} url - URL
   * @returns {string}
   */
  getPatternFromUrl(url) {
    // Extraer el recurso base (usuarios, materiales, etc.)
    const match = url.match(/\/([^\/]+)/);
    return match ? match[1] : 'general';
  }
}

/**
 * Cache para componentes React
 */
export class ComponentCache extends CacheManager {
  constructor() {
    super();
    this.defaultTTL = 30 * 60 * 1000; // 30 minutos para componentes
  }

  /**
   * Cachea estado de componente
   * @param {string} componentId - ID del componente
   * @param {Object} state - Estado a cachear
   * @param {number} ttl - TTL personalizado
   */
  cacheComponentState(componentId, state, ttl = this.defaultTTL) {
    const key = `component:${componentId}`;
    this.set(key, state, ttl, 'components');
  }

  /**
   * Obtiene estado cacheado de componente
   * @param {string} componentId - ID del componente
   * @returns {Object|null}
   */
  getComponentState(componentId) {
    const key = `component:${componentId}`;
    return this.get(key);
  }

  /**
   * Invalida cache de componentes
   */
  invalidateComponents() {
    this.invalidateByPattern('components');
  }
}

/**
 * Manager principal de cache
 */
export class CacheSystem {
  constructor() {
    this.apiCache = new ApiCache();
    this.componentCache = new ComponentCache();
    this.generalCache = new CacheManager();
    
    // Limpiar cache automáticamente cada hora
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Obtiene instancia de cache por tipo
   * @param {string} type - Tipo de cache (api, component, general)
   * @returns {CacheManager}
   */
  getCache(type = 'general') {
    switch (type) {
      case 'api':
        return this.apiCache;
      case 'component':
        return this.componentCache;
      case 'general':
      default:
        return this.generalCache;
    }
  }

  /**
   * Limpia todos los caches
   */
  cleanup() {
    const apiCleaned = this.apiCache.cleanup();
    const componentCleaned = this.componentCache.cleanup();
    const generalCleaned = this.generalCache.cleanup();

    console.log(`Cache cleanup: API(${apiCleaned}) Component(${componentCleaned}) General(${generalCleaned})`);
  }

  /**
   * Obtiene estadísticas completas
   */
  getStats() {
    return {
      api: this.apiCache.getStats(),
      component: this.componentCache.getStats(),
      general: this.generalCache.getStats()
    };
  }

  /**
   * Limpia todo el sistema de cache
   */
  clearAll() {
    this.apiCache.clear();
    this.componentCache.clear();
    this.generalCache.clear();
  }

  /**
   * Invalida cache por evento
   * @param {string} event - Tipo de evento
   * @param {string} resource - Recurso afectado
   */
  invalidateByEvent(event, resource) {
    switch (event) {
      case 'create':
      case 'update':
      case 'delete':
        this.apiCache.invalidateUrl(`/${resource}`);
        break;
      case 'login':
      case 'logout':
        this.clearAll();
        break;
      default:
        break;
    }
  }
}

// Instancia singleton del sistema de cache
export const cacheSystem = new CacheSystem();

// Funciones de utilidad para React
export const withCache = (key, fetchFn, ttl = 5 * 60 * 1000) => {
  const cache = cacheSystem.getCache('api');
  
  return async (...args) => {
    const cachedResult = cache.get(key);
    if (cachedResult) {
      return cachedResult;
    }

    const result = await fetchFn(...args);
    cache.set(key, result, ttl);
    return result;
  };
};

export default cacheSystem;
