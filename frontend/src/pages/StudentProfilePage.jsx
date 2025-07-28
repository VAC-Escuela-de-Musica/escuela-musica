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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
  Button,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';
import ChangePasswordDialog from '../components/domain/auth/ChangePasswordDialog.jsx';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (user?.id) {
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.alumnos.getByUserId(user.id), {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar los datos del estudiante');
      }

      const data = await response.json();
      setStudentData(data.data);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('No se pudieron cargar los datos del estudiante');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
          Mi Perfil de Estudiante
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Información personal de solo lectura
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
          <Link 
            color="inherit" 
            href="/estudiante"
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Inicio
          </Link>
          <Typography color="text.primary">Mi Perfil</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Información principal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              py: { xs: 3, md: 4 },
              px: { xs: 2, md: 3 }
            }}>
              <Avatar
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2.5rem', sm: '3rem' },
                  fontWeight: 'bold'
                }}
              >
                {getInitials(studentData?.nombreAlumno || user?.username)}
              </Avatar>
              
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                component="h2" 
                gutterBottom 
                sx={{ fontWeight: 600 }}
              >
                {studentData?.nombreAlumno || user?.username || 'Estudiante'}
              </Typography>
              
              <Chip 
                label="Estudiante Activo" 
                color="success" 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Miembro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordDialogOpen(true)}
                fullWidth={isMobile}
                sx={{ 
                  mt: 1,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Información personal (solo lectura) */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Información Personal
              </Typography>
              
              <List sx={{ p: 0 }}>
                <ListItem sx={{ 
                  px: 0, 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}>
                  <ListItemIcon sx={{ 
                    minWidth: { xs: 'auto', sm: 40 },
                    mb: { xs: 1, sm: 0 }
                  }}>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nombre Completo"
                    secondary={studentData?.nombreAlumno || 'No especificado'}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'body1',
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  />
                </ListItem>
                
                <Divider sx={{ my: 2 }} />
                
                <ListItem sx={{ 
                  px: 0,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}>
                  <ListItemIcon sx={{ 
                    minWidth: { xs: 'auto', sm: 40 },
                    mb: { xs: 1, sm: 0 }
                  }}>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de Ingreso"
                    secondary={new Date(studentData?.fechaCreacion || user?.createdAt || Date.now()).toLocaleDateString()}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'body1',
                      textAlign: { xs: 'center', sm: 'left' }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo para cambiar contraseña */}
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onClose={() => setChangePasswordDialogOpen(false)}
        onSuccess={(message) => {
          setSnackbar({
            open: true,
            message: message,
            severity: 'success'
          });
        }}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          icon={snackbar.severity === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StudentProfilePage; 