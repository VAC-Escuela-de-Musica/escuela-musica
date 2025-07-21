import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import messagingService from '../services/messagingService';

const HorarioAdmin = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('whatsapp'); // 'whatsapp' o 'email'
  const [messageMode, setMessageMode] = useState('template'); // 'template' o 'custom'
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipientInfo, setRecipientInfo] = useState({
    whatsapp: '',
    email: '',
    subject: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    whatsapp: false,
    email: false
  });

  // Datos de ejemplo para el horario
  const [horario, setHorario] = useState([
    {
      id: 1,
      dia: 'Lunes',
      hora: '09:00 - 10:30',
      materia: 'Matemáticas',
      profesor: 'Dr. García',
      aula: 'A-101',
      estado: 'Activo'
    },
    {
      id: 2,
      dia: 'Lunes',
      hora: '11:00 - 12:30',
      materia: 'Física',
      profesor: 'Dra. López',
      aula: 'A-102',
      estado: 'Activo'
    },
    {
      id: 3,
      dia: 'Martes',
      hora: '09:00 - 10:30',
      materia: 'Química',
      profesor: 'Dr. Martínez',
      aula: 'B-201',
      estado: 'Pendiente'
    },
    {
      id: 4,
      dia: 'Miércoles',
      hora: '14:00 - 15:30',
      materia: 'Historia',
      profesor: 'Dra. Rodríguez',
      aula: 'C-301',
      estado: 'Activo'
    }
  ]);

  const [newClass, setNewClass] = useState({
    dia: '',
    hora: '',
    materia: '',
    profesor: '',
    aula: '',
    estado: 'Activo'
  });

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Plantillas de mensaje
  const messageTemplates = {
    whatsapp: [
      {
        id: 'recordatorio_clase',
        title: 'Recordatorio de Clase',
        content: 'Hola! Te recordamos que tienes clase mañana. Por favor, asegúrate de estar presente y traer los materiales necesarios. ¡Nos vemos!'
      },
      {
        id: 'cambio_horario',
        title: 'Cambio de Horario',
        content: 'Hola! Te informamos que ha habido un cambio en el horario de tu clase. Por favor, revisa los nuevos horarios en el sistema. Gracias por tu comprensión.'
      },
      {
        id: 'clase_cancelada',
        title: 'Clase Cancelada',
        content: 'Hola! Te informamos que la clase de mañana ha sido cancelada. Te avisaremos cuando se reprograme. Disculpa las molestias.'
      },
      {
        id: 'material_requerido',
        title: 'Material Requerido',
        content: 'Hola! Para la próxima clase necesitarás traer los siguientes materiales: [especificar materiales]. Es importante que los tengas listos.'
      },
      {
        id: 'bienvenida',
        title: 'Mensaje de Bienvenida',
        content: '¡Bienvenido/a! Nos complace darte la bienvenida a nuestro programa. Estamos aquí para apoyarte en tu aprendizaje. ¡Que tengas un excelente día!'
      }
    ],
    email: [
      {
        id: 'recordatorio_clase_email',
        title: 'Recordatorio de Clase',
        subject: 'Recordatorio: Clase Programada',
        content: 'Estimado/a estudiante,\n\nTe recordamos que tienes clase programada para mañana. Por favor, asegúrate de estar presente y traer los materiales necesarios.\n\nSaludos cordiales,\nEquipo Académico'
      },
      {
        id: 'cambio_horario_email',
        title: 'Cambio de Horario',
        subject: 'Cambio en Horario de Clase',
        content: 'Estimado/a estudiante,\n\nTe informamos que ha habido un cambio en el horario de tu clase. Por favor, revisa los nuevos horarios en el sistema.\n\nGracias por tu comprensión.\n\nSaludos cordiales,\nEquipo Académico'
      },
      {
        id: 'clase_cancelada_email',
        title: 'Clase Cancelada',
        subject: 'Cancelación de Clase',
        content: 'Estimado/a estudiante,\n\nTe informamos que la clase programada ha sido cancelada. Te avisaremos cuando se reprograme.\n\nDisculpa las molestias.\n\nSaludos cordiales,\nEquipo Académico'
      },
      {
        id: 'material_requerido_email',
        title: 'Material Requerido',
        subject: 'Materiales Requeridos para Próxima Clase',
        content: 'Estimado/a estudiante,\n\nPara la próxima clase necesitarás traer los siguientes materiales:\n\n- [Material 1]\n- [Material 2]\n- [Material 3]\n\nEs importante que los tengas listos.\n\nSaludos cordiales,\nEquipo Académico'
      },
      {
        id: 'bienvenida_email',
        title: 'Mensaje de Bienvenida',
        subject: '¡Bienvenido/a a Nuestro Programa!',
        content: 'Estimado/a estudiante,\n\nNos complace darte la bienvenida a nuestro programa académico. Estamos aquí para apoyarte en tu proceso de aprendizaje y desarrollo.\n\nEsperamos que tengas una experiencia educativa enriquecedora.\n\nSaludos cordiales,\nEquipo Académico'
      }
    ]
  };

  const handleAddClass = () => {
    if (editingClass) {
      setHorario(horario.map(clase => 
        clase.id === editingClass.id ? { ...newClass, id: clase.id } : clase
      ));
    } else {
      setHorario([...horario, { ...newClass, id: Date.now() }]);
    }
    setNewClass({
      dia: '',
      hora: '',
      materia: '',
      profesor: '',
      aula: '',
      estado: 'Activo'
    });
    setEditingClass(null);
    setOpenDialog(false);
  };

  const handleEditClass = (clase) => {
    setEditingClass(clase);
    setNewClass(clase);
    setOpenDialog(true);
  };

  const handleDeleteClass = (id) => {
    setHorario(horario.filter(clase => clase.id !== id));
  };

  const handleTemplateSelect = (templateId) => {
    const templates = messageTemplates[messageType];
    const selectedTemplate = templates.find(t => t.id === templateId);
    
    if (selectedTemplate) {
      setMessageText(selectedTemplate.content);
      if (messageType === 'email' && selectedTemplate.subject) {
        setRecipientInfo(prev => ({ ...prev, subject: selectedTemplate.subject }));
      }
    }
  };

  const handleSendMessage = async () => {
    setIsSending(true);
    
    try {
      let result;
      
      if (messageType === 'whatsapp') {
        result = await messagingService.sendWhatsAppMessage(recipientInfo.whatsapp, messageText);
      } else {
        result = await messagingService.sendEmail(recipientInfo.email, recipientInfo.subject, messageText);
      }
      
      // Mostrar mensaje de éxito
      alert(result.message || 'Mensaje enviado correctamente');
      
      // Limpiar formulario
      setMessageText('');
      setRecipientInfo({ whatsapp: '', email: '', subject: '' });
      setSelectedTemplate('');
      setOpenMessageDialog(false);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert(`Error al enviar mensaje: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Verificar estado de las APIs al cargar el componente
  React.useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const status = await messagingService.getConfigurationStatus();
        setApiStatus({
          whatsapp: status.data?.services?.whatsapp || false,
          email: status.data?.services?.email || false
        });
      } catch (error) {
        console.error('Error verificando estado de APIs:', error);
      }
    };
    
    checkApiStatus();
  }, []);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Activo':
        return 'success';
      case 'Pendiente':
        return 'warning';
      case 'Cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#222222', minHeight: '100vh', color: '#ffffff' }}>
      {/* Header con botón de mensajería */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ScheduleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />
          <Typography variant="h4" component="h1" sx={{ color: '#ffffff' }}>
            Gestión de Horario
          </Typography>
        </Box>
        
        {/* Botón de mensajería en la parte superior derecha */}
        <Tooltip title="Mensajería">
          <Fab
            color="primary"
            aria-label="mensajería"
            onClick={() => setOpenMessageDialog(true)}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            <MessageIcon />
          </Fab>
        </Tooltip>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, backgroundColor: '#333333', color: '#ffffff' }}>
            <Typography variant="h6">Total Clases</Typography>
            <Typography variant="h4" sx={{ color: '#4CAF50' }}>{horario.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, backgroundColor: '#333333', color: '#ffffff' }}>
            <Typography variant="h6">Clases Activas</Typography>
            <Typography variant="h4" sx={{ color: '#4CAF50' }}>
              {horario.filter(c => c.estado === 'Activo').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, backgroundColor: '#333333', color: '#ffffff' }}>
            <Typography variant="h6">Pendientes</Typography>
            <Typography variant="h4" sx={{ color: '#FF9800' }}>
              {horario.filter(c => c.estado === 'Pendiente').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, backgroundColor: '#333333', color: '#ffffff' }}>
            <Typography variant="h6">Días Activos</Typography>
            <Typography variant="h4" sx={{ color: '#2196F3' }}>
              {new Set(horario.map(c => c.dia)).size}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Botón para agregar nueva clase */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#45a049'
            }
          }}
        >
          Agregar Nueva Clase
        </Button>
      </Box>

      {/* Tabla del horario */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#333333' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Día</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Hora</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Materia</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Profesor</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Aula</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {horario.map((clase) => (
              <TableRow key={clase.id} sx={{ '&:hover': { backgroundColor: '#444444' } }}>
                <TableCell sx={{ color: '#ffffff' }}>{clase.dia}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{clase.hora}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{clase.materia}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{clase.profesor}</TableCell>
                <TableCell sx={{ color: '#ffffff' }}>{clase.aula}</TableCell>
                <TableCell>
                  <Chip
                    label={clase.estado}
                    color={getStatusColor(clase.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEditClass(clase)}
                    sx={{ color: '#2196F3' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteClass(clase.id)}
                    sx={{ color: '#f44336' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para agregar/editar clase */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          {editingClass ? 'Editar Clase' : 'Agregar Nueva Clase'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Día"
                value={newClass.dia}
                onChange={(e) => setNewClass({ ...newClass, dia: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              >
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia} style={{ backgroundColor: '#333333', color: '#ffffff' }}>
                    {dia}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hora (ej: 09:00 - 10:30)"
                value={newClass.hora}
                onChange={(e) => setNewClass({ ...newClass, hora: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Materia"
                value={newClass.materia}
                onChange={(e) => setNewClass({ ...newClass, materia: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Profesor"
                value={newClass.profesor}
                onChange={(e) => setNewClass({ ...newClass, profesor: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aula"
                value={newClass.aula}
                onChange={(e) => setNewClass({ ...newClass, aula: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={newClass.estado}
                onChange={(e) => setNewClass({ ...newClass, estado: e.target.value })}
                sx={{ 
                  '& .MuiOutlinedInput-root': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#ffffff' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                }}
              >
                {['Activo', 'Pendiente', 'Cancelado'].map((estado) => (
                  <option key={estado} value={estado} style={{ backgroundColor: '#333333', color: '#ffffff' }}>
                    {estado}
                  </option>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#333333' }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#ffffff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddClass}
            variant="contained"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            {editingClass ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de mensajería */}
      <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          Sistema de Mensajería
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#333333', color: '#ffffff' }}>
          {/* Selector de tipo de mensaje */}
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
              Selecciona el tipo de mensaje:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={messageType === 'whatsapp' ? 'contained' : 'outlined'}
                startIcon={<WhatsAppIcon />}
                onClick={() => setMessageType('whatsapp')}
                sx={{
                  backgroundColor: messageType === 'whatsapp' ? '#25D366' : 'transparent',
                  borderColor: '#25D366',
                  color: messageType === 'whatsapp' ? '#ffffff' : '#25D366',
                  '&:hover': {
                    backgroundColor: messageType === 'whatsapp' ? '#128C7E' : 'rgba(37, 211, 102, 0.1)'
                  }
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant={messageType === 'email' ? 'contained' : 'outlined'}
                startIcon={<EmailIcon />}
                onClick={() => setMessageType('email')}
                sx={{
                  backgroundColor: messageType === 'email' ? '#2196F3' : 'transparent',
                  borderColor: '#2196F3',
                  color: messageType === 'email' ? '#ffffff' : '#2196F3',
                  '&:hover': {
                    backgroundColor: messageType === 'email' ? '#1976D2' : 'rgba(33, 150, 243, 0.1)'
                  }
                }}
              >
                Email
              </Button>
            </Box>
          </Box>

          {/* Campos específicos según el tipo de mensaje */}
          {messageType === 'whatsapp' && (
            <TextField
              fullWidth
              label="Número de WhatsApp (con código de país)"
              value={recipientInfo.whatsapp}
              onChange={(e) => setRecipientInfo({ ...recipientInfo, whatsapp: e.target.value })}
              placeholder="Ej: 34612345678"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': { color: '#ffffff' },
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
              }}
            />
          )}

          {messageType === 'email' && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email del destinatario"
                  value={recipientInfo.email}
                  onChange={(e) => setRecipientInfo({ ...recipientInfo, email: e.target.value })}
                  placeholder="ejemplo@email.com"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Asunto del email"
                  value={recipientInfo.subject}
                  onChange={(e) => setRecipientInfo({ ...recipientInfo, subject: e.target.value })}
                  placeholder="Asunto del mensaje"
                  sx={{ 
                    '& .MuiOutlinedInput-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
                  }}
                />
              </Grid>
            </Grid>
          )}

          {/* Selector de modo de mensaje */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
              Tipo de mensaje:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={messageMode === 'template' ? 'contained' : 'outlined'}
                onClick={() => setMessageMode('template')}
                sx={{
                  backgroundColor: messageMode === 'template' ? '#FF9800' : 'transparent',
                  borderColor: '#FF9800',
                  color: messageMode === 'template' ? '#ffffff' : '#FF9800',
                  '&:hover': {
                    backgroundColor: messageMode === 'template' ? '#F57C00' : 'rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                Plantilla de Mensaje
              </Button>
              <Button
                variant={messageMode === 'custom' ? 'contained' : 'outlined'}
                onClick={() => {
                  setMessageMode('custom');
                  setMessageText('');
                  setSelectedTemplate('');
                }}
                sx={{
                  backgroundColor: messageMode === 'custom' ? '#9C27B0' : 'transparent',
                  borderColor: '#9C27B0',
                  color: messageMode === 'custom' ? '#ffffff' : '#9C27B0',
                  '&:hover': {
                    backgroundColor: messageMode === 'custom' ? '#7B1FA2' : 'rgba(156, 39, 176, 0.1)'
                  }
                }}
              >
                Escribir Mensaje
              </Button>
            </Box>
          </Box>

          {/* Plantillas de mensaje */}
          {messageMode === 'template' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#ffffff' }}>
                Selecciona una plantilla:
              </Typography>
              <Grid container spacing={2}>
                {messageTemplates[messageType].map((template) => (
                  <Grid item xs={12} sm={6} key={template.id}>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: selectedTemplate === template.id ? '#555555' : '#444444',
                        border: selectedTemplate === template.id ? '2px solid #FF9800' : '1px solid #666666',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#555555',
                          borderColor: '#FF9800'
                        }
                      }}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        handleTemplateSelect(template.id);
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 1 }}>
                        {template.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#cccccc', fontSize: '0.8rem' }}>
                        {template.content.substring(0, 80)}...
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Campo de mensaje */}
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Mensaje"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={messageMode === 'template' ? 
              "Selecciona una plantilla arriba o personaliza el mensaje aquí..." : 
              (messageType === 'whatsapp' ? 
                "Escribe tu mensaje de WhatsApp aquí..." : 
                "Escribe el contenido del email aquí..."
              )
            }
            sx={{ 
              '& .MuiOutlinedInput-root': { color: '#ffffff' },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#666666' }
            }}
          />

          {/* Información adicional */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#444444', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#cccccc' }}>
              {messageMode === 'template' ? 
                "💡 Selecciona una plantilla predefinida y personalízala según tus necesidades" :
                "💡 Escribe tu mensaje personalizado desde cero"
              }
              <br />
              {messageType === 'whatsapp' ? 
                `📱 ${apiStatus.whatsapp ? 'Callmebot configurado y listo' : 'Callmebot no configurado'}` :
                `📧 ${apiStatus.email ? 'API de Email configurada y lista' : 'API de Email no configurada'}`
              }
              <br />
              {apiStatus.whatsapp && 
                "✅ Callmebot está configurado. Los mensajes se enviarán por WhatsApp (desde el bot de Callmebot)"
              }
              {!apiStatus.whatsapp && !apiStatus.email && 
                "⚠️ Configura Callmebot en el backend para enviar mensajes reales"
              }
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#333333' }}>
          <Button 
            onClick={() => {
              setOpenMessageDialog(false);
              setMessageText('');
              setRecipientInfo({ whatsapp: '', email: '', subject: '' });
              setSelectedTemplate('');
              setMessageMode('template');
            }}
            sx={{ color: '#ffffff' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSendMessage}
            variant="contained"
            disabled={
              isSending || 
              !messageText || 
              (messageType === 'whatsapp' && !recipientInfo.whatsapp) || 
              (messageType === 'email' && (!recipientInfo.email || !recipientInfo.subject)) ||
              (messageType === 'whatsapp' && !apiStatus.whatsapp) ||
              (messageType === 'email' && !apiStatus.email)
            }
            sx={{
              backgroundColor: messageType === 'whatsapp' ? '#25D366' : '#2196F3',
              '&:hover': {
                backgroundColor: messageType === 'whatsapp' ? '#128C7E' : '#1976D2'
              },
              '&:disabled': {
                backgroundColor: '#666666',
                color: '#999999'
              }
            }}
          >
            {isSending ? 'Enviando...' : (messageType === 'whatsapp' ? 'Enviar por WhatsApp' : 'Enviar Email')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorarioAdmin; 