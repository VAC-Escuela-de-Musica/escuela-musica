import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.service.js";
import authService from "../services/auth.service.js";
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
    const initAuth = async () => {
      setLoading(true);
      try {
        // Initialize authService from localStorage
        authService.init();

        // Get token from localStorage and set it in apiService
        const token = localStorage.getItem("token");
        if (token) {
          apiService.setToken(token);
        }

        // Initialize CSRF token
        const data = await apiService.get("/csrf-token");
        setCsrfToken(data.csrfToken);
        setGlobalCsrfToken(data.csrfToken);

        // Verify token if it exists
        if (token) {
          try {
            const verifyResult = await authService.verifyToken();
            if (verifyResult.success) {
              setUser(verifyResult.data.user);
            } else {
              // Token is invalid, clear it silently
              authService.clearLocalData();
              apiService.clearToken();
              setUser(null);
            }
          } catch (error) {
            console.warn(
              "Token verification failed, clearing local data:",
              error
            );
            // Token is invalid, clear it silently
            authService.clearLocalData();
            apiService.clearToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        // Clear invalid auth state
        authService.logout();
        apiService.clearToken();
        setUser(null);
      } finally {
        setIsInitialized(true);
        setLoading(false);
      }
    };

    initAuth();
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
  // Update logout function to use authService
  const logout = async () => {
    try {
      await authService.logout();
      apiService.clearToken();
      setUser(null);
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;

    return user.roles.some((role) =>
      typeof role === "string" ? role === roleName : role.name === roleName
    );
  };

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return hasRole("administrador");
  };

  // Verificar si el usuario es profesor/teacher
  const isTeacher = () => {
    return hasRole("teacher") || hasRole("profesor");
  };

  // Verificar si el usuario es estudiante
  const isStudent = () => {
    return hasRole("student") || hasRole("estudiante");
  };

  return (
    <AuthContext.Provider
      value={{
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
        csrfToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
