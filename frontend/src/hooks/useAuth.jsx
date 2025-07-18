import { useState, useEffect, useCallback, useContext, createContext, useMemo } from 'react';
import authService from '../services/auth.service.js';
import cacheSystem from '../utils/cache.js';

/**
 * Context para autenticación
 */
const AuthContext = createContext();

/**
 * Hook principal de autenticación
 */
const useAuthState = () => {
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
      
      console.log('🔍 Inicializando autenticación...', { token: token ? 'Existe' : 'No existe' });
      
      if (token) {
        // Verificar si el token ya está en caché
        const cachedUser = cacheSystem.get('current_user');
        if (cachedUser) {
          console.log('✅ Usuario encontrado en caché:', cachedUser);
          setUser(cachedUser);
          setIsAuthenticated(true);
        } else {
          console.log('🔄 Verificando token con el servidor...');
          const result = await authService.verifyToken();
          
          console.log('📡 Resultado de verificación:', result);
          
          if (result.success) {
            console.log('✅ Token válido, estableciendo usuario:', result.data.user);
            setUser(result.data.user);
            setIsAuthenticated(true);
            cacheSystem.set('current_user', result.data.user, 300); // Cache por 5 minutos
          } else {
            console.log('❌ Token inválido, limpiando storage:', result.error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            cacheSystem.remove('current_user');
          }
        }
      } else {
        console.log('⚠️ No hay token almacenado');
      }
    } catch (err) {
      console.error('💥 Error initializing auth:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      cacheSystem.remove('current_user');
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
        
        // Limpiar cache al hacer login
        cacheSystem.invalidateByEvent('login', 'all');
        
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
      
      // Limpiar cache al hacer logout
      cacheSystem.invalidateByEvent('logout', 'all');
      
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
    return hasRole('admin');
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

/**
 * Provider de autenticación
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuthState();
  
  // Inicializar autenticación al montar el componente
  useEffect(() => {
    console.log('🚀 AuthProvider montado, iniciando autenticación...');
    auth.initializeAuth();
  }, []); // Dependencia vacía para que solo se ejecute una vez
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
