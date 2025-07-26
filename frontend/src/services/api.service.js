import { logger } from "../utils/logger.js";

/**
 * Servicio centralizado de API para eliminar duplicación
 * Maneja todas las llamadas HTTP con interceptores y manejo de errores
 */
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://146.83.198.35:1230";
    this.token = null;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Bind methods to preserve 'this' context
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    this.request = this.request.bind(this);
  }

  /**
   * Configurar token de autenticación
   * @param {string} token - Token JWT
   */
  setToken(token) {
    this.token = token;
    if (token) {
      this.defaultHeaders.Authorization = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders.Authorization;
    }
  }

  /**
   * Limpiar token de autenticación
   */
  clearToken() {
    this.setToken(null);
  }

  /**
   * Obtener headers para la petición
   * @param {Object} customHeaders - Headers personalizados
   */
  getHeaders(customHeaders = {}) {
    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  /**
   * Construir URL completa
   * @param {string} endpoint - Endpoint de la API
   */
  buildURL(endpoint) {
    // Asegurar que el endpoint tenga el prefijo /api
    const apiEndpoint = endpoint.startsWith("/api/")
      ? endpoint
      : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`;
    return `${this.baseURL}${apiEndpoint}`;
  }

  /**
   * Interceptor de respuesta para manejo de errores
   * @param {Response} response - Respuesta fetch
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");

    // Intentar parsear JSON si es posible
    let data;
    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      logger.warn("Error parsing response:", error);
      data = null;
    }

    if (!response.ok) {
      const error = {
        status: response.status,
        statusText: response.statusText,
        message: data?.message || data || "Error desconocido",
        data: data,
      };

      logger.error("API Error:", error);
      throw error;
    }

    return data;
  }

  /**
   * Método genérico para realizar peticiones HTTP
   * @param {string} method - Método HTTP
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} options - Opciones de la petición
   */
  async request(method, endpoint, options = {}) {
    const {
      data = null,
      headers = {},
      queryParams = {},
      timeout = 30000,
      retries = 0,
      retryDelay = 1000,
    } = options;

    const url = this.buildURL(endpoint);
    const searchParams = new URLSearchParams(queryParams);
    const fullURL = searchParams.toString() ? `${url}?${searchParams}` : url;

    const config = {
      method,
      headers: this.getHeaders(headers),
      credentials: "include", // Incluir cookies de sesión
      signal: AbortSignal.timeout(timeout),
    };

    if (data) {
      if (data instanceof FormData) {
        config.body = data;
        // Eliminar Content-Type para FormData (el browser lo establece automáticamente)
        delete config.headers["Content-Type"];
      } else {
        config.body = JSON.stringify(data);
      }
    }

    logger.network(`${method} ${fullURL}`, data);

    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(fullURL, config);
        const result = await this.handleResponse(response);

        logger.success(`${method} ${fullURL} - Success`, result);
        return result;
      } catch (error) {
        lastError = error;

        if (attempt < retries && this.shouldRetry(error)) {
          logger.warn(
            `Retry ${attempt + 1}/${retries} for ${method} ${fullURL}`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        logger.error(`${method} ${fullURL} - Failed`, error);
        break;
      }
    }

    throw lastError;
  }

  /**
   * Determinar si se debe reintentar la petición
   * @param {Error} error - Error ocurrido
   */
  shouldRetry(error) {
    // Reintentar en errores de red o timeouts
    return (
      error.name === "TypeError" ||
      error.name === "TimeoutError" ||
      (error.status >= 500 && error.status < 600)
    );
  }

  /**
   * Métodos HTTP específicos
   */
  async get(endpoint, options = {}) {
    return this.request("GET", endpoint, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request("POST", endpoint, { ...options, data });
  }

  async put(endpoint, data, options = {}) {
    return this.request("PUT", endpoint, { ...options, data });
  }

  async patch(endpoint, data, options = {}) {
    return this.request("PATCH", endpoint, { ...options, data });
  }

  async delete(endpoint, options = {}) {
    return this.request("DELETE", endpoint, options);
  }

  /**
   * Métodos específicos para archivos
   */
  async uploadFile(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append("file", file);

    // Agregar campos adicionales si existen
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request("POST", endpoint, {
      ...options,
      data: formData,
    });
  }

  async uploadMultipleFiles(endpoint, files, options = {}) {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    // Agregar campos adicionales si existen
    if (options.fields) {
      Object.entries(options.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request("POST", endpoint, {
      ...options,
      data: formData,
    });
  }

  async downloadFile(endpoint, options = {}) {
    const response = await fetch(this.buildURL(endpoint), {
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(options.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Métodos específicos para autenticación
   */
  async login(credentials) {
    const response = await this.post("/auth/login", credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post("/auth/logout");
    } catch (error) {
      logger.warn("Logout API call failed:", error);
    } finally {
      this.setToken(null);
    }
  }

  async refreshToken() {
    const response = await this.post("/auth/refresh");
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Métodos específicos para materiales
   */
  async getMaterials(filters = {}) {
    return this.get("/materials", { queryParams: filters });
  }

  async getMaterial(id) {
    return this.get(`/materials/${id}`);
  }

  async createMaterial(materialData) {
    return this.post("/materials", materialData);
  }

  async updateMaterial(id, materialData) {
    return this.put(`/materials/${id}`, materialData);
  }

  async deleteMaterial(id) {
    return this.delete(`/materials/${id}`);
  }

  async uploadMaterial(file, metadata = {}) {
    return this.uploadFile("/materials/upload", file, { fields: metadata });
  }

  async uploadMultipleMaterials(files, metadata = {}) {
    return this.uploadMultipleFiles("/materials/upload/multiple", files, {
      fields: metadata,
    });
  }

  /**
   * Métodos específicos para usuarios
   */
  async getUsers(filters = {}) {
    return this.get("/users", { queryParams: filters });
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post("/users", userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  /**
   * Métodos específicos para archivos
   */
  async getFile(fileId) {
    return this.get(`/files/${fileId}`);
  }

  async downloadFileById(fileId) {
    return this.downloadFile(`/files/${fileId}/download`);
  }

  async serveFile(fileId) {
    return this.get(`/files/${fileId}/serve`);
  }

  /**
   * Interceptores para manejo global
   */
  addRequestInterceptor(interceptor) {
    // Implementar interceptores de petición si es necesario
    logger.info("Request interceptor added");
  }

  addResponseInterceptor(interceptor) {
    // Implementar interceptores de respuesta si es necesario
    logger.info("Response interceptor added");
  }

  /**
   * Configuración de debugging
   */
  enableDebug() {
    this.debug = true;
    logger.info("API Debug mode enabled");
  }

  disableDebug() {
    this.debug = false;
    logger.info("API Debug mode disabled");
  }
}

// Crear instancia única
const apiService = new ApiService();

export default apiService;
