import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service.js";
import { setCsrfToken as setGlobalCsrfToken } from "../config/api.js";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined") return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(getUserFromStorage);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const initCSRF = async () => {
      setLoading(true);
      try {
        const data = await apiService.get('/csrf-token');
        setCsrfToken(data.csrfToken);
        // También establecer el token globalmente para API_HEADERS
        setGlobalCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error loading CSRF token:', error);
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };
    
    initCSRF();
  }, []);

  // Actualiza localStorage cuando el usuario cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Función de logout
  const logout = async () => {
    try {
      // Intentar logout en el backend
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
      }
    } catch (error) {
      console.error("Error durante logout:", error);
    } finally {
      // Limpiar datos locales
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    
    return user.roles.some(role => 
      typeof role === 'string' ? role === roleName : role.name === roleName
    );
  };

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return hasRole('administrador');
  };

  // Verificar si el usuario es profesor/teacher
  const isTeacher = () => {
    return hasRole('teacher') || hasRole('profesor');
  };

  // Verificar si el usuario es estudiante
  const isStudent = () => {
    return hasRole('student') || hasRole('estudiante');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      setUser, 
      isInitialized, 
      loading,
      logout,
      hasRole,
      isAdmin,
      isTeacher,
      isStudent,
      csrfToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}
