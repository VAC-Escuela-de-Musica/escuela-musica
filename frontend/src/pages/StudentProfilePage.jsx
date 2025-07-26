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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Email as EmailIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CalendarToday as CalendarTodayIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';

const StudentProfilePage = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditForm({ [field]: currentValue || '' });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditForm({});
  };

  const handleSaveField = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.alumnos.base}/profile/update`, {
        method: 'PUT',
        headers: {
          ...API_HEADERS.withAuth(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la información');
      }

      const updatedData = await response.json();
      setStudentData(updatedData.data);
      setEditingField(null);
      setEditForm({});
      setSnackbar({
        open: true,
        message: 'Información actualizada correctamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating student data:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Error al actualizar la información',
        severity: 'error'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderEditableField = (field, label, currentValue, icon, type = 'text', options = null) => {
    const isEditing = editingField === field;

    return (
      <ListItem>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={label}
          secondary={
            isEditing ? (
              <Box sx={{ mt: 1 }}>
                {type === 'select' ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={editForm[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="">Seleccionar...</MenuItem>
                      {options?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    value={editForm[field] || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    type={type}
                    placeholder={`Ingresa tu ${label.toLowerCase()}`}
                  />
                )}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveField}
                  >
                    Guardar
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">
                  {currentValue || 'No especificado'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleEditField(field, currentValue)}
                  sx={{ ml: 1 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )
          }
        />
      </ListItem>
    );
  };

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
          Mi Perfil de Estudiante
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Gestiona tu información personal y de contacto
        </Typography>
        
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link color="inherit" href="/estudiante">
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

      <Grid container spacing={3}>
        {/* Información principal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(studentData?.nombreAlumno || user?.username)}
              </Avatar>
              
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                {studentData?.nombreAlumno || user?.username || 'Estudiante'}
              </Typography>
              
              <Chip 
                label="Estudiante Activo" 
                color="success" 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                Miembro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Información personal (solo lectura) */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Información Personal
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nombre Completo"
                    secondary={studentData?.nombreAlumno || 'No especificado'}
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="RUT"
                    secondary={studentData?.rut || 'No especificado'}
                  />
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Fecha de Registro"
                    secondary={new Date(studentData?.fechaCreacion || user?.createdAt || Date.now()).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de contacto (editable) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Información de Contacto
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Puedes editar tu información de contacto haciendo clic en el ícono de editar
              </Typography>
              
              <List>
                {renderEditableField(
                  'email',
                  'Correo Electrónico',
                  studentData?.email || user?.email,
                  <EmailIcon color="primary" />,
                  'email'
                )}
                
                <Divider />
                
                {renderEditableField(
                  'telefono',
                  'Teléfono',
                  studentData?.telefono,
                  <PhoneIcon color="primary" />,
                  'tel'
                )}
                
                <Divider />
                
                {renderEditableField(
                  'direccion',
                  'Dirección',
                  studentData?.direccion,
                  <LocationIcon color="primary" />,
                  'text'
                )}
                
                <Divider />
                
                {renderEditableField(
                  'instrumento',
                  'Instrumento Principal',
                  studentData?.instrumento,
                  <SchoolIcon color="primary" />,
                  'select',
                  [
                    { value: 'Piano', label: 'Piano' },
                    { value: 'Guitarra', label: 'Guitarra' },
                    { value: 'Violín', label: 'Violín' },
                    { value: 'Flauta', label: 'Flauta' },
                    { value: 'Batería', label: 'Batería' },
                    { value: 'Canto', label: 'Canto' },
                    { value: 'Otro', label: 'Otro' }
                  ]
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información adicional */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Información Adicional
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {studentData?.edad || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Edad
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {studentData?.nivel || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Nivel
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {studentData?.telefono ? '📞' : '❌'}
                    </Typography>
                    <Typography variant="body2">
                      Teléfono
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {studentData?.direccion ? '📍' : '❌'}
                    </Typography>
                    <Typography variant="body2">
                      Dirección
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notas y observaciones */}
        {studentData?.observaciones && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Observaciones
                </Typography>
                <Typography variant="body1" sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  {studentData.observaciones}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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