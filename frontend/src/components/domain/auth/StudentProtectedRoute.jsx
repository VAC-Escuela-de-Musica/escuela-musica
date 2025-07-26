import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export default function StudentProtectedRoute({ children }) {
  const { user, isInitialized, loading } = useAuth();

  // Mostrar loading mientras se inicializa
  if (!isInitialized || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay usuario, redirigir al login de estudiantes
  if (!user) {
    return <Navigate to="/login-estudiante" replace />;
  }

  // Verificar que el usuario sea un estudiante
  const isStudent = user.roles?.some(role => 
    typeof role === 'string' ? 
      role === 'student' || role === 'estudiante' : 
      role.name === 'student' || role.name === 'estudiante'
  );

  // Si no es estudiante, redirigir al login administrativo
  if (!isStudent) {
    return <Navigate to="/login" replace />;
  }

  // Si es estudiante, mostrar el contenido protegido
  return children;
} 