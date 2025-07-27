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
  CalendarMonth,
  List,
} from '@mui/icons-material';
import './HorarioCalendar.css'; // Archivo CSS personalizado

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

const HorarioCalendar = ({ viewMode, handleViewModeChange }) => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nombresProfesores, setNombresProfesores] = useState({});
  const [currentTitle, setCurrentTitle] = useState('');
  const calendarRef = useRef(null);

  // Obtener nombre del profesor
  const obtenerNombreProfesor = async (id) => {
    if (nombresProfesores[id]) return nombresProfesores[id];
    try {
      const response = await fetchAutenticado(`${API_URL}/profesor/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNombresProfesores(prev => ({ ...prev, [id]: data.data.nombreCompleto }));
        return data.data.nombreCompleto;
      }
    } catch (error) {
      console.error("Error al obtener nombre del profesor:", error);
    }
    return "Profesor desconocido";
  };

  // Cargar todas las clases programadas
  const cargarClases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[CALENDAR-DEBUG] Cargando todas las clases programadas...');
      const response = await fetchAutenticado(`${API_URL}/programadas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[CALENDAR-DEBUG] Clases recibidas:', data);
      
      const clases = data.data || [];
      
      // Convertir clases a eventos de FullCalendar
      const eventosCalendario = [];
      
      for (const clase of clases) {
        // Obtener nombre del profesor
        await obtenerNombreProfesor(clase.profesor);
        
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
            let backgroundColor = '#2196F3'; // Azul por defecto
            let borderColor = '#1976D2';
            let textColor = '#ffffff';
            
            if (clase.estado === 'cancelada') {
              backgroundColor = '#f44336'; // Rojo para canceladas
              borderColor = '#d32f2f';
            } else if (clase.estado === 'completada') {
              backgroundColor = '#4caf50'; // Verde para completadas
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
                profesor: clase.profesor,
                nombreProfesor: nombresProfesores[clase.profesor] || 'Cargando...',
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
  }, []);

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
    
    // Actualizar título después de la navegación
    setTimeout(updateCalendarTitle, 50);
  };

  // Manejar cambio de vista
  const handleViewChange = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
    
    // Actualizar título después del cambio de vista
    setTimeout(updateCalendarTitle, 50);
  };

  // Configuración de FullCalendar
  const calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: false, // Usaremos nuestros propios controles
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
    weekends: true, // ✅ Mostrar domingos
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
    // Callbacks para actualizar el título
    datesSet: updateCalendarTitle,
    viewDidMount: updateCalendarTitle
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Header compacto */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
            Calendario de Clases
        </Typography>
        
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

      {/* Título dinámico del período y controles principales */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Navegación y título */}
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" gap={1}>
            <IconButton 
              onClick={() => handleNavigation('prev')} 
              sx={{ 
                color: '#ffffff',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
              }}
            >
              <PrevIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleNavigation('next')} 
              sx={{ 
                color: '#ffffff',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' }
              }}
            >
              <NextIcon />
            </IconButton>
          </Box>
          
          {/* Título dinámico del mes/período */}
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#ffffff', 
              fontWeight: 'bold',
              minWidth: '200px',
              textAlign: 'center',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(33, 150, 243, 0.3)'
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

          {/* Leyenda de colores - Movida aquí para estar en la misma línea */}
          <Box display="flex" gap={1} ml={3}>
            <Chip 
              label="📚 Programada" 
              size="small"
              sx={{ backgroundColor: '#2196F3', color: 'white' }} 
            />
            <Chip 
              label="❌ Cancelada" 
              size="small"
              sx={{ backgroundColor: '#f44336', color: 'white' }} 
            />
            <Chip 
              label="✅ Completada" 
              size="small"
              sx={{ backgroundColor: '#4caf50', color: 'white' }} 
            />
          </Box>
        </Box>
        
        {/* Toggle y Controles de vista */}
        <Box display="flex" gap={2} alignItems="center">
          {/* Toggle Calendario/Lista */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="modo de vista"
            size="small"
            sx={{
              backgroundColor: "rgba(68, 68, 68, 0.8)",
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                color: "#ffffff",
                border: "1px solid rgba(102, 102, 102, 0.5)",
                fontSize: "0.7rem",
                padding: "4px 8px",
                fontWeight: "500",
                "&.Mui-selected": {
                  backgroundColor: "#2196F3",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#1976D2",
                  }
                },
                "&:hover": {
                  backgroundColor: "rgba(85, 85, 85, 0.8)",
                }
              }
            }}
          >
            <ToggleButton value="calendar" aria-label="vista calendario">
              <CalendarMonth sx={{ fontSize: "1rem" }} />
            </ToggleButton>
            <ToggleButton value="list" aria-label="vista lista">
              <List sx={{ fontSize: "1rem" }} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Controles de vista */}
          <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            onClick={() => handleViewChange('timeGridDay')}
            sx={{ 
              color: '#ffffff', 
              borderColor: '#2196F3',
              '&:hover': { 
                borderColor: '#1976D2',
                backgroundColor: 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            Día
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleViewChange('timeGridWeek')}
            sx={{ 
              color: '#ffffff', 
              borderColor: '#2196F3',
              '&:hover': { 
                borderColor: '#1976D2',
                backgroundColor: 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            Semana
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleViewChange('dayGridMonth')}
            sx={{ 
              color: '#ffffff', 
              borderColor: '#2196F3',
              '&:hover': { 
                borderColor: '#1976D2',
                backgroundColor: 'rgba(33, 150, 243, 0.1)'
              }
            }}
          >
            Mes
          </Button>
          </Box>
        </Box>
      </Box>

      {/* Loading y Error */}
      {loading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress sx={{ color: '#2196F3' }} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar las clases: {error}
        </Alert>
      )}

      {/* Calendario - Ahora más prominente */}
      {!loading && !error && (
        <Box 
          className="calendar-container"
          sx={{
            mt: 1, // Menos margen arriba
            minHeight: '600px', // Altura mínima garantizada
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
            backgroundColor: '#333333',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', borderBottom: '1px solid #555' }}>
          📚 Detalles de la Clase
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Descripción:</strong> {selectedEvent.extendedProps.descripcion}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Profesor:</strong> {selectedEvent.extendedProps.nombreProfesor}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Sala:</strong> {selectedEvent.extendedProps.sala}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Fecha:</strong> {selectedEvent.extendedProps.horario.dia}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Horario:</strong> {selectedEvent.extendedProps.horario.horaInicio} - {selectedEvent.extendedProps.horario.horaFin}
              </Typography>
              
              <Box mt={2}>
                <Chip 
                  label={selectedEvent.extendedProps.estado.toUpperCase()}
                  sx={{ 
                    backgroundColor: selectedEvent.backgroundColor,
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: '#2196F3' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HorarioCalendar; 