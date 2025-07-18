import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service.js';

/**
 * Hook para gestión de autenticación - Versión Simple
 */
const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Inicializa la autenticación
   * Verifica si hay un token válido almacenado
   */
  const initializeAuth = useCallback(async () => {
    console.log('🔍 Inicializando autenticación...');

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      console.log('⚠️ No hay token o datos de usuario almacenados');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    try {
      // Verificar token con el backend
      const result = await authService.verifyToken();
      
      if (result.success) {
        console.log('✅ Token válido, usuario autenticado:', result.data.user);
        setUser(result.data.user);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Token inválido:', result.error);
        // Limpiar datos inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('💥 Error initializing auth:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setIsInitialized(true);
      console.log('🏁 Inicialización completada');
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
        
        console.log('Login exitoso:', user);
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
   * Cierra la sesión del usuario
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Cerrar sesión en el servidor
      await authService.logout();
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Actualizar estado
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('Logout exitoso');
    } catch (err) {
      console.error('Error durante logout:', err);
      // Limpiar estado local aunque haya error en servidor
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
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
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Error al actualizar perfil');
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
        return { success: true };
      } else {
        setError(result.error || 'Error al cambiar contraseña');
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
  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = useCallback((permission) => {
    // Lógica de permisos basada en roles
    if (hasRole('admin')) return true;
    if (hasRole('teacher') && ['read', 'write', 'upload'].includes(permission)) return true;
    if (hasRole('student') && ['read'].includes(permission)) return true;
    return false;
  }, [hasRole]);

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  /**
   * Verifica si el usuario es profesor
   */
  const isTeacher = useCallback(() => {
    return hasRole('teacher');
  }, [hasRole]);

  /**
   * Verifica si el usuario es estudiante
   */
  const isStudent = useCallback(() => {
    return hasRole('student');
  }, [hasRole]);

  /**
   * Limpia los errores
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
      if (result) {
        console.log('Token renovado exitosamente');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error renovando token:', err);
      return false;
    }
  }, []);

  // Inicializar autenticación al montar el componente
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    // Estados
    user,
    isAuthenticated,
    loading,
    error,
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

export default useAuthState;
