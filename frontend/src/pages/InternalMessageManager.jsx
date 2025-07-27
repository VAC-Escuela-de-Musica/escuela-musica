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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  Badge,
  Paper
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  MusicNote as MusicNoteIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Group as GroupIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS, fetchCsrfToken } from '../config/api.js';

const InternalMessageManager = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [stats, setStats] = useState({});
  const [csrfToken, setCsrfToken] = useState(null);

  // Formulario de mensaje simplificado
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: 'all_students', // 'all_students', 'specific_student', 'specific_class'
    recipient: '',
    type: 'notification',
    priority: 'medium'
  });

  const [quickMessage, setQuickMessage] = useState({
    subject: '',
    content: '',
    recipientType: 'all_students',
    recipient: ''
  });
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(null);
  const [quickError, setQuickError] = useState(null);

  // Obtener token CSRF al cargar el componente
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const token = await fetchCsrfToken();
        if (token) {
          setCsrfToken(token);
        }
      } catch (error) {
        console.error('Error obteniendo CSRF token:', error);
      }
    };

    getCsrfToken();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener mensajes
      const messagesResponse = await fetch(API_ENDPOINTS.internalMessages.list, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.data || []);
      }

      // Obtener estudiantes
      const studentsResponse = await fetch(API_ENDPOINTS.alumnos.list, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.data || []);
      }

      // Obtener clases
      const classesResponse = await fetch(API_ENDPOINTS.clases.all, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        setClasses(classesData.data || []);
      }

      // Obtener estadísticas
      const statsResponse = await fetch(API_ENDPOINTS.internalMessages.stats, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {});
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.internalMessages.create, {
        method: 'POST',
        headers: {
          ...API_HEADERS.withAuth(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage.data]);
        setFormData({
          subject: '',
          content: '',
          recipientType: 'all_students',
          recipient: '',
          type: 'notification',
          priority: 'medium'
        });
        setOpenDialog(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear el mensaje');
      }
    } catch (error) {
      console.error('Error creating message:', error);
      setError('Error al crear el mensaje');
    }
  };

  const handleSendMessage = async (messageId) => {
    try {
      const response = await fetch(API_ENDPOINTS.internalMessages.send(messageId), {
        method: 'PUT',
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (response.ok) {
        // Actualizar el estado del mensaje
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, status: 'sent' } : msg
        ));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error al enviar el mensaje');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(API_ENDPOINTS.internalMessages.delete(messageId), {
        method: 'DELETE',
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== messageId));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al eliminar el mensaje');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Error al eliminar el mensaje');
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setFormData({
      subject: message.subject,
      content: message.content,
      recipientType: message.recipientType,
      recipient: message.recipient,
      type: message.type,
      priority: message.priority
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMessage(null);
    setFormData({
      subject: '',
      content: '',
      recipientType: 'all_students',
      recipient: '',
      type: 'notification',
      priority: 'medium'
    });
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'notification': return <NotificationsIcon />;
      case 'announcement': return <AnnouncementIcon />;
      case 'event': return <EventIcon />;
      default: return <InfoIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'draft': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const handleQuickSend = async () => {
    if (!quickMessage.subject || !quickMessage.content) {
      setQuickError('Por favor completa todos los campos');
      return;
    }

    try {
      setQuickLoading(true);
      setQuickError(null);
      setQuickSuccess(null);

      const response = await fetch(API_ENDPOINTS.internalMessages.create, {
        method: 'POST',
        headers: {
          ...API_HEADERS.withAuth(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...quickMessage,
          type: 'notification',
          priority: 'medium'
        })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages([...messages, newMessage.data]);
        setQuickMessage({
          subject: '',
          content: '',
          recipientType: 'all_students',
          recipient: ''
        });
        setQuickSuccess('Mensaje enviado exitosamente');
        
        // Limpiar el mensaje de éxito después de 3 segundos
        setTimeout(() => setQuickSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setQuickError(errorData.message || 'Error al enviar el mensaje');
      }
    } catch (error) {
      console.error('Error sending quick message:', error);
      setQuickError('Error al enviar el mensaje');
    } finally {
      setQuickLoading(false);
    }
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
    <Box sx={{ backgroundColor: '#333333', borderRadius: 2, p: 3 }}>
      {/* Formulario rápido mejorado */}
      <Paper elevation={3} sx={{ mb: 3, backgroundColor: '#444444', p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#ffffff', textAlign: 'center' }}>
          📨 Enviar Mensaje Interno
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#ffffff' }}>Destinatarios</InputLabel>
              <Select
                value={quickMessage.recipientType}
                onChange={e => setQuickMessage({ ...quickMessage, recipientType: e.target.value, recipient: '' })}
                sx={{ 
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                }}
              >
                <MenuItem value="all_students">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon />
                    Todos los estudiantes
                  </Box>
                </MenuItem>
                <MenuItem value="specific_student">
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon />
                    Estudiante específico
                  </Box>
                </MenuItem>
                <MenuItem value="specific_class">
                  <Box display="flex" alignItems="center" gap={1}>
                    <ClassIcon />
                    Clase específica
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {quickMessage.recipientType === 'specific_student' && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ffffff' }}>Seleccionar Estudiante</InputLabel>
                <Select
                  value={quickMessage.recipient}
                  onChange={e => setQuickMessage({ ...quickMessage, recipient: e.target.value })}
                  sx={{ 
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                  }}
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.nombreAlumno} - {student.rutAlumno}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {quickMessage.recipientType === 'specific_class' && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ffffff' }}>Seleccionar Clase</InputLabel>
                <Select
                  value={quickMessage.recipient}
                  onChange={e => setQuickMessage({ ...quickMessage, recipient: e.target.value })}
                  sx={{ 
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                  }}
                >
                  {classes.map((clase) => (
                    <MenuItem key={clase._id} value={clase._id}>
                      {clase.titulo} - {clase.sala}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Asunto del mensaje"
              value={quickMessage.subject}
              onChange={e => setQuickMessage({ ...quickMessage, subject: e.target.value })}
              fullWidth
              sx={{ 
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': { 
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <TextField
              label="Mensaje"
              value={quickMessage.content}
              onChange={e => setQuickMessage({ ...quickMessage, content: e.target.value })}
              fullWidth
              multiline
              rows={1}
              sx={{ 
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-root': { 
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#666666' },
                  '&:hover fieldset': { borderColor: '#888888' },
                  '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={12}>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleQuickSend}
                disabled={quickLoading || !quickMessage.subject || !quickMessage.content}
                startIcon={quickLoading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ 
                  minWidth: 200,
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {quickLoading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {quickSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {quickSuccess}
          </Alert>
        )}
        {quickError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {quickError}
          </Alert>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#444444' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#ffffff' }}>
                📊 Estadísticas de Mensajería
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {stats.total || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>Total Mensajes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {stats.sent || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>Enviados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {stats.drafts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>Borradores</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#cccccc' }}>Estudiantes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista de mensajes */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#444444' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#ffffff' }}>
                📋 Historial de Mensajes
              </Typography>
              {messages.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" sx={{ color: '#cccccc' }}>
                    No hay mensajes enviados aún
                  </Typography>
                </Box>
              ) : (
                <List>
                  {messages.map((message, index) => (
                    <React.Fragment key={message._id}>
                      <ListItem>
                        <ListItemIcon sx={{ color: '#ffffff' }}>
                          {getMessageIcon(message.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                                {message.subject}
                              </Typography>
                              <Chip 
                                label={message.status || 'draft'} 
                                color={getStatusColor(message.status)}
                                size="small"
                              />
                              <Chip 
                                label={message.priority} 
                                color={getPriorityColor(message.priority)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ color: '#cccccc' }}>
                                {message.content}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#999999' }}>
                                Enviado: {new Date(message.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                        <Box>
                          {message.status !== 'sent' && (
                            <IconButton
                              onClick={() => handleSendMessage(message._id)}
                              color="primary"
                              size="small"
                            >
                              <SendIcon />
                            </IconButton>
                          )}
                          <IconButton
                            onClick={() => handleEditMessage(message)}
                            color="info"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteMessage(message._id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                      {index < messages.length - 1 && <Divider sx={{ borderColor: '#666666' }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para editar mensaje */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          {editingMessage ? 'Editar Mensaje' : 'Nuevo Mensaje'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#333333', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Asunto"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                fullWidth
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-root': { 
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#666666' },
                    '&:hover fieldset': { borderColor: '#888888' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mensaje"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                fullWidth
                multiline
                rows={4}
                sx={{ 
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-root': { 
                    color: '#ffffff',
                    '& fieldset': { borderColor: '#666666' },
                    '&:hover fieldset': { borderColor: '#888888' },
                    '&.Mui-focused fieldset': { borderColor: '#2196F3' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#333333' }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#ffffff' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingMessage ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternalMessageManager; 