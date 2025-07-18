/**
 * Sistema de cache simple para debuggear
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Establece un valor en cache con TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    const expirationTime = Date.now() + ttl;
    
    this.cache.set(key, value);
    this.ttlMap.set(key, expirationTime);
    
    // Programar limpieza automática
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * Obtiene un valor del cache
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
   * Elimina una clave del cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
  }

  /**
   * Alias para delete
   */
  remove(key) {
    this.delete(key);
  }

  /**
   * Verifica si existe una clave en cache
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
  }

  /**
   * Invalida cache por evento
   */
  invalidateByEvent(event, resource) {
    // Para debugging, simplemente limpiamos todo
    this.clear();
  }
}

// Instancia del sistema de cache
const cacheSystem = new SimpleCache();

export default cacheSystem;
export { cacheSystem };
