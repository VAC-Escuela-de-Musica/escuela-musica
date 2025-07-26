import { API_ENDPOINTS, API_HEADERS } from "../config/api.js";

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.refreshTimer = null;
  }

  /**
   * Inicializa el servicio de autenticaci贸n
   */
  init() {
    this.token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        this.logout();
      }
    }

    if (this.token) {
      this.scheduleTokenRefresh();
    }
  }

  /**
   * Inicia sesi贸n del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contrase帽a del usuario
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: API_HEADERS.basic,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || "Error en el inicio de sesi贸n",
        };
      }

      // Extraer token y usuario de la respuesta
      const token = data.data?.accessToken || data.accessToken;
      const user = data.data?.user || data.user;

      if (!token) {
        return {
          success: false,
          error: "Token no recibido del servidor",
        };
      }

      // Guardar datos de autenticaci贸n
      this.token = token;
      this.user = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Programar renovaci贸n del token
      this.scheduleTokenRefresh();

      return {
        success: true,
        data: { token, user },
      };
    } catch (error) {
      return {
        success: false,
        error: "Error de red o servidor no disponible",
      };
    }
  }

  /**
   * Verifica si el token actual es v谩lido
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async verifyToken() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return {
          success: false,
          error: "No token found",
        };
      }

      const response = await fetch(API_ENDPOINTS.auth.verify, {
        method: "GET",
        credentials: "include",
        headers: API_HEADERS.withAuth(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || "Token inv谩lido",
        };
      }

      // Actualizar datos del usuario si el token es v谩lido
      if (data.data?.user) {
        this.user = data.data.user;
        localStorage.setItem("user", JSON.stringify(this.user));
      }

      return {
        success: true,
        data: { user: data.data?.user || this.user },
      };
    } catch (error) {
      console.error("馃挜 Error en verifyToken:", error);
      return {
        success: false,
        error: "Error de red o servidor no disponible",
      };
    }
  }

  /**
   * Limpia solo los datos locales sin hacer llamada al servidor
   */
  clearLocalData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Cancelar timer de renovaci贸n
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Cierra sesi贸n del usuario
   */
  async logout() {
    try {
      // Intentar llamar al endpoint de logout
      if (this.token) {
        await fetch(API_ENDPOINTS.auth.logout, {
          method: "POST",
          headers: API_HEADERS.withAuth(),
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }

    // Limpiar datos locales
    this.clearLocalData();
  }

  /**
   * Renueva el token de acceso
   */
  async refreshToken() {
    try {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: "GET",
        headers: API_HEADERS.withAuth(),
        credentials: "include", // Para incluir cookies httpOnly
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error renovando token");
      }

      const newToken = data.data?.accessToken || data.accessToken;

      if (newToken) {
        this.token = newToken;
        localStorage.setItem("token", newToken);
        this.scheduleTokenRefresh();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.logout();
      return false;
    }
  }

  /**
   * Programa la renovaci贸n autom谩tica del token
   */
  scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Renovar token cada 50 minutos (el token expira en 1 d铆a)
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, 50 * 60 * 1000);
  }

  /**
   * Verifica si el usuario est谩 autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Obtiene el token actual
   * @returns {string|null}
   */
  getToken() {
    return this.token;
  }

  /**
   * Obtiene los datos del usuario actual
   * @returns {Object|null}
   */
  getUser() {
    return this.user;
  }

  /**
   * Verifica si el usuario tiene un rol espec铆fico
   * @param {string} role - Rol a verificar
   * @returns {boolean}
   */
  hasRole(role) {
    if (!this.user?.roles) return false;

    if (Array.isArray(this.user.roles)) {
      return this.user.roles.some((r) =>
        typeof r === "string" ? r === role : r.name === role
      );
    }

    return typeof this.user.roles === "string"
      ? this.user.roles === role
      : this.user.roles.name === role;
  }

  /**
   * Interceptor para peticiones HTTP autom谩ticas
   */
  createAuthInterceptor() {
    const originalFetch = window.fetch;

    // Preservar referencia al fetch original para casos especiales
    if (!window.fetch.__originalFetch) {
      window.fetch.__originalFetch = originalFetch;
    }

    window.fetch = async (url, options = {}) => {
      // Si es una URL pre-firmada de MinIO, no agregar Authorization
      if (url.includes("X-Amz-Algorithm") && url.includes("X-Amz-Credential")) {
        console.log(
          "馃敀 Detectada URL pre-firmada, omitiendo Authorization header"
        );
        return originalFetch(url, options);
      }

      // Agregar token a headers si est谩 disponible
      if (this.token && !options.headers?.Authorization) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${this.token}`,
        };
      }

      const response = await originalFetch(url, options);

      // Si recibimos 401, intentar renovar token
      if (response.status === 401 && this.token) {
        const refreshed = await this.refreshToken();

        if (refreshed) {
          // Reintentar la petici贸n original con el nuevo token
          options.headers.Authorization = `Bearer ${this.token}`;
          return originalFetch(url, options);
        }
      }

      return response;
    };
  }
}

// Crear instancia singleton
const authService = new AuthService();

export default authService;
