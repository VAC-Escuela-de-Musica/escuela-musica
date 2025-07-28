import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import HorarioCalendar from '../components/domain/horario/HorarioCalendar.jsx';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.alumnos.getByUserId(user.id), {
          method: 'GET',
          headers: API_HEADERS.withAuth(),
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al cargar datos del estudiante');
        }

        setStudentData(data.data);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Bienvenido, {studentData?.nombreAlumno || user?.username || 'Estudiante'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Aquí puedes ver tu información personal y tu calendario de clases
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Typography color="text.primary">Inicio</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información del estudiante */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    mr: 2
                  }}
                >
                  {studentData?.nombreAlumno?.charAt(0)?.toUpperCase() || 'E'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {studentData?.nombreAlumno || 'Estudiante'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'estudiante@email.com'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>RUT:</strong> {studentData?.rut || 'No disponible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Email:</strong> {studentData?.email || user?.email || 'No disponible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Teléfono:</strong> {studentData?.telefono || 'No disponible'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    <strong>Estado:</strong> 
                    <Chip 
                      label="Activo" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Calendario de clases */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Mi Calendario de Clases
              </Typography>
              
              <Box sx={{ minHeight: '600px' }}>
                <HorarioCalendar 
                  viewMode="calendar"
                  handleViewModeChange={() => {}}
                  alumnoId={studentData?._id}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard; 