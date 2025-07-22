import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service.js';


/**
 * Hook principal de autenticación
 */
export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Inicializa la autenticación verificando el token almacenado
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        // Verificar si el token ya está en caché
        const result = await authService.verifyToken();
        if (result.success) {
          setUser(result.data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  /**
   * Realiza el login del usuario
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        const { user, token } = result.data;
        
        // Almacenar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar estado
        setUser(user);
        setIsAuthenticated(true);
        

        
        return { success: true, data: user };
      } else {
        setError(result.error || 'Error en el inicio de sesión');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realiza el logout del usuario
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Llamar al servicio de logout
      await authService.logout();
      
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpiar estado
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      

      
      return { success: true };
    } catch (err) {
      console.error('Error during logout:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra un nuevo usuario
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(userData);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Error en el registro');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza el perfil del usuario
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        const updatedUser = result.data;
        
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Actualizar estado
        setUser(updatedUser);
        
        return { success: true, data: updatedUser };
      } else {
        setError(result.error || 'Error actualizando perfil');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cambia la contraseña del usuario
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.changePassword(currentPassword, newPassword);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Error cambiando contraseña');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = useCallback((roleName) => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      typeof role === 'string' ? role === roleName : role.name === roleName
    );
  }, [user]);

  /**
   * Verifica si el usuario tiene permisos específicos
   */
  const hasPermission = useCallback((permission) => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => {
      const roleObj = typeof role === 'string' ? { name: role } : role;
      return roleObj.permissions && roleObj.permissions.includes(permission);
    });
  }, [user]);

  /**
   * Verifica si el usuario es admin
   */
  const isAdmin = useCallback(() => {
    return hasRole('administrador');
  }, [hasRole]);

  /**
   * Verifica si el usuario es profesor
   */
  const isTeacher = useCallback(() => {
    return hasRole('teacher') || hasRole('profesor');
  }, [hasRole]);

  /**
   * Verifica si el usuario es estudiante
   */
  const isStudent = useCallback(() => {
    return hasRole('student') || hasRole('estudiante');
  }, [hasRole]);

  /**
   * Limpia errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresca el token
   */
  const refreshToken = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        return { success: true };
      } else {
        await logout();
        return { success: false };
      }
    } catch (err) {
      await logout();
      return { success: false };
    }
  }, [logout]);

  // Efecto para refrescar token periódicamente
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken();
      }, 15 * 60 * 1000); // Refrescar cada 15 minutos

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshToken]);

  return {
    // Estado
    user,
    loading,
    error,
    isAuthenticated,
    isInitialized,

    // Acciones
    login,
    logout,
    register,
    updateProfile,
    changePassword,

    // Verificaciones
    hasRole,
    hasPermission,
    isAdmin,
    isTeacher,
    isStudent,

    // Utilidades
    clearError,
    refreshToken,
    initializeAuth
  };
};

// Exportar por defecto el hook
export default useAuthState;
