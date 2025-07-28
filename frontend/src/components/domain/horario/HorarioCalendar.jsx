import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Collapse,
  Fade,
} from '@mui/material';
import {
  Today as TodayIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon,
  CalendarMonth,
  List,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material';
import './HorarioCalendar.css';
import { useAuth } from '../../../context/AuthContext.jsx';
import { API_ENDPOINTS, API_HEADERS } from '../../../config/api.js';

const API_URL = `${import.meta.env.VITE_API_URL}/api/clases`;

const fetchAutenticado = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  return response;
};

const HorarioCalendar = ({ viewMode, handleViewModeChange, alumnoId = null }) => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const calendarRef = useRef(null);

  // Cargar clases según el contexto (todas o del estudiante)
  const cargarClases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      if (alumnoId) {
        console.log('[CALENDAR-DEBUG] Cargando clases del estudiante:', alumnoId);
        url = `${API_URL}/estudiante/${alumnoId}`;
      } else {
        console.log('[CALENDAR-DEBUG] Cargando todas las clases programadas...');
        url = `${API_URL}/programadas`;
      }
      
      const response = await fetchAutenticado(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[CALENDAR-DEBUG] Clases recibidas:', data);
      
      const clases = data.data || [];
      
      // Convertir clases a eventos de FullCalendar
      const eventosCalendario = [];
      
      for (const clase of clases) {
        // Filtrar clases canceladas - no mostrarlas en el calendario
        if (clase.estado === 'cancelada') {
          continue;
        }
        
        // Procesar cada horario de la clase
        if (clase.horarios && clase.horarios.length > 0) {
          for (const horario of clase.horarios) {
            // Convertir fecha DD-MM-YYYY a formato Date
            const [dia, mes, año] = horario.dia.split('-');
            const fechaClase = new Date(año, mes - 1, dia);
            
            // Convertir horas HH:MM a formato Date
            const [horaI, minI] = horario.horaInicio.split(':');
            const [horaF, minF] = horario.horaFin.split(':');
            
            const fechaInicio = new Date(fechaClase);
            fechaInicio.setHours(parseInt(horaI), parseInt(minI));
            
            const fechaFin = new Date(fechaClase);
            fechaFin.setHours(parseInt(horaF), parseInt(minF));
            
            // Determinar color según estado
            let backgroundColor = '#2196F3';
            let borderColor = '#1976D2';
            let textColor = '#ffffff';
            
            if (clase.estado === 'completada') {
              backgroundColor = '#4caf50';
              borderColor = '#388e3c';
            }
            
            eventosCalendario.push({
              id: `${clase._id}-${horario.dia}`,
              title: clase.titulo,
              start: fechaInicio,
              end: fechaFin,
              backgroundColor,
              borderColor,
              textColor,
              extendedProps: {
                claseId: clase._id,
                descripcion: clase.descripcion,
                sala: clase.sala,
                estado: clase.estado,
                horario: horario
              }
            });
          }
        }
      }
      
      console.log('[CALENDAR-DEBUG] Eventos del calendario:', eventosCalendario);
      setEventos(eventosCalendario);
      
    } catch (error) {
      console.error('[CALENDAR-DEBUG] Error cargando clases:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clases al montar el componente
  useEffect(() => {
    cargarClases();
  }, [alumnoId]);

  // Manejar clic en evento
  const handleEventClick = (clickInfo) => {
    console.log('[CALENDAR-DEBUG] Evento clickeado:', clickInfo.event);
    setSelectedEvent(clickInfo.event);
    setDialogOpen(true);
  };

  // Actualizar título del calendario
  const updateCalendarTitle = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      setCurrentTitle(view.title);
    }
  };

  // Manejar navegación del calendario
  const handleNavigation = (action) => {
    const calendarApi = calendarRef.current.getApi();
    
    switch (action) {
      case 'prev':
        calendarApi.prev();
        break;
      case 'next':
        calendarApi.next();
        break;
      case 'today':
        calendarApi.today();
        break;
    }
    
    setTimeout(updateCalendarTitle, 50);
  };

  // Manejar cambio de vista
  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
    setTimeout(updateCalendarTitle, 50);
  };

  // Configuración de FullCalendar
  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: false,
    events: eventos,
    eventClick: handleEventClick,
    height: 'auto',
    aspectRatio: 1.35,
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    nowIndicator: true,
    editable: false,
    selectable: false,
    weekends: true,
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    datesSet: updateCalendarTitle,
    viewDidMount: updateCalendarTitle
  };

  return (
    <Card 
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header con funcionalidad de colapsar */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          p: 3,
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              {alumnoId ? 'Mi Calendario de Clases' : 'Calendario de Clases'}
            </Typography>
            
            <Chip 
              label={`${eventos.length} clases`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Actualizar">
              <IconButton 
                onClick={cargarClases}
                disabled={loading}
                sx={{ 
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isCollapsed ? "Mostrar calendario" : "Ocultar calendario"}>
              <IconButton 
                onClick={() => setIsCollapsed(!isCollapsed)}
                sx={{ 
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                }}
              >
                {isCollapsed ? <ShowIcon /> : <HideIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Contenido colapsable */}
      <Collapse in={!isCollapsed}>
        <CardContent sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
          {/* Controles de navegación */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={3}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2,
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Navegación */}
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" gap={1}>
                <IconButton 
                  onClick={() => handleNavigation('prev')} 
                  sx={{ 
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  <PrevIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleNavigation('next')} 
                  sx={{ 
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                  }}
                >
                  <NextIcon />
                </IconButton>
              </Box>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  minWidth: '200px',
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {currentTitle}
              </Typography>
            </Box>

            {/* Controles de vista */}
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={() => handleNavigation('today')}
                sx={{ 
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': { 
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  }
                }}
              >
                Hoy
              </Button>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                }}
              >
                <ToggleButton value="calendar" aria-label="calendario">
                  <CalendarMonth fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="lista">
                  <List fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Controles de vista del calendario */}
          <Box display="flex" justifyContent="center" mb={3}>
            <ToggleButtonGroup
              value="timeGridWeek"
              exclusive
              onChange={(e, newValue) => {
                if (newValue) handleViewChange(newValue);
              }}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }
              }}
            >
              <ToggleButton value="dayGridMonth" aria-label="mes">
                Mes
              </ToggleButton>
              <ToggleButton value="timeGridWeek" aria-label="semana">
                Semana
              </ToggleButton>
              <ToggleButton value="timeGridDay" aria-label="día">
                Día
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress sx={{ color: '#ffffff' }} />
            </Box>
          )}

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Calendario */}
          {!loading && !error && (
            <Fade in={!loading} timeout={500}>
              <Box 
                className="calendar-container"
                sx={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  minHeight: '600px'
                }}
              >
                <FullCalendar
                  ref={calendarRef}
                  {...calendarOptions}
                />
              </Box>
            </Fade>
          )}
        </CardContent>
      </Collapse>

      {/* Diálogo de detalles del evento */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          📚 Detalles de la Clase
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                {selectedEvent.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Descripción:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff' }}>
                  {selectedEvent.extendedProps.descripcion || 'Sin descripción'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Sala:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff' }}>
                  {selectedEvent.extendedProps.sala || 'No especificada'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Horario:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: '#ffffff' }}>
                  {selectedEvent.extendedProps.horario?.horaInicio} - {selectedEvent.extendedProps.horario?.horaFin}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Estado:</strong>
                </Typography>
                <Chip 
                  label={selectedEvent.extendedProps.estado} 
                  color={
                    selectedEvent.extendedProps.estado === 'completada' ? 'success' : 'primary'
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', p: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default HorarioCalendar; 