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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  Badge,
  IconButton,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Announcement as AnnouncementIcon,
  Event as EventIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../config/api.js';

const StudentMessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {}
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
    }
  }, [user?.id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Obtener mensajes del estudiante
      const response = await fetch(`${API_ENDPOINTS.internalMessages.getStudentMessages(user.id)}`, {
        method: 'GET',
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al cargar los mensajes');
      }

      const data = await response.json();
      setMessages(data.data || []);

      // Calcular estadísticas
      const unreadCount = data.data?.filter(m => !m.readBy?.some(read => read.student === user.id))?.length || 0;
      const byType = {};
      data.data?.forEach(message => {
        byType[message.type] = (byType[message.type] || 0) + 1;
      });

      setStats({
        total: data.data?.length || 0,
        unread: unreadCount,
        byType
      });

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.internalMessages.markAsRead(messageId)}`, {
        method: 'PUT',
        headers: API_HEADERS.withAuth(),
        credentials: 'include'
      });

      if (response.ok) {
        // Actualizar el estado local
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), { student: user.id, readAt: new Date() }] }
            : msg
        ));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <AnnouncementIcon color="secondary" />;
      case 'event':
        return <EventIcon color="success" />;
      case 'reminder':
        return <ScheduleIcon color="warning" />;
      case 'notification':
        return <NotificationsIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <TrendingUpIcon color="error" fontSize="small" />;
      case 'medium':
        return <TrendingUpIcon color="warning" fontSize="small" />;
      case 'low':
        return <TrendingDownIcon color="success" fontSize="small" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = Math.floor((now - messageDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ayer';
    return messageDate.toLocaleDateString();
  };

  const isMessageRead = (message) => {
    return message.readBy?.some(read => read.student === user.id);
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
          Mensajes y Notificaciones
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          Mantente al día con las últimas noticias y comunicaciones de la escuela
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
          <Typography color="text.primary">Mensajes</Typography>
        </Breadcrumbs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Lista de mensajes */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  sx={{ 
                    fontWeight: 600,
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  Mensajes Recientes
                </Typography>
                <Badge badgeContent={stats.unread} color="error">
                  <NotificationsIcon />
                </Badge>
              </Box>
              
              {messages.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No hay mensajes disponibles
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {messages.map((message, index) => (
                    <React.Fragment key={message._id}>
                      <ListItem 
                        sx={{ 
                          backgroundColor: isMessageRead(message) ? 'transparent' : 'action.hover',
                          borderRadius: 2,
                          mb: 1,
                          cursor: 'pointer',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          p: { xs: 2, sm: 1 }
                        }}
                        onClick={() => !isMessageRead(message) && markAsRead(message._id)}
                      >
                        <ListItemIcon sx={{ 
                          minWidth: { xs: 'auto', sm: 40 },
                          mb: { xs: 1, sm: 0 }
                        }}>
                          {getMessageIcon(message.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              gap: 1,
                              mb: { xs: 1, sm: 0 }
                            }}>
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  fontWeight: isMessageRead(message) ? 400 : 600,
                                  color: isMessageRead(message) ? 'text.primary' : 'primary.main',
                                  textAlign: { xs: 'center', sm: 'left' }
                                }}
                              >
                                {message.subject}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                flexWrap: 'wrap',
                                justifyContent: { xs: 'center', sm: 'flex-start' }
                              }}>
                                {getPriorityIcon(message.priority)}
                                <Chip 
                                  label={message.priority} 
                                  size="small" 
                                  color={getPriorityColor(message.priority)}
                                  variant="outlined"
                                />
                                {!isMessageRead(message) && (
                                  <Chip 
                                    label="Nuevo" 
                                    size="small" 
                                    color="error"
                                    variant="filled"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: { xs: 1, sm: 0 } }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1,
                                  textAlign: { xs: 'center', sm: 'left' }
                                }}
                              >
                                {message.content}
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'center', sm: 'flex-start' },
                                gap: { xs: 0.5, sm: 2 }
                              }}>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(message.createdAt)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  De: {message.sender?.username || 'Administración'}
                                </Typography>
                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: 0.5,
                                  flexWrap: 'wrap',
                                  justifyContent: { xs: 'center', sm: 'flex-start' }
                                }}>
                                  {message.delivery?.sendEmail && (
                                    <Chip label="Email" size="small" variant="outlined" />
                                  )}
                                  {message.delivery?.sendWhatsApp && (
                                    <Chip label="WhatsApp" size="small" variant="outlined" />
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                        {!isMessageRead(message) && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(message._id);
                            }}
                            sx={{ 
                              ml: { xs: 0, sm: 1 },
                              mt: { xs: 1, sm: 0 }
                            }}
                          >
                            <CheckCircleIcon color="primary" />
                          </IconButton>
                        )}
                      </ListItem>
                      {index < messages.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panel lateral con estadísticas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Resumen
              </Typography>
              
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <NotificationsIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total de mensajes"
                    secondary={stats.total}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <EmailIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="No leídos"
                    secondary={stats.unread}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <AnnouncementIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Anuncios"
                    secondary={stats.byType.announcement || 0}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <EventIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Eventos"
                    secondary={stats.byType.event || 0}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <ScheduleIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recordatorios"
                    secondary={stats.byType.reminder || 0}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 600,
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                    secondaryTypographyProps={{ 
                      textAlign: { xs: 'center', md: 'left' }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                Tipos de Mensajes
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                alignItems: { xs: 'center', md: 'flex-start' }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsIcon color="primary" fontSize="small" />
                  <Typography variant="body2">Notificaciones</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AnnouncementIcon color="secondary" fontSize="small" />
                  <Typography variant="body2">Anuncios</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon color="success" fontSize="small" />
                  <Typography variant="body2">Eventos</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="warning" fontSize="small" />
                  <Typography variant="body2">Recordatorios</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="info" fontSize="small" />
                  <Typography variant="body2">Información</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentMessagesPage; 