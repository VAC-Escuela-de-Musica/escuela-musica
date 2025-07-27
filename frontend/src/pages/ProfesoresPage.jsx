import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import ProfesoresList from '../components/domain/profesores/ProfesoresList';
import { useAuth } from '../context/AuthContext';
import SchoolIcon from '@mui/icons-material/School';

const ProfesoresPage = () => {
  const { user, isAdmin } = useAuth();

  // Verificar si el usuario tiene acceso administrativo
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" component="div">
            Acceso Denegado
          </Typography>
          <Typography>
            No tienes permisos para acceder a la gestión de profesores. 
            Se requiere acceso administrativo.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText', 
        py: 3, 
        px: 3,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Gestión de Profesores
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Administra la información de los profesores de la escuela de música
            </Typography>
          </Box>
        </Box>
      </Box>

      <ProfesoresList />
    </Box>
  );
};

export default ProfesoresPage; 