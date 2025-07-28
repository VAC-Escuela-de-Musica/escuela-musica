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
} from '@mui/material';
import {
  Today as TodayIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext.jsx';
import './HorarioCalendar.css';

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
  const { user, isStudent, isAdmin } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nombresProfesores, setNombresProfesores] = useState({});
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const calendarRef = useRef(null);

  const obtenerNombreProfesor = async (id) => {
    if (!id || id === null || id === undefined) {
      return "Sin profesor asignado";
    }
    
    if (nombresProfesores[id]) return nombresProfesores[id];
    try {
      const response = await fetchAutenticado(`${API_URL}/profesor/${id}`);
      if (response.ok) {
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          console.warn('⚠️ Respuesta vacía al obtener profesor');
          return "Profesor desconocido";
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Error parseando JSON del profesor:', parseError);
          return "Profesor desconocido";
        }
        
        const nombreCompleto = data.data?.nombreCompleto || `${data.data?.nombre || ''} ${data.data?.apellidos || ''}`.trim();
        if (nombreCompleto) {
          setNombresProfesores(prev => ({ ...prev, [id]: nombreCompleto }));
          return nombreCompleto;
        }
      }
    } catch (error) {
      console.error("Error al obtener nombre del profesor:", error);
    }
    return "Profesor desconocido";
  };

  const cargarClases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      // Si es administrador, usar endpoint general para ver todas las clases
      if (isAdmin()) {
        url = `${API_URL}/all`;
      } else if (alumnoId) {
        // Si es estudiante, usar endpoint específico del estudiante
        url = `${API_URL}/estudiante/${alumnoId}`;
      } else {
        url = `${API_URL}/programadas`;
      }
      
      console.log('🔍 Cargando clases desde:', url);
      const response = await fetchAutenticado(url);
      
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        // Intentar leer el texto de la respuesta para mejor debugging
        const errorText = await response.text();
        console.error('❌ Error en la respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      // Verificar si la respuesta tiene contenido
      const responseText = await response.text();
      console.log('📄 Respuesta completa:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.warn('⚠️ Respuesta vacía del servidor');
        setEventos([]);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error parseando JSON:', parseError);
        console.error('📄 Contenido que causó el error:', responseText);
        throw new Error('Respuesta del servidor no es un JSON válido');
      }
      
      const clases = data.data || [];
      const eventosCalendario = [];
      
      for (const clase of clases) {
        // Filtrar clases canceladas solo para estudiantes
        if (isStudent() && clase.estado === 'cancelada') {
          continue; // Saltar esta clase si es estudiante y está cancelada
        }
        
        await obtenerNombreProfesor(clase.profesor);
        
        if (clase.horarios && clase.horarios.length > 0) {
          for (const horario of clase.horarios) {
            const [dia, mes, año] = horario.dia.split('-');
            const fechaClase = new Date(año, mes - 1, dia);
            
            const [horaI, minI] = horario.horaInicio.split(':');
            const [horaF, minF] = horario.horaFin.split(':');
            
            const fechaInicio = new Date(fechaClase);
            fechaInicio.setHours(parseInt(horaI), parseInt(minI));
            
            const fechaFin = new Date(fechaClase);
            fechaFin.setHours(parseInt(horaF), parseInt(minF));

            let backgroundColor = '#2196F3';
            let borderColor = '#1976D2';
            let textColor = '#ffffff';
            
            if (clase.estado === 'cancelada') {
              backgroundColor = '#f44336';
              borderColor = '#d32f2f';
            } else if (clase.estado === 'completada') {
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
      
      setEventos(eventosCalendario);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClases();
  }, [alumnoId, isStudent, isAdmin]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setDialogOpen(true);
  };

  const updateCalendarTitle = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const view = calendarApi.view;
      setCurrentTitle(view.title);
    }
  };

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

  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
    setCurrentView(view); // Update the state to reflect the new view
    setTimeout(updateCalendarTitle, 50);
  };

  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: false,
    events: eventos,
    eventClick: handleEventClick,
    height: 750,
    aspectRatio: 1.0,
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '01:00:00',
    slotLabelInterval: '01:00:00',
    slotHeight: 60,
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
      hour12: false,
      omitZeroMinute: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    datesSet: updateCalendarTitle,
    viewDidMount: updateCalendarTitle,
    dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'short' },
    slotLabelClassNames: ['custom-time-label'],
    dayMaxEvents: false,
    moreLinkClick: 'popover',
    expandRows: true
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress sx={{ color: '#2196F3' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
            {isStudent() ? 'Mi Calendario de Clases' : 'Calendario de Clases'}
          </Typography>
          
          {eventos.length > 0 && (
            <Chip 
              label={`${eventos.length} clases`}
              sx={{ 
                backgroundColor: '#2196F3',
                color: '#ffffff',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>
        
        <Tooltip title="Actualizar">
          <IconButton 
            onClick={cargarClases}
            disabled={loading}
            sx={{ color: '#2196F3' }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Controles de navegación */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={() => handleNavigation('prev')} 
            sx={{ 
              color: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
            }}
          >
            <PrevIcon />
          </IconButton>
          
          <IconButton 
            onClick={() => handleNavigation('next')} 
            sx={{ 
              color: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
            }}
          >
            <NextIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#2196F3', 
              fontWeight: 'bold',
              minWidth: '200px',
              textAlign: 'center'
            }}
          >
            {currentTitle || 'Cargando...'}
          </Typography>

          <Button
            variant="contained"
            startIcon={<TodayIcon />}
            onClick={() => handleNavigation('today')}
            sx={{ 
              backgroundColor: '#2196F3',
              '&:hover': { backgroundColor: '#1976D2' }
            }}
          >
            Hoy
          </Button>

          {/* Leyenda de colores al lado del botón HOY */}
          <Box display="flex" gap={1} ml={2}>
            <Chip 
              label="Programada" 
              size="small"
              sx={{ backgroundColor: '#2196F3', color: 'white' }} 
            />
            {!isStudent() && (
              <Chip 
                label="Cancelada" 
                size="small"
                sx={{ backgroundColor: '#f44336', color: 'white' }} 
              />
            )}
            <Chip 
              label="Completada" 
              size="small"
              sx={{ backgroundColor: '#4caf50', color: 'white' }} 
            />
          </Box>
        </Box>

        {/* Vista toggles */}
        <ToggleButtonGroup
          value={currentView}
          exclusive
          onChange={(e, newValue) => {
            if (newValue) handleViewChange(newValue);
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: '#2196F3',
              borderColor: '#2196F3',
              '&.Mui-selected': {
                backgroundColor: '#2196F3',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#1976D2'
                }
              }
            }
          }}
        >
          <ToggleButton value="dayGridMonth">
            Mes
          </ToggleButton>
          <ToggleButton value="timeGridWeek">
            Semana
          </ToggleButton>
          <ToggleButton value="timeGridDay">
            Día
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Información para estudiantes */}
      {isStudent() && (
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            💡 Solo se muestran tus clases activas. Las clases canceladas no aparecen en tu calendario.
          </Typography>
        </Box>
      )}

      {/* Calendario o mensaje cuando no hay clases */}
      {eventos.length === 0 ? (
        <Box 
          sx={{
            mt: 2,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(33, 150, 243, 0.05)',
            borderRadius: 3,
            border: '2px dashed rgba(33, 150, 243, 0.3)',
            p: 4
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#2196F3', 
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center'
            }}
          >
            📚 Sin clases asignadas
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: '400px'
            }}
          >
            {isStudent() 
              ? 'Actualmente no tienes clases asignadas. Contacta a tu administrador para que te asigne a las clases correspondientes.'
              : 'No hay clases programadas para mostrar en el calendario.'
            }
          </Typography>
        </Box>
      ) : (
        <Box 
          className="calendar-container"
          sx={{
            mt: 2,
            minHeight: '800px',
          }}
        >
          <FullCalendar
            ref={calendarRef}
            {...calendarOptions}
          />
        </Box>
      )}

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
    </Box>
  );
};

export default HorarioCalendar; 