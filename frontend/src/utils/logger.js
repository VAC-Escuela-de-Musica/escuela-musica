/**
 * Logger inteligente para el frontend que reduce logs en producción
 */
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.enabledLevels = this.isDevelopment ? ['log', 'warn', 'error', 'info'] : ['error'];
  }

  /**
   * Log normal - solo en desarrollo
   */
  log(...args) {
    if (this.enabledLevels.includes('log')) {
      console.log(...args);
    }
  }

  /**
   * Información - solo en desarrollo
   */
  info(...args) {
    if (this.enabledLevels.includes('info')) {
      console.info(...args);
    }
  }

  /**
   * Advertencias - solo en desarrollo
   */
  warn(...args) {
    if (this.enabledLevels.includes('warn')) {
      console.warn(...args);
    }
  }

  /**
   * Errores - siempre se muestran
   */
  error(...args) {
    if (this.enabledLevels.includes('error')) {
      console.error(...args);
    }
  }

  /**
   * Logs de subida - solo en desarrollo
   */
  upload(...args) {
    if (this.isDevelopment) {
      console.log('📤', ...args);
    }
  }

  /**
   * Logs de descarga - solo en desarrollo
   */
  download(...args) {
    if (this.isDevelopment) {
      console.log('📥', ...args);
    }
  }

  /**
   * Logs de red - solo en desarrollo
   */
  network(...args) {
    if (this.isDevelopment) {
      console.log('🌐', ...args);
    }
  }

  /**
   * Logs de autenticación - solo en desarrollo
   */
  auth(...args) {
    if (this.isDevelopment) {
      console.log('🔐', ...args);
    }
  }

  /**
   * Logs de materiales - solo en desarrollo
   */
  materials(...args) {
    if (this.isDevelopment) {
      console.log('📋', ...args);
    }
  }

  /**
   * Logs de imágenes - solo en desarrollo
   */
  images(...args) {
    if (this.isDevelopment) {
      console.log('🖼️', ...args);
    }
  }

  /**
   * Logs de éxito - solo en desarrollo
   */
  success(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de procesos - solo en desarrollo
   */
  process(...args) {
    if (this.isDevelopment) {
      console.log('🔄', ...args);
    }
  }

  /**
   * Logs de datos - solo en desarrollo
   */
  data(...args) {
    if (this.isDevelopment) {
      console.log('📊', ...args);
    }
  }

  /**
   * Logs de búsqueda - solo en desarrollo
   */
  search(...args) {
    if (this.isDevelopment) {
      console.log('🔍', ...args);
    }
  }

  /**
   * Logs de tiempo - solo en desarrollo
   */
  time(...args) {
    if (this.isDevelopment) {
      console.log('⏱️', ...args);
    }
  }

  /**
   * Logs de configuración - solo en desarrollo
   */
  config(...args) {
    if (this.isDevelopment) {
      console.log('⚙️', ...args);
    }
  }

  /**
   * Logs de filtros - solo en desarrollo
   */
  filter(...args) {
    if (this.isDevelopment) {
      console.log('🔍', ...args);
    }
  }

  /**
   * Logs de renderizado - solo en desarrollo
   */
  render(...args) {
    if (this.isDevelopment) {
      console.log('🎨', ...args);
    }
  }

  /**
   * Logs de respuesta - solo en desarrollo
   */
  response(...args) {
    if (this.isDevelopment) {
      console.log('📡', ...args);
    }
  }

  /**
   * Logs de token - solo en desarrollo
   */
  token(...args) {
    if (this.isDevelopment) {
      console.log('🔑', ...args);
    }
  }

  /**
   * Logs de URL - solo en desarrollo
   */
  url(...args) {
    if (this.isDevelopment) {
      console.log('🔗', ...args);
    }
  }

  /**
   * Logs de endpoint - solo en desarrollo
   */
  endpoint(...args) {
    if (this.isDevelopment) {
      console.log('🌐', ...args);
    }
  }

  /**
   * Logs de headers - solo en desarrollo
   */
  headers(...args) {
    if (this.isDevelopment) {
      console.log('📡', ...args);
    }
  }

  /**
   * Logs de estructura - solo en desarrollo
   */
  structure(...args) {
    if (this.isDevelopment) {
      console.log('🔍', ...args);
    }
  }

  /**
   * Logs de cantidad - solo en desarrollo
   */
  count(...args) {
    if (this.isDevelopment) {
      console.log('📊', ...args);
    }
  }

  /**
   * Logs de ejemplo - solo en desarrollo
   */
  example(...args) {
    if (this.isDevelopment) {
      console.log('📦', ...args);
    }
  }

  /**
   * Logs de tipo - solo en desarrollo
   */
  type(...args) {
    if (this.isDevelopment) {
      console.log('🔄', ...args);
    }
  }

  /**
   * Logs de ID - solo en desarrollo
   */
  id(...args) {
    if (this.isDevelopment) {
      console.log('🔄', ...args);
    }
  }

  /**
   * Logs de carga - solo en desarrollo
   */
  loading(...args) {
    if (this.isDevelopment) {
      console.log('🔄', ...args);
    }
  }

  /**
   * Logs de formato - solo en desarrollo
   */
  format(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de lista - solo en desarrollo
   */
  list(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de filtrado - solo en desarrollo
   */
  filtered(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de total - solo en desarrollo
   */
  total(...args) {
    if (this.isDevelopment) {
      console.log('📊', ...args);
    }
  }

  /**
   * Logs de final - solo en desarrollo
   */
  final(...args) {
    if (this.isDevelopment) {
      console.log('📋', ...args);
    }
  }

  /**
   * Logs de cantidad final - solo en desarrollo
   */
  finalCount(...args) {
    if (this.isDevelopment) {
      console.log('📊', ...args);
    }
  }

  /**
   * Logs de primer elemento - solo en desarrollo
   */
  first(...args) {
    if (this.isDevelopment) {
      console.log('📦', ...args);
    }
  }

  /**
   * Logs de renderizado final - solo en desarrollo
   */
  finalRender(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de imagen - solo en desarrollo
   */
  image(...args) {
    if (this.isDevelopment) {
      console.log('🖼️', ...args);
    }
  }

  /**
   * Logs de backend - solo en desarrollo
   */
  backend(...args) {
    if (this.isDevelopment) {
      console.log('🖼️', ...args);
    }
  }

  /**
   * Logs de éxito en carga - solo en desarrollo
   */
  imageSuccess(...args) {
    if (this.isDevelopment) {
      console.log('✅', ...args);
    }
  }

  /**
   * Logs de archivo - solo en desarrollo
   */
  file(...args) {
    if (this.isDevelopment) {
      console.log('📄', ...args);
    }
  }

  /**
   * Logs de solicitud - solo en desarrollo
   */
  request(...args) {
    if (this.isDevelopment) {
      console.log('🔗', ...args);
    }
  }

  /**
   * Logs de stack trace - solo en desarrollo
   */
  stack(...args) {
    if (this.isDevelopment) {
      console.log('❌', ...args);
    }
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
}

export const logger = new Logger();
