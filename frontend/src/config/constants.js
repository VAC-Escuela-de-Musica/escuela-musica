/**
 * Configuración centralizada para el frontend
 * Elimina duplicación de constantes y configuraciones
 */

// Configuración de API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify'
    },
    // Materiales
    MATERIALS: {
      BASE: '/materials',
      UPLOAD: '/materials/upload',
      UPLOAD_MULTIPLE: '/materials/upload/multiple',
      BY_ID: (id) => `/materials/${id}`,
      DOWNLOAD: (id) => `/materials/${id}/download`
    },
    // Usuarios
    USERS: {
      BASE: '/users',
      BY_ID: (id) => `/users/${id}`,
      PROFILE: '/users/profile'
    },
    // Archivos
    FILES: {
      BASE: '/files',
      BY_ID: (id) => `/files/${id}`,
      DOWNLOAD: (id) => `/files/${id}/download`,
      SERVE: (id) => `/files/${id}/serve`
    }
  }
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  FILE: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/quicktime',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.mp4', '.mov', '.doc', '.docx']
  },
  MATERIAL: {
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    REQUIRED_FIELDS: ['title', 'type', 'category']
  },
  USER: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  }
};

// Configuración de UI
export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#1976d2',
    SECONDARY_COLOR: '#dc004e',
    SUCCESS_COLOR: '#4caf50',
    WARNING_COLOR: '#ff9800',
    ERROR_COLOR: '#f44336',
    INFO_COLOR: '#2196f3'
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
    MAX_VISIBLE_PAGES: 5
  },
  LAYOUT: {
    HEADER_HEIGHT: 64,
    SIDEBAR_WIDTH: 240,
    SIDEBAR_COLLAPSED_WIDTH: 64,
    FOOTER_HEIGHT: 40
  },
  BREAKPOINTS: {
    XS: 0,
    SM: 600,
    MD: 960,
    LG: 1280,
    XL: 1920
  }
};

// Configuración de filtros
export const FILTER_CONFIG = {
  MATERIAL_TYPES: [
    { value: 'partitura', label: 'Partitura' },
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'imagen', label: 'Imagen' },
    { value: 'documento', label: 'Documento' }
  ],
  MATERIAL_CATEGORIES: [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
    { value: 'teoria', label: 'Teoría Musical' },
    { value: 'practica', label: 'Práctica' }
  ],
  SORT_OPTIONS: [
    { value: 'createdAt_desc', label: 'Más reciente' },
    { value: 'createdAt_asc', label: 'Más antiguo' },
    { value: 'title_asc', label: 'Título A-Z' },
    { value: 'title_desc', label: 'Título Z-A' },
    { value: 'size_desc', label: 'Tamaño mayor' },
    { value: 'size_asc', label: 'Tamaño menor' }
  ]
};

// Configuración de mensajes
export const MESSAGES = {
  SUCCESS: {
    UPLOAD: 'Archivo subido exitosamente',
    UPLOAD_MULTIPLE: 'Archivos subidos exitosamente',
    DELETE: 'Elemento eliminado exitosamente',
    UPDATE: 'Elemento actualizado exitosamente',
    CREATE: 'Elemento creado exitosamente',
    LOGIN: 'Inicio de sesión exitoso',
    LOGOUT: 'Cierre de sesión exitoso'
  },
  ERROR: {
    UPLOAD: 'Error al subir el archivo',
    UPLOAD_MULTIPLE: 'Error al subir algunos archivos',
    DELETE: 'Error al eliminar el elemento',
    UPDATE: 'Error al actualizar el elemento',
    CREATE: 'Error al crear el elemento',
    LOGIN: 'Error en el inicio de sesión',
    NETWORK: 'Error de conexión',
    UNAUTHORIZED: 'No autorizado',
    FORBIDDEN: 'Acceso denegado',
    NOT_FOUND: 'Recurso no encontrado',
    VALIDATION: 'Error de validación',
    SERVER: 'Error del servidor'
  },
  WARNING: {
    UNSAVED_CHANGES: 'Tienes cambios sin guardar',
    DELETE_CONFIRM: '¿Estás seguro de que quieres eliminar este elemento?',
    LOGOUT_CONFIRM: '¿Estás seguro de que quieres cerrar sesión?',
    FILE_TOO_LARGE: 'El archivo es demasiado grande',
    INVALID_FILE_TYPE: 'Tipo de archivo no válido'
  },
  INFO: {
    LOADING: 'Cargando...',
    UPLOADING: 'Subiendo archivo...',
    PROCESSING: 'Procesando...',
    SAVING: 'Guardando...',
    DELETING: 'Eliminando...',
    NO_DATA: 'No hay datos para mostrar',
    EMPTY_RESULTS: 'No se encontraron resultados'
  }
};

// Configuración de almacenamiento local
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_state',
  RECENT_SEARCHES: 'recent_searches',
  FILTER_STATE: 'filter_state'
};

// Configuración de fechas
export const DATE_CONFIG = {
  FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
    ISO: 'YYYY-MM-DD',
    API: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  },
  LOCALES: {
    ES: 'es',
    EN: 'en'
  }
};

// Configuración de logging
export const LOG_CONFIG = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  CONTEXTS: {
    API: 'API',
    AUTH: 'AUTH',
    UPLOAD: 'UPLOAD',
    NAVIGATION: 'NAVIGATION',
    VALIDATION: 'VALIDATION',
    STORAGE: 'STORAGE'
  }
};

// Configuración de características
export const FEATURES = {
  UPLOAD_MULTIPLE: true,
  DRAG_AND_DROP: true,
  DARK_MODE: true,
  OFFLINE_MODE: false,
  NOTIFICATIONS: true,
  SEARCH_HISTORY: true,
  AUTO_SAVE: true,
  EXPORT_DATA: true
};

// Configuración de rendimiento
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  IMAGE_LAZY_LOADING: true,
  VIRTUAL_SCROLLING: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 100
};

// Configuración de accesibilidad
export const ACCESSIBILITY_CONFIG = {
  KEYBOARD_NAVIGATION: true,
  HIGH_CONTRAST: false,
  SCREEN_READER: true,
  FOCUS_INDICATORS: true,
  ARIA_LABELS: true
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  DEBUG_MODE: import.meta.env.DEV,
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',
  SHOW_REDUX_DEVTOOLS: import.meta.env.DEV,
  ENABLE_LOGGING: import.meta.env.DEV,
  PERFORMANCE_MONITORING: import.meta.env.DEV
};

// Exportar configuración completa
export const CONFIG = {
  API: API_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  UI: UI_CONFIG,
  FILTER: FILTER_CONFIG,
  MESSAGES,
  STORAGE_KEYS,
  DATE: DATE_CONFIG,
  LOG: LOG_CONFIG,
  FEATURES,
  PERFORMANCE: PERFORMANCE_CONFIG,
  ACCESSIBILITY: ACCESSIBILITY_CONFIG,
  DEV: DEV_CONFIG
};

export default CONFIG;
