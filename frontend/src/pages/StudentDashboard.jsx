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
  Link,
  useTheme,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import HorarioCalendar from '../components/domain/horario/HorarioCalendar.jsx';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Bienvenido, {studentData?.nombreAlumno || user?.username || 'Estudiante'}
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Aquí puedes ver tu información personal y tu calendario de clases
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography color="text.primary">Inicio</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Información del estudiante */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              {/* Header con avatar */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                mb: 3,
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar
                  sx={{ 
                    width: { xs: 80, sm: 64 }, 
                    height: { xs: 80, sm: 64 }, 
                    bgcolor: 'primary.main',
                    fontSize: { xs: '2rem', sm: '1.5rem' },
                    mb: { xs: 2, sm: 0 },
                    mr: { xs: 0, sm: 2 }
                  }}
                >
                  {studentData?.nombreAlumno?.charAt(0)?.toUpperCase() || 'E'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {studentData?.nombreAlumno || 'Estudiante'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email || 'estudiante@email.com'}
                  </Typography>
                  <Chip 
                    label="Activo" 
                    size="small" 
                    color="success" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Información detallada */}
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmailIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={studentData?.email || user?.email || 'No disponible'}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de Ingreso"
                    secondary={new Date(studentData?.fechaCreacion || user?.createdAt || Date.now()).toLocaleDateString()}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Calendario de clases */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 1, md: 3 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Mi Calendario de Clases
              </Typography>
              
              <Box sx={{ 
                minHeight: { xs: '400px', md: '600px' },
                '& .calendar-container': {
                  borderRadius: { xs: 1, md: 2 }
                }
              }}>
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