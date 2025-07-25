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
  Badge
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
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS, fetchCsrfToken } from '../config/api.js';

const InternalMessageManager = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [stats, setStats] = useState({});
  const [csrfToken, setCsrfToken] = useState(null);

  // Formulario de mensaje
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipientType: 'all_students',
    recipient: '',
    filters: {
      instrument: '',
      level: '',
      activeOnly: true
    },
    type: 'notification',
    priority: 'medium',
    delivery: {
      sendInternal: true,
      sendEmail: false,
      sendWhatsApp: false
    },
    scheduledFor: ''
  });

  const [quickMessage, setQuickMessage] = useState({
    subject: '',
    content: '',
    recipientType: 'all_students',
    recipient: '',
    filters: { instrument: '', level: '', activeOnly: true },
    type: 'notification',
    priority: 'medium',
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

      // Obtener estadísticas
      const statsResponse = await fetch(API_ENDPOINTS.internalMessages.stats, {
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {});
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        ...API_HEADERS.withAuth(),
        'Content-Type': 'application/json'
      };
      
      if (csrfToken) {
        headers['_csrf'] = csrfToken;
      }

      const response = await fetch(API_ENDPOINTS.internalMessages.create, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al crear el mensaje');
      }

      setFormData({
        subject: '',
        content: '',
        recipientType: 'all_students',
        recipient: '',
        filters: { instrument: '', level: '', activeOnly: true },
        type: 'notification',
        priority: 'medium',
        delivery: { sendInternal: true, sendEmail: false, sendWhatsApp: false },
        scheduledFor: ''
      });
      setOpenDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (messageId) => {
    try {
      const headers = {
        ...API_HEADERS.withAuth()
      };
      
      if (csrfToken) {
        headers['_csrf'] = csrfToken;
      }

      const response = await fetch(API_ENDPOINTS.internalMessages.send(messageId), {
        method: 'PUT',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al enviar el mensaje');
      }

      // Actualizar estado del mensaje
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, status: 'sent', sentAt: new Date() } : msg
      ));

      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
      return;
    }

    try {
      const headers = {
        ...API_HEADERS.withAuth()
      };
      
      if (csrfToken) {
        headers['_csrf'] = csrfToken;
      }

      const response = await fetch(API_ENDPOINTS.internalMessages.delete(messageId), {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el mensaje');
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      setError(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setFormData({
      subject: message.subject,
      content: message.content,
      recipientType: message.recipientType,
      recipient: message.recipient || '',
      filters: message.filters || { instrument: '', level: '', activeOnly: true },
      type: message.type,
      priority: message.priority,
      delivery: message.delivery || { sendInternal: true, sendEmail: false, sendWhatsApp: false },
      scheduledFor: message.scheduledFor || ''
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
      filters: { instrument: '', level: '', activeOnly: true },
      type: 'notification',
      priority: 'medium',
      delivery: { sendInternal: true, sendEmail: false, sendWhatsApp: false },
      scheduledFor: ''
    });
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'notification': return <NotificationsIcon color="primary" />;
      case 'announcement': return <AnnouncementIcon color="secondary" />;
      case 'reminder': return <ScheduleIcon color="warning" />;
      case 'event': return <EventIcon color="success" />;
      case 'info': return <InfoIcon color="info" />;
      default: return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'draft': return 'warning';
      case 'delivered': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  // Nuevo: Envío rápido de mensaje
  const handleQuickSend = async () => {
    setQuickLoading(true);
    setQuickSuccess(null);
    setQuickError(null);
    
    try {
      const headers = {
        ...API_HEADERS.withAuth(),
        'Content-Type': 'application/json'
      };
      
      // Agregar CSRF token si está disponible
      if (csrfToken) {
        headers['_csrf'] = csrfToken;
      }

      const response = await fetch(API_ENDPOINTS.internalMessages.create, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...quickMessage,
          delivery: { sendInternal: true, sendEmail: false, sendWhatsApp: false }
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || 'Error al enviar el mensaje');
        } catch (parseError) {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }
      
      const responseData = await response.json();
      
      setQuickSuccess('Mensaje enviado correctamente');
      setQuickMessage({
        subject: '',
        content: '',
        recipientType: 'all_students',
        recipient: '',
        filters: { instrument: '', level: '', activeOnly: true },
        type: 'notification',
        priority: 'medium',
      });
      fetchData();
    } catch (err) {
      console.error('Error en handleQuickSend:', err);
      setQuickError(err.message);
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
      {/* NUEVO: Formulario rápido de mensaje interno */}
      <Card sx={{ mb: 3, backgroundColor: '#444444' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ffffff' }}>
            Enviar Mensaje Rápido Interno
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#ffffff' }}>Destinatario</InputLabel>
                <Select
                  value={quickMessage.recipientType}
                  onChange={e => setQuickMessage({ ...quickMessage, recipientType: e.target.value })}
                  size="small"
                  sx={{ 
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                  }}
                >
                  <MenuItem value="all_students">Todos los Estudiantes</MenuItem>
                  <MenuItem value="individual">Estudiante Específico</MenuItem>
                  <MenuItem value="by_instrument">Por Instrumento</MenuItem>
                  <MenuItem value="by_level">Por Nivel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {quickMessage.recipientType === 'individual' && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#ffffff' }}>Estudiante</InputLabel>
                  <Select
                    value={quickMessage.recipient}
                    onChange={e => setQuickMessage({ ...quickMessage, recipient: e.target.value })}
                    size="small"
                    sx={{ 
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                    }}
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>{student.nombreAlumno}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {quickMessage.recipientType === 'by_instrument' && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#ffffff' }}>Instrumento</InputLabel>
                  <Select
                    value={quickMessage.filters.instrument}
                    onChange={e => setQuickMessage({ ...quickMessage, filters: { ...quickMessage.filters, instrument: e.target.value } })}
                    size="small"
                    sx={{ 
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                    }}
                  >
                    <MenuItem value="Piano">Piano</MenuItem>
                    <MenuItem value="Guitarra">Guitarra</MenuItem>
                    <MenuItem value="Violín">Violín</MenuItem>
                    <MenuItem value="Flauta">Flauta</MenuItem>
                    <MenuItem value="Batería">Batería</MenuItem>
                    <MenuItem value="Canto">Canto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {quickMessage.recipientType === 'by_level' && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#ffffff' }}>Nivel</InputLabel>
                  <Select
                    value={quickMessage.filters.level}
                    onChange={e => setQuickMessage({ ...quickMessage, filters: { ...quickMessage.filters, level: e.target.value } })}
                    size="small"
                    sx={{ 
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888888' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2196F3' }
                    }}
                  >
                    <MenuItem value="Principiante">Principiante</MenuItem>
                    <MenuItem value="Intermedio">Intermedio</MenuItem>
                    <MenuItem value="Avanzado">Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={2}>
              <TextField
                label="Asunto"
                value={quickMessage.subject}
                onChange={e => setQuickMessage({ ...quickMessage, subject: e.target.value })}
                size="small"
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
            <Grid item xs={12} sm={3}>
              <TextField
                label="Mensaje"
                value={quickMessage.content}
                onChange={e => setQuickMessage({ ...quickMessage, content: e.target.value })}
                size="small"
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
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleQuickSend}
                disabled={quickLoading || !quickMessage.subject || !quickMessage.content}
                fullWidth
              >
                Enviar
              </Button>
            </Grid>
          </Grid>
          {quickSuccess && <Alert severity="success" sx={{ mt: 2 }}>{quickSuccess}</Alert>}
          {quickError && <Alert severity="error" sx={{ mt: 2 }}>{quickError}</Alert>}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Estadísticas
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {stats.total || 0}
                    </Typography>
                    <Typography variant="body2">Total Mensajes</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {stats.sent || 0}
                    </Typography>
                    <Typography variant="body2">Enviados</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {stats.drafts || 0}
                    </Typography>
                    <Typography variant="body2">Borradores</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {students.length}
                    </Typography>
                    <Typography variant="body2">Estudiantes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Botón para crear mensaje */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mensajes
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Nuevo Mensaje
            </Button>
          </Box>
        </Grid>

        {/* Lista de mensajes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              {messages.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No hay mensajes creados
                  </Typography>
                </Box>
              ) : (
                <List>
                  {messages.map((message, index) => (
                    <React.Fragment key={message._id}>
                      <ListItem>
                        <ListItemIcon>
                          {getMessageIcon(message.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {message.subject}
                              </Typography>
                              <Chip 
                                label={message.status} 
                                size="small" 
                                color={getStatusColor(message.status)}
                              />
                              <Chip 
                                label={message.priority} 
                                size="small" 
                                color={getPriorityColor(message.priority)}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {message.content}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Tipo: {message.recipientType}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Creado: {new Date(message.createdAt).toLocaleDateString()}
                                </Typography>
                                {message.sentAt && (
                                  <Typography variant="caption" color="text.secondary">
                                    Enviado: {new Date(message.sentAt).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {message.status === 'draft' && (
                            <IconButton
                              size="small"
                              onClick={() => handleSendMessage(message._id)}
                              color="primary"
                            >
                              <SendIcon />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleEditMessage(message)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          {message.status === 'draft' && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMessage(message._id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItem>
                      {index < messages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para crear/editar mensaje */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMessage ? 'Editar Mensaje' : 'Nuevo Mensaje'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asunto"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contenido"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Mensaje</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="notification">Notificación</MenuItem>
                  <MenuItem value="announcement">Anuncio</MenuItem>
                  <MenuItem value="reminder">Recordatorio</MenuItem>
                  <MenuItem value="event">Evento</MenuItem>
                  <MenuItem value="info">Información</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Destinatario</InputLabel>
                <Select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                >
                  <MenuItem value="all_students">Todos los Estudiantes</MenuItem>
                  <MenuItem value="individual">Estudiante Específico</MenuItem>
                  <MenuItem value="by_instrument">Por Instrumento</MenuItem>
                  <MenuItem value="by_level">Por Nivel</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.recipientType === 'individual' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Estudiante</InputLabel>
                  <Select
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  >
                    {students.map((student) => (
                      <MenuItem key={student._id} value={student._id}>
                        {student.nombreAlumno}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.recipientType === 'by_instrument' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Instrumento</InputLabel>
                  <Select
                    value={formData.filters.instrument}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, instrument: e.target.value }
                    })}
                  >
                    <MenuItem value="Piano">Piano</MenuItem>
                    <MenuItem value="Guitarra">Guitarra</MenuItem>
                    <MenuItem value="Violín">Violín</MenuItem>
                    <MenuItem value="Flauta">Flauta</MenuItem>
                    <MenuItem value="Batería">Batería</MenuItem>
                    <MenuItem value="Canto">Canto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.recipientType === 'by_level' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Nivel</InputLabel>
                  <Select
                    value={formData.filters.level}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, level: e.target.value }
                    })}
                  >
                    <MenuItem value="Principiante">Principiante</MenuItem>
                    <MenuItem value="Intermedio">Intermedio</MenuItem>
                    <MenuItem value="Avanzado">Avanzado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Configuración de Entrega</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.delivery.sendInternal}
                            onChange={(e) => setFormData({
                              ...formData,
                              delivery: { ...formData.delivery, sendInternal: e.target.checked }
                            })}
                          />
                        }
                        label="Sistema Interno"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.delivery.sendEmail}
                            onChange={(e) => setFormData({
                              ...formData,
                              delivery: { ...formData.delivery, sendEmail: e.target.checked }
                            })}
                          />
                        }
                        label="Email"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.delivery.sendWhatsApp}
                            onChange={(e) => setFormData({
                              ...formData,
                              delivery: { ...formData.delivery, sendWhatsApp: e.target.checked }
                            })}
                          />
                        }
                        label="WhatsApp"
                      />
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMessage ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InternalMessageManager; 