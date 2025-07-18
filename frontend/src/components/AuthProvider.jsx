import React, { useEffect, useContext, createContext } from 'react';
import useAuthState from '../hooks/useAuth.js';

/**
 * Context para autenticación
 */
const AuthContext = createContext();

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
