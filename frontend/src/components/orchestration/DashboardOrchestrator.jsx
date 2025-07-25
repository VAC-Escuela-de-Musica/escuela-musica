import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as UsersIcon,
  Image as GalleryIcon,
  RateReview as TestimoniosIcon,
  ViewCarousel as CarouselIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Importar servicios especializados
import { UsersService } from '../../services/api/users.service.js';
import { GaleriaService } from '../../services/api/galeria.service.js';
import { TestimoniosService } from '../../services/api/testimonios.service.js';

/**
 * Orquestador del Dashboard - Capa 4
 * Maneja operaciones complejas que involucran múltiples dominios
 * Centraliza la lógica de coordinación entre diferentes servicios
 */
const DashboardOrchestrator = () => {
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, recent: 0 },
    galeria: { total: 0, active: 0, categories: {} },
    testimonios: { total: 0, active: 0, avgRating: 0 },
    carousel: { total: 0, active: 0 },
    systemHealth: { status: 'unknown', issues: [] }
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  // Cargar datos del dashboard al montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Carga todos los datos del dashboard orquestando múltiples servicios
   * Operación compleja que coordina llamadas a diferentes dominios
   */
  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Ejecutar llamadas en paralelo para optimizar rendimiento
      const [usersStats, galeriaStats, testimoniosStats] = await Promise.allSettled([
        UsersService.getUserStats(),
        GaleriaService.getGalleryStats(),
        TestimoniosService.getTestimonioStats()
      ]);

      // Procesar resultados de usuarios
      const usersData = usersStats.status === 'fulfilled' 
        ? usersStats.value.data 
        : { total: 0, active: 0, recent: 0, byRole: {} };

      // Procesar resultados de galería
      const galeriaData = galeriaStats.status === 'fulfilled' 
        ? galeriaStats.value.data 
        : { total: 0, active: 0, categories: {}, recentUploads: 0 };

      // Procesar resultados de testimonios
      const testimoniosData = testimoniosStats.status === 'fulfilled' 
        ? testimoniosStats.value.data 
        : { total: 0, active: 0, avgRating: 0, byRating: {} };

      // Calcular datos del carrusel (basado en galería activa)
      const carouselData = {
        total: galeriaData.inCarousel || 0,
        active: galeriaData.activeInCarousel || 0
      };

      // Análisis de salud del sistema
      const systemHealth = analyzeSystemHealth({
        users: usersData,
        galeria: galeriaData,
        testimonios: testimoniosData,
        errors: [
          usersStats.status === 'rejected' ? 'Error en servicio de usuarios' : null,
          galeriaStats.status === 'rejected' ? 'Error en servicio de galería' : null,
          testimoniosStats.status === 'rejected' ? 'Error en servicio de testimonios' : null
        ].filter(Boolean)
      });

      // Actualizar estado consolidado
      setDashboardData({
        users: usersData,
        galeria: galeriaData,
        testimonios: testimoniosData,
        carousel: carouselData,
        systemHealth
      });

      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Analiza la salud general del sistema basado en métricas
   * Lógica de orquestación que evalúa el estado de múltiples dominios
   */
  const analyzeSystemHealth = ({ users, galeria, testimonios, errors }) => {
    const issues = [...errors];
    let status = 'healthy';

    // Análizar usuarios
    if (users.total === 0) {
      issues.push('No hay usuarios registrados en el sistema');
      status = 'warning';
    } else if (users.active / users.total < 0.8) {
      issues.push('Porcentaje bajo de usuarios activos');
      status = 'warning';
    }

    // Analizar galería
    if (galeria.total === 0) {
      issues.push('No hay imágenes en la galería');
      status = 'warning';
    } else if (galeria.active / galeria.total < 0.7) {
      issues.push('Muchas imágenes inactivas en galería');
      status = 'warning';
    }

    // Analizar testimonios
    if (testimonios.total === 0) {
      issues.push('No hay testimonios registrados');
      status = 'warning';
    } else if (testimonios.avgRating < 4.0) {
      issues.push('Calificación promedio de testimonios es baja');
      status = 'warning';
    }

    // Determinar estado crítico
    if (errors.length > 1) {
      status = 'critical';
    } else if (issues.length > 3) {
      status = 'warning';
    }

    return { status, issues };
  };

  /**
   * Actualizar dashboard
   */
  const handleRefresh = () => {
    loadDashboardData(true);
  };

  /**
   * Obtener color del estado de salud
   */
  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  /**
   * Obtener texto del estado de salud
   */
  const getHealthText = (status) => {
    switch (status) {
      case 'healthy': return 'Sistema Saludable';
      case 'warning': return 'Advertencias Detectadas';
      case 'critical': return 'Problemas Críticos';
      default: return 'Estado Desconocido';
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando Dashboard...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Orquestando datos de múltiples servicios
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header del Dashboard */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <DashboardIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Dashboard de Gestión
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Indicador de actualización */}
      {refreshing && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {/* Alerta de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Estado de Salud del Sistema */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <TrendingIcon color="primary" />
            <Typography variant="h6">
              Estado del Sistema
            </Typography>
            <Chip 
              label={getHealthText(dashboardData.systemHealth.status)}
              color={getHealthColor(dashboardData.systemHealth.status)}
              size="small"
            />
          </Box>
          
          {dashboardData.systemHealth.issues.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Problemas detectados:
              </Typography>
              {dashboardData.systemHealth.issues.map((issue, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                  <WarningIcon color="warning" sx={{ fontSize: 16 }} />
                  <Typography variant="body2">
                    {issue}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      <Grid container spacing={3} mb={3}>
        {/* Usuarios */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <UsersIcon color="primary" />
                <Typography variant="h6">Usuarios</Typography>
              </Box>
              <Typography variant="h3" color="primary" gutterBottom>
                {dashboardData.users.total}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.main">
                  {dashboardData.users.active} activos
                </Typography>
                <Chip 
                  label={`${dashboardData.users.recent} nuevos`}
                  size="small"
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Galería */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <GalleryIcon color="secondary" />
                <Typography variant="h6">Galería</Typography>
              </Box>
              <Typography variant="h3" color="secondary" gutterBottom>
                {dashboardData.galeria.total}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.main">
                  {dashboardData.galeria.active} activas
                </Typography>
                <Chip 
                  label={`${Object.keys(dashboardData.galeria.categories || {}).length} categorías`}
                  size="small"
                  color="secondary"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Testimonios */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TestimoniosIcon color="warning" />
                <Typography variant="h6">Testimonios</Typography>
              </Box>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {dashboardData.testimonios.total}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.main">
                  {dashboardData.testimonios.active} activos
                </Typography>
                <Chip 
                  label={`★ ${dashboardData.testimonios.avgRating?.toFixed(1) || '0.0'}`}
                  size="small"
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Carrusel */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CarouselIcon color="info" />
                <Typography variant="h6">Carrusel</Typography>
              </Box>
              <Typography variant="h3" color="info.main" gutterBottom>
                {dashboardData.carousel.total}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="success.main">
                  {dashboardData.carousel.active} visibles
                </Typography>
                <Chip 
                  label="Configurado"
                  size="small"
                  color="info"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detalles por Dominio */}
      <Grid container spacing={3}>
        {/* Distribución de Usuarios por Rol */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usuarios por Rol
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {dashboardData.users.byRole && Object.entries(dashboardData.users.byRole).map(([role, count]) => (
                <Box key={role} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {role}
                  </Typography>
                  <Chip label={count} size="small" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución de Galería por Categoría */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Galería por Categoría
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {dashboardData.galeria.categories && Object.entries(dashboardData.galeria.categories).map(([category, count]) => (
                <Box key={category} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {category}
                  </Typography>
                  <Chip label={count} size="small" color="secondary" />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOrchestrator;