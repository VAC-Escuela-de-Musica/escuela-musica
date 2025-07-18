/**
 * Logger inteligente para el frontend que reduce logs en producción
 * Refactorizado para eliminar duplicación de código
 */
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.enabledLevels = this.isDevelopment ? ['log', 'warn', 'error', 'info'] : ['error'];
    
    // Configuración de métodos con íconos
    this.methodConfigs = {
      // Métodos básicos de consola
      log: { icon: '', useLevel: true },
      info: { icon: '', useLevel: true },
      warn: { icon: '', useLevel: true },
      error: { icon: '', useLevel: true },
      
      // Métodos específicos con íconos
      upload: { icon: '📤' },
      download: { icon: '📥' },
      network: { icon: '🌐' },
      auth: { icon: '🔐' },
      materials: { icon: '📋' },
      images: { icon: '🖼️' },
      success: { icon: '✅' },
      process: { icon: '🔄' },
      data: { icon: '📊' },
      search: { icon: '🔍' },
      time: { icon: '⏱️' },
      config: { icon: '⚙️' },
      filter: { icon: '🔍' },
      render: { icon: '🎨' },
      response: { icon: '📡' },
      token: { icon: '🔑' },
      url: { icon: '🔗' },
      endpoint: { icon: '🌐' },
      headers: { icon: '📡' },
      structure: { icon: '🔍' },
      count: { icon: '📊' },
      example: { icon: '📦' },
      type: { icon: '🔄' },
      id: { icon: '🔄' },
      loading: { icon: '🔄' },
      format: { icon: '✅' },
      list: { icon: '✅' },
      filtered: { icon: '✅' },
      total: { icon: '📊' },
      final: { icon: '📋' },
      finalCount: { icon: '📊' },
      first: { icon: '📦' },
      finalRender: { icon: '✅' },
      image: { icon: '🖼️' },
      backend: { icon: '🖼️' },
      imageSuccess: { icon: '✅' },
      file: { icon: '📄' },
      request: { icon: '🔗' },
      stack: { icon: '❌' }
    };
    
    // Generar métodos dinámicamente
    this._generateMethods();
  }

  /**
   * Genera todos los métodos de logging dinámicamente
   */
  _generateMethods() {
    Object.entries(this.methodConfigs).forEach(([methodName, config]) => {
      this[methodName] = (...args) => {
        if (config.useLevel) {
          // Métodos que usan niveles específicos (log, info, warn, error)
          if (this.enabledLevels.includes(methodName)) {
            console[methodName](...args);
          }
        } else {
          // Métodos personalizados solo en desarrollo
          if (this.isDevelopment) {
            console.log(config.icon, ...args);
          }
        }
      };
    });
  }

  /**
   * Agregar un nuevo método de logging dinámicamente
   * @param {string} methodName - Nombre del método
   * @param {string} icon - Ícono a mostrar
   */
  addMethod(methodName, icon) {
    this.methodConfigs[methodName] = { icon };
    this[methodName] = (...args) => {
      if (this.isDevelopment) {
        console.log(icon, ...args);
      }
    };
  }

  /**
   * Grupo de logs - solo en desarrollo
   */
  group(label) {
    if (this.isDevelopment) {
      console.group(label);
    }
  }

  /**
   * Fin de grupo - solo en desarrollo
   */
  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  /**
   * Tabla - solo en desarrollo
   */
  table(data) {
    if (this.isDevelopment) {
      console.table(data);
    }
  }

  /**
   * Tiempo - solo en desarrollo
   */
  timeStart(label) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  /**
   * Fin de tiempo - solo en desarrollo
   */
  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }

  /**
   * Logging estructurado con contexto
   */
  withContext(context) {
    return {
      log: (...args) => this.log(`[${context}]`, ...args),
      info: (...args) => this.info(`[${context}]`, ...args),
      warn: (...args) => this.warn(`[${context}]`, ...args),
      error: (...args) => this.error(`[${context}]`, ...args),
      success: (...args) => this.success(`[${context}]`, ...args)
    };
  }

  /**
   * Logging condicional
   */
  when(condition, method = 'log') {
    return (...args) => {
      if (condition && this[method]) {
        this[method](...args);
      }
    };
  }

  /**
   * Obtener configuración actual
   */
  getConfig() {
    return {
      isDevelopment: this.isDevelopment,
      enabledLevels: this.enabledLevels,
      availableMethods: Object.keys(this.methodConfigs)
    };
  }
}

export const logger = new Logger();
