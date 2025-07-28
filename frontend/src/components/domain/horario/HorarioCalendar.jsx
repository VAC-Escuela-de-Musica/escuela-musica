import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Button,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('timeGridWeek');
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

  // Manejar cambio de vista del calendario
  const handleViewChange = (view) => {
    if (view && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(view);
      setCurrentView(view);
      setTimeout(updateCalendarTitle, 100);
    }
  };

  // Sincronizar el estado inicial cuando el componente se monta
  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (calendarApi) {
        setCurrentView(calendarApi.view.type);
        updateCalendarTitle();
      }
    }
  }, []);

  // Configuración de FullCalendar
  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: currentView,
    headerToolbar: false,
    events: eventos,
    eventClick: handleEventClick,
    height: 'auto',
    aspectRatio: isMobile ? 0.8 : isTablet ? 1.1 : 1.35,
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
    viewDidMount: (info) => {
      setCurrentView(info.view.type);
      updateCalendarTitle();
    }
  };

  return (
    <Card 
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          p: { xs: 2, md: 3 },
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={{ xs: 1, md: 2 }} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
            <Typography 
              variant={isMobile ? "h6" : "h4"} 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {alumnoId ? 'Mi Calendario' : 'Calendario'}
            </Typography>
            
            <Chip 
              label={`${eventos.length} clases`}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton 
              onClick={cargarClases}
              disabled={loading}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <RefreshIcon />
            </IconButton>
            
            <IconButton 
              onClick={() => setIsCollapsed(!isCollapsed)}
              size={isMobile ? "small" : "medium"}
              sx={{ 
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              {isCollapsed ? <ShowIcon /> : <HideIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Contenido colapsable */}
      <Collapse in={!isCollapsed}>
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 }, background: 'rgba(255, 255, 255, 0.05)' }}>
          {/* Controles de vista */}
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            mb={3}
            sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: { xs: 1, md: 2 },
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Título del calendario */}
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                mr: 2
              }}
            >
              {currentTitle}
            </Typography>

            {/* Botones de vista */}
            <ToggleButtonGroup
              value={currentView}
              exclusive
              onChange={(e, newValue) => {
                if (newValue) handleViewChange(newValue);
              }}
              size={isMobile ? "small" : "small"}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  color: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  padding: { xs: '4px 8px', sm: '6px 12px' },
                  minWidth: { xs: '50px', sm: '60px' },
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
                {isMobile ? 'M' : 'Mes'}
              </ToggleButton>
              <ToggleButton value="timeGridWeek" aria-label="semana">
                {isMobile ? 'S' : 'Semana'}
              </ToggleButton>
              <ToggleButton value="timeGridDay" aria-label="día">
                {isMobile ? 'D' : 'Día'}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Loading */}
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={{ xs: '300px', md: '400px' }}>
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
            <Box 
              className="calendar-container"
              sx={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                p: { xs: 1, md: 2 },
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                minHeight: { xs: '400px', md: '600px' }
              }}
            >
              <FullCalendar
                ref={calendarRef}
                {...calendarOptions}
              />
            </Box>
          )}
        </CardContent>
      </Collapse>

      {/* Diálogo de detalles del evento */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: isMobile ? 0 : 3
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'white', 
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          fontSize: { xs: '1.1rem', md: '1.25rem' }
        }}>
          📚 Detalles de la Clase
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          {selectedEvent && (
            <Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                gutterBottom 
                sx={{ 
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
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
        
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.2)', 
          p: { xs: 2, md: 2 },
          justifyContent: 'center'
        }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant={isMobile ? "contained" : "text"}
            fullWidth={isMobile}
            sx={{ 
              color: isMobile ? '#667eea' : 'rgba(255,255,255,0.8)',
              backgroundColor: isMobile ? '#ffffff' : 'transparent',
              '&:hover': { 
                color: isMobile ? '#667eea' : '#ffffff',
                backgroundColor: isMobile ? 'rgba(255,255,255,0.9)' : 'transparent'
              }
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