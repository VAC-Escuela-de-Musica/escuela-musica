// Configuración centralizada de la API
const rawApiUrl = import.meta.env.VITE_API_URL;

// Verificar que la variable de entorno esté configurada
if (!rawApiUrl) {
  throw new Error('VITE_API_URL no está configurada en las variables de entorno');
}

// Función para normalizar la URL base y evitar duplicación de /api
function normalizeApiUrl(url) {
  // Remover /api del final si existe para evitar duplicación
  let cleanUrl = url.replace(/\/api\/?$/, '');
  // Remover barra final para evitar dobles barras
  cleanUrl = cleanUrl.replace(/\/$/, '');
  return cleanUrl;
}

export const API_BASE_URL = normalizeApiUrl(rawApiUrl);

// Endpoints de la API organizados por funcionalidad
export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    verify: `${API_BASE_URL}/api/auth/verify`,
    profile: `${API_BASE_URL}/api/auth/profile`
  },

  // Materiales
  materials: {
    list: `${API_BASE_URL}/api/materials`,
    getAll: `${API_BASE_URL}/api/materials`,
    create: `${API_BASE_URL}/api/materials`,
    uploadUrl: `${API_BASE_URL}/api/materials/upload-url`,
    confirmUpload: `${API_BASE_URL}/api/materials/confirm-upload`,
    delete: (id) => `${API_BASE_URL}/api/materials/${id}`,
    update: (id) => `${API_BASE_URL}/api/materials/${id}`,
    getById: (id) => `${API_BASE_URL}/api/materials/${id}`
  },

  // Archivos
  files: {
    serve: (id) => `${API_BASE_URL}/api/files/serve/${id}`,
    download: (id) => `${API_BASE_URL}/api/files/download/${id}`,
    upload: `${API_BASE_URL}/api/files/upload`,
    delete: (id) => `${API_BASE_URL}/api/files/${id}`
  },

  // Usuarios
  users: {
    list: `${API_BASE_URL}/api/users`,
    create: `${API_BASE_URL}/api/users`,
    delete: (id) => `${API_BASE_URL}/api/users/${id}`,
    update: (id) => `${API_BASE_URL}/api/users/${id}`,
    getById: (id) => `${API_BASE_URL}/api/users/${id}`
  },

  // Alumnos/Estudiantes
  alumnos: {
    base: `${API_BASE_URL}/api/alumnos`,
    list: `${API_BASE_URL}/api/alumnos`,
    create: `${API_BASE_URL}/api/alumnos`,
    delete: (id) => `${API_BASE_URL}/api/alumnos/${id}`,
    update: (id) => `${API_BASE_URL}/api/alumnos/${id}`,
    getById: (id) => `${API_BASE_URL}/api/alumnos/${id}`,
    getByUserId: (userId) => `${API_BASE_URL}/api/alumnos/user/${userId}`
  },

  // Mensajes Internos
  internalMessages: {
    base: `${API_BASE_URL}/api/internal-messages`,
    list: `${API_BASE_URL}/api/internal-messages`,
    create: `${API_BASE_URL}/api/internal-messages`,
    delete: (id) => `${API_BASE_URL}/api/internal-messages/${id}`,
    update: (id) => `${API_BASE_URL}/api/internal-messages/${id}`,
    getById: (id) => `${API_BASE_URL}/api/internal-messages/${id}`,
    send: (id) => `${API_BASE_URL}/api/internal-messages/${id}/send`,
    markAsRead: (id) => `${API_BASE_URL}/api/internal-messages/${id}/read`,
    getStudentMessages: (studentId) => `${API_BASE_URL}/api/internal-messages/student/${studentId}`,
    getUnreadMessages: (studentId) => `${API_BASE_URL}/api/internal-messages/student/${studentId}/unread`,
    stats: `${API_BASE_URL}/api/internal-messages/stats`
  },
  
  // Galería
  galeria: {
    list: `${API_BASE_URL}/api/galeria`,
    getAll: `${API_BASE_URL}/api/galeria`,
    active: `${API_BASE_URL}/api/galeria/active`,
    activeWithUrls: `${API_BASE_URL}/api/galeria/active-with-urls`,
    getById: (id) => `${API_BASE_URL}/api/galeria/${id}`,
    imageUrl: (id) => `${API_BASE_URL}/api/galeria/${id}/url`
  },
};

// Función para obtener el token CSRF del contexto de autenticación
export function getCsrfToken() {
  // Intentar obtener el token CSRF del contexto global si está disponible
  if (typeof window !== 'undefined' && window.__CSRF_TOKEN__) {
    return window.__CSRF_TOKEN__;
  }
  return null;
}

// Función para establecer el token CSRF (llamada desde AuthContext)
export function setCsrfToken(token) {
  if (typeof window !== 'undefined') {
    window.__CSRF_TOKEN__ = token;
  }
}

// Función para obtener el token CSRF del backend (legacy - mantener para compatibilidad)
export async function fetchCsrfToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    setCsrfToken(data.csrfToken);
    return data.csrfToken;
  } catch (err) {
    console.error('Error obteniendo CSRF token:', err);
    return null;
  }
}

// Headers de API centralizados
export const API_HEADERS = {
  // Headers básicos
  basic: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Headers con autenticación y CSRF
  withAuth: () => {
    const token = localStorage.getItem('token');
    const csrf = getCsrfToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(csrf && { '_csrf': csrf })
    };
  },

  // Headers para upload de archivos (sin Content-Type para FormData)
  forFileUpload: () => {
    const token = localStorage.getItem('token');
    const csrf = getCsrfToken();
    return {
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(csrf && { '_csrf': csrf })
    };
  },

  // Headers solo con token (para casos especiales)
  authOnly: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

// Utilidades de API
export const API_UTILS = {
  // Construir URL con parámetros de query
  buildUrl: (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  },

  // Verificar si una respuesta es exitosa
  isSuccessResponse: (status) => status >= 200 && status < 300,

  // Obtener mensaje de error de respuesta
  getErrorMessage: async (response) => {
    try {
      const errorData = await response.json();
      return errorData.message || errorData.error || `Error ${response.status}`;
    } catch {
      return await response.text() || `Error ${response.status}`;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Limpiar autenticación
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Configuración de entorno
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  baseUrl: API_BASE_URL,
  version: '1.0.0'
};

// Agregar baseUrl a API_UTILS para facilitar acceso
API_UTILS.config = ENV_CONFIG;

// Export por defecto con toda la configuración
export default {
  endpoints: API_ENDPOINTS,
  headers: API_HEADERS,
  utils: API_UTILS,
  config: ENV_CONFIG
};
