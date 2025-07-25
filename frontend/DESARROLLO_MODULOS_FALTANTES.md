# 🚀 Guía de Desarrollo - Módulos Faltantes

## 📋 Introducción

Este documento es una guía completa para desarrolladores que necesiten implementar los módulos faltantes o completar funcionalidades pendientes en el frontend de la Escuela de Música. Sigue la arquitectura por capas establecida y utiliza los patrones ya implementados.

**Requisito previo:** Lee completamente el `README.md` principal para entender la arquitectura y patrones existentes.

---

## 🎯 Módulos Faltantes Prioritarios

### **📊 1. Dashboard con Analytics y Métricas**

#### **Estado Actual:** 0% Implementado
#### **Prioridad:** Alta
#### **Tiempo estimado:** 2-3 semanas

#### **Funcionalidades Requeridas:**

##### **1.1 Métricas Principales (KPIs)**
- **Usuarios activos** (diario, semanal, mensual)
- **Materiales subidos** por período
- **Descargas de materiales** más populares
- **Actividad por roles** (Admin, Profesor, Estudiante)
- **Crecimiento de usuarios** nuevos

##### **1.2 Gráficos y Visualizaciones**
- **Gráfico de líneas** para tendencias temporales
- **Gráfico de barras** para comparativas
- **Gráfico circular** para distribución por categorías
- **Heatmap** de actividad por días/horas
- **Métricas en tiempo real**

##### **1.3 Filtros y Períodos**
- Filtro por rango de fechas personalizado
- Filtros predefinidos (última semana, último mes, año)
- Filtros por rol de usuario
- Filtros por tipo de contenido

#### **Estructura de Archivos a Crear:**

```
src/components/domain/dashboard/
├── DashboardAnalytics.jsx          # Componente principal del dashboard
├── components/
│   ├── MetricsCard.jsx             # Tarjeta individual de métrica
│   ├── ChartContainer.jsx          # Contenedor genérico para gráficos
│   ├── LineChart.jsx               # Gráfico de líneas
│   ├── BarChart.jsx                # Gráfico de barras
│   ├── PieChart.jsx                # Gráfico circular
│   ├── HeatmapChart.jsx            # Mapa de calor
│   ├── FilterPanel.jsx             # Panel de filtros
│   └── ExportButton.jsx            # Botón de exportación
├── DashboardAnalytics.styles.css   # Estilos específicos
└── constants.js                    # Constantes (colores, períodos, etc.)

src/hooks/domain/
└── useDashboardAnalytics.js        # Hook principal de analytics

src/services/api/
└── analytics.service.js            # Servicio de métricas y analytics
```

#### **Implementación Detallada:**

##### **Hook de Dominio (`useDashboardAnalytics.js`)**
```javascript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApiCall } from '../base/useApiCall.js';
import { AnalyticsService } from '../../services/api/analytics.service.js';

export const useDashboardAnalytics = () => {
  const { user, isAdmin } = useAuth();
  const api = useApiCall({
    metrics: {},
    charts: {},
    realtimeData: {}
  });

  // Filtros de período
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
    end: new Date()
  });

  const [filters, setFilters] = useState({
    role: 'all',
    contentType: 'all',
    period: '30d'
  });

  // Cargar métricas principales
  const fetchMetrics = useCallback(async () => {
    if (!isAdmin()) return;

    try {
      const result = await api.execute(() =>
        AnalyticsService.getMetrics({
          startDate: dateRange.start,
          endDate: dateRange.end,
          ...filters
        })
      );
      return result;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }, [dateRange, filters, isAdmin, api]);

  // Cargar datos para gráficos
  const fetchChartData = useCallback(async (chartType) => {
    try {
      const result = await api.execute(() =>
        AnalyticsService.getChartData(chartType, {
          startDate: dateRange.start,
          endDate: dateRange.end,
          ...filters
        })
      );
      return result;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }, [dateRange, filters, api]);

  // Estados computados
  const metricsData = useMemo(() => {
    const data = api.data.metrics;
    return {
      totalUsers: data.totalUsers || 0,
      activeUsers: data.activeUsers || 0,
      totalMaterials: data.totalMaterials || 0,
      totalDownloads: data.totalDownloads || 0,
      userGrowth: data.userGrowth || 0,
      materialGrowth: data.materialGrowth || 0
    };
  }, [api.data.metrics]);

  // Cargar datos inicial
  useEffect(() => {
    if (isAdmin()) {
      fetchMetrics();
    }
  }, [isAdmin, fetchMetrics]);

  return {
    // Datos
    metrics: metricsData,
    chartData: api.data.charts,
    loading: api.loading,
    error: api.error,

    // Filtros
    dateRange,
    setDateRange,
    filters,
    setFilters,

    // Operaciones
    fetchMetrics,
    fetchChartData,
    refresh: fetchMetrics,

    // Utilidades
    canViewAnalytics: isAdmin(),
    exportData: async (format) => {
      return await AnalyticsService.exportAnalytics({
        format,
        dateRange,
        filters
      });
    }
  };
};
```

##### **Servicio de Analytics (`analytics.service.js`)**
```javascript
import apiService from '../api.service.js';

export class AnalyticsService {
  
  /**
   * Obtener métricas principales del dashboard
   */
  static async getMetrics(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    if (filters.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters.contentType && filters.contentType !== 'all') params.append('contentType', filters.contentType);
    
    const endpoint = `/api/analytics/metrics?${params.toString()}`;
    return await apiService.get(endpoint);
  }

  /**
   * Obtener datos específicos para gráficos
   */
  static async getChartData(chartType, filters = {}) {
    const params = new URLSearchParams();
    params.append('type', chartType);
    
    if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
    
    const endpoint = `/api/analytics/charts?${params.toString()}`;
    return await apiService.get(endpoint);
  }

  /**
   * Obtener datos en tiempo real
   */
  static async getRealtimeData() {
    return await apiService.get('/api/analytics/realtime');
  }

  /**
   * Exportar datos de analytics
   */
  static async exportAnalytics(options = {}) {
    const { format = 'pdf', dateRange, filters } = options;
    
    const params = new URLSearchParams();
    params.append('format', format);
    if (dateRange.start) params.append('startDate', dateRange.start.toISOString());
    if (dateRange.end) params.append('endDate', dateRange.end.toISOString());
    
    const endpoint = `/api/analytics/export?${params.toString()}`;
    return await apiService.downloadFile(endpoint);
  }

  /**
   * Obtener comparativas de períodos
   */
  static async getComparison(currentPeriod, previousPeriod) {
    return await apiService.post('/api/analytics/comparison', {
      currentPeriod,
      previousPeriod
    });
  }
}
```

##### **Componente Principal (`DashboardAnalytics.jsx`)**
```javascript
import React, { useState, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Download, Refresh, TrendingUp, People, CloudDownload, School } from '@mui/icons-material';

import { useDashboardAnalytics } from '../../../hooks/domain/useDashboardAnalytics.js';

// Componentes específicos
import MetricsCard from './components/MetricsCard.jsx';
import ChartContainer from './components/ChartContainer.jsx';
import LineChart from './components/LineChart.jsx';
import BarChart from './components/BarChart.jsx';
import FilterPanel from './components/FilterPanel.jsx';

import './DashboardAnalytics.styles.css';

const DashboardAnalytics = () => {
  const {
    metrics,
    chartData,
    loading,
    error,
    dateRange,
    setDateRange,
    filters,
    setFilters,
    fetchMetrics,
    fetchChartData,
    exportData,
    canViewAnalytics
  } = useDashboardAnalytics();

  const [exportLoading, setExportLoading] = useState(false);

  // Manejar exportación
  const handleExport = useCallback(async (format) => {
    setExportLoading(true);
    try {
      const blob = await exportData(format);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    } finally {
      setExportLoading(false);
    }
  }, [exportData]);

  // Configuración de métricas principales
  const metricsConfig = [
    {
      title: 'Usuarios Totales',
      value: metrics.totalUsers,
      icon: <People />,
      color: 'primary',
      growth: metrics.userGrowth
    },
    {
      title: 'Usuarios Activos',
      value: metrics.activeUsers,
      icon: <TrendingUp />,
      color: 'success',
      subtitle: 'Últimos 30 días'
    },
    {
      title: 'Materiales',
      value: metrics.totalMaterials,
      icon: <School />,
      color: 'info',
      growth: metrics.materialGrowth
    },
    {
      title: 'Descargas',
      value: metrics.totalDownloads,
      icon: <CloudDownload />,
      color: 'warning'
    }
  ];

  // Guard para permisos
  if (!canViewAnalytics) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning">
          No tienes permisos para ver las analíticas del sistema.
        </Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar las analíticas: {error}
        </Alert>
        <Button variant="contained" onClick={fetchMetrics} startIcon={<Refresh />}>
          Reintentar
        </Button>
      </Paper>
    );
  }

  return (
    <Box className="dashboard-analytics">
      {/* Header con controles */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Dashboard de Analíticas
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={fetchMetrics}
              startIcon={<Refresh />}
              disabled={loading}
            >
              Actualizar
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleExport('pdf')}
              startIcon={<Download />}
              disabled={exportLoading}
            >
              Exportar PDF
            </Button>
          </Box>
        </Box>

        {/* Panel de filtros */}
        <FilterPanel
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </Paper>

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metricsConfig.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricsCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ChartContainer title="Actividad de Usuarios" height={400}>
            <LineChart
              data={chartData.userActivity}
              xAxisKey="date"
              yAxisKey="activeUsers"
              loading={loading}
              onDataLoad={() => fetchChartData('userActivity')}
            />
          </ChartContainer>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <ChartContainer title="Distribución por Roles" height={400}>
            <BarChart
              data={chartData.roleDistribution}
              xAxisKey="role"
              yAxisKey="count"
              loading={loading}
              onDataLoad={() => fetchChartData('roleDistribution')}
            />
          </ChartContainer>
        </Grid>

        <Grid item xs={12}>
          <ChartContainer title="Materiales Más Descargados" height={300}>
            <BarChart
              data={chartData.topMaterials}
              xAxisKey="title"
              yAxisKey="downloads"
              loading={loading}
              onDataLoad={() => fetchChartData('topMaterials')}
              horizontal
            />
          </ChartContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;
```

---

### **🔍 2. Búsqueda Global Avanzada**

#### **Estado Actual:** 20% Implementado (componente básico existe)
#### **Prioridad:** Alta
#### **Tiempo estimado:** 1-2 semanas

#### **Funcionalidades Requeridas:**

##### **2.1 Búsqueda Unificada**
- Búsqueda **transversal** en todos los módulos
- **Autocompletado** inteligente con sugerencias
- **Búsqueda por voz** (opcional)
- **Filtros avanzados** por tipo de contenido
- **Resultados categorizados** por módulo

##### **2.2 Indexación y Performance**
- **Indexación** de contenido para búsqueda rápida
- **Caché** de resultados frecuentes
- **Paginación** optimizada de resultados
- **Highlighting** de términos encontrados

#### **Estructura de Archivos a Crear:**

```
src/components/domain/search/
├── GlobalSearch.jsx                # Componente principal de búsqueda
├── components/
│   ├── SearchInput.jsx             # Input con autocompletado
│   ├── SearchFilters.jsx           # Filtros avanzados
│   ├── SearchResults.jsx           # Container de resultados
│   ├── ResultCard.jsx              # Tarjeta individual de resultado
│   ├── SearchHistory.jsx           # Historial de búsquedas
│   ├── VoiceSearch.jsx             # Búsqueda por voz (opcional)
│   └── NoResults.jsx               # Estado sin resultados
├── GlobalSearch.styles.css         # Estilos específicos
└── constants.js                    # Tipos de contenido, filtros

src/hooks/domain/
└── useGlobalSearch.js              # Hook principal de búsqueda

src/services/api/
└── search.service.js               # Servicio de búsqueda e indexación
```

#### **Implementación Detallada:**

##### **Hook de Búsqueda Global (`useGlobalSearch.js`)**
```javascript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebounce } from '../base/useDebounce.js';
import { useApiCall } from '../base/useApiCall.js';
import { SearchService } from '../../services/api/search.service.js';

export const useGlobalSearch = () => {
  const { user } = useAuth();
  const api = useApiCall({
    results: [],
    suggestions: [],
    history: []
  });

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // 'materials', 'users', 'students', 'testimonials', 'gallery'
    dateRange: null,
    category: 'all'
  });

  const [searchHistory, setSearchHistory] = useState([]);

  // Debounce para optimizar búsquedas
  const debouncedQuery = useDebounce(query, 300);

  // Realizar búsqueda
  const performSearch = useCallback(async (searchQuery = debouncedQuery, searchFilters = filters) => {
    if (!searchQuery || searchQuery.length < 2) {
      api.updateData({ results: [], suggestions: [] });
      return;
    }

    try {
      const result = await api.execute(() =>
        SearchService.search(searchQuery, searchFilters)
      );

      // Actualizar historial
      if (searchQuery !== debouncedQuery) {
        const newHistory = [
          searchQuery,
          ...searchHistory.filter(item => item !== searchQuery)
        ].slice(0, 10); // Máximo 10 elementos
        
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      }

      return result;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }, [debouncedQuery, filters, api, searchHistory]);

  // Obtener sugerencias
  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) return [];

    try {
      const result = await SearchService.getSuggestions(searchQuery);
      api.updateData(prev => ({ ...prev, suggestions: result }));
      return result;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [api]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setQuery('');
    api.updateData({ results: [], suggestions: [] });
  }, [api]);

  // Resultados categorizados
  const categorizedResults = useMemo(() => {
    const results = api.data.results || [];
    
    return {
      materials: results.filter(r => r.type === 'material'),
      users: results.filter(r => r.type === 'user'),
      students: results.filter(r => r.type === 'student'),
      testimonials: results.filter(r => r.type === 'testimonial'),
      gallery: results.filter(r => r.type === 'gallery'),
      total: results.length
    };
  }, [api.data.results]);

  // Cargar historial al inicializar
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Ejecutar búsqueda cuando cambie la query
  useEffect(() => {
    if (debouncedQuery) {
      performSearch();
    }
  }, [debouncedQuery, performSearch]);

  return {
    // Estado de búsqueda
    query,
    setQuery,
    filters,
    setFilters,
    
    // Resultados
    results: api.data.results || [],
    categorizedResults,
    suggestions: api.data.suggestions || [],
    searchHistory,
    
    // Estados
    loading: api.loading,
    error: api.error,
    
    // Operaciones
    performSearch,
    getSuggestions,
    clearSearch,
    
    // Utilidades
    hasResults: categorizedResults.total > 0,
    isEmpty: !api.loading && categorizedResults.total === 0 && query.length > 0
  };
};
```

##### **Servicio de Búsqueda (`search.service.js`)**
```javascript
import apiService from '../api.service.js';

export class SearchService {
  
  /**
   * Realizar búsqueda global
   */
  static async search(query, filters = {}) {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    
    if (filters.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start.toISOString());
      params.append('endDate', filters.dateRange.end.toISOString());
    }
    
    const endpoint = `/api/search?${params.toString()}`;
    return await apiService.get(endpoint);
  }

  /**
   * Obtener sugerencias de autocompletado
   */
  static async getSuggestions(query) {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', '10');
    
    const endpoint = `/api/search/suggestions?${params.toString()}`;
    return await apiService.get(endpoint);
  }

  /**
   * Búsqueda por categoría específica
   */
  static async searchByCategory(query, category) {
    return await this.search(query, { type: category });
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  static async advancedSearch(criteria) {
    return await apiService.post('/api/search/advanced', criteria);
  }

  /**
   * Obtener elementos relacionados
   */
  static async getRelated(itemId, itemType) {
    const endpoint = `/api/search/related/${itemType}/${itemId}`;
    return await apiService.get(endpoint);
  }

  /**
   * Reportar búsqueda (para analytics)
   */
  static async reportSearch(query, resultCount) {
    return await apiService.post('/api/search/report', {
      query,
      resultCount,
      timestamp: new Date().toISOString()
    });
  }
}
```

---

### **📱 3. Configuración del Sistema**

#### **Estado Actual:** 0% Implementado
#### **Prioridad:** Media
#### **Tiempo estimado:** 1-2 semanas

#### **Funcionalidades Requeridas:**

##### **3.1 Configuración General**
- **Información de la escuela** (nombre, dirección, contacto)
- **Logo y branding** personalizable
- **Configuración de emails** (SMTP, templates)
- **Configuración de notificaciones**
- **Límites del sistema** (tamaño archivos, usuarios)

##### **3.2 Personalización de Temas**
- **Selector de temas** predefinidos
- **Personalización de colores** primarios/secundarios
- **Configuración de tipografía**
- **Modo oscuro/claro** por defecto
- **Preview en tiempo real**

#### **Estructura de Archivos a Crear:**

```
src/components/domain/settings/
├── SystemSettings.jsx              # Componente principal
├── components/
│   ├── GeneralSettings.jsx         # Configuraciones generales
│   ├── BrandingSettings.jsx        # Logo, colores, temas
│   ├── EmailSettings.jsx           # Configuración de emails
│   ├── NotificationSettings.jsx    # Configuración de notificaciones
│   ├── SystemLimits.jsx            # Límites y cuotas
│   ├── ThemeCustomizer.jsx         # Personalizador de temas
│   ├── PreviewPanel.jsx            # Preview de cambios
│   └── BackupSettings.jsx          # Configuración de respaldos
├── SystemSettings.styles.css       # Estilos específicos
└── constants.js                    # Configuraciones disponibles

src/hooks/domain/
└── useSystemSettings.js            # Hook de configuración del sistema

src/services/api/
└── settings.service.js             # Servicio de configuraciones
```

---

### **📈 4. Sistema de Reportes**

#### **Estado Actual:** 0% Implementado
#### **Prioridad:** Media-Alta
#### **Tiempo estimado:** 2-3 semanas

#### **Funcionalidades Requeridas:**

##### **4.1 Tipos de Reportes**
- **Reporte de usuarios** (actividad, registros, roles)
- **Reporte de materiales** (subidas, descargas, popularidad)
- **Reporte de estudiantes** (inscripciones, progreso)
- **Reporte financiero** (pagos, ingresos) - si aplica
- **Reporte de uso del sistema** (login, actividades)

##### **4.2 Generación y Exportación**
- **Generación en PDF** con charts
- **Exportación a Excel/CSV**
- **Reportes programados** (diario, semanal, mensual)
- **Envío automático por email**
- **Templates personalizables**

#### **Estructura de Archivos a Crear:**

```
src/components/domain/reports/
├── ReportsManager.jsx              # Gestor principal de reportes
├── components/
│   ├── ReportBuilder.jsx           # Constructor de reportes
│   ├── ReportTemplate.jsx          # Template de reporte
│   ├── ReportPreview.jsx           # Vista previa
│   ├── ScheduledReports.jsx        # Reportes programados
│   ├── ReportHistory.jsx           # Historial de reportes
│   └── ExportOptions.jsx           # Opciones de exportación
├── ReportsManager.styles.css       # Estilos específicos
└── templates/                      # Templates de reportes
    ├── UserReport.jsx
    ├── MaterialReport.jsx
    └── ActivityReport.jsx

src/hooks/domain/
└── useReports.js                   # Hook de reportes

src/services/api/
└── reports.service.js              # Servicio de reportes
```

---

## 6. Componentes de Apoyo Adicionales

### 6.1 SubirArchivos vs SubirMaterial

El sistema actualmente tiene dos componentes de subida de archivos:

#### `SubirArchivos.jsx` (Recomendado)
- **Ubicación**: `src/components/domain/materials/SubirArchivos.jsx`
- **Características**: Interfaz moderna con Material-UI, drag & drop, múltiples archivos
- **Funcionalidades**: 
  - Tema oscuro personalizado
  - Progreso de subida en tiempo real
  - Validación de tipos de archivo
  - Configuración individual por archivo
  - Control de acceso público/privado

#### `SubirMaterial.jsx` (Legacy)
- **Ubicación**: `src/components/domain/materials/SubirMaterial.jsx`
- **Características**: Formulario tradicional, enfoque simple
- **Estado**: Puede ser deprecado en favor de SubirArchivos

#### Recomendación de Consolidación
```javascript
// Migración sugerida en SubirMaterial.jsx
import SubirArchivos from './SubirArchivos.jsx';

const SubirMaterial = (props) => {
  return <SubirArchivos {...props} />;
};

export default SubirMaterial;
```

### 6.2 Utilidades de Helpers

El archivo `src/utils/helpers.js` proporciona utilidades esenciales:

#### Funciones Principales
- `formatDate()`: Formateo de fechas en español
- `formatFileSize()`: Conversión de bytes a formato legible
- `getFileTypeFromExtension()`: Identificación de tipos de archivo
- `getFileTypeIcon()`: Iconos emoji para tipos de archivo
- `isImageFile()`, `isAudioFile()`, `isVideoFile()`: Validadores de tipo
- `truncateText()`: Truncado de texto con ellipsis

#### Uso en Componentes
```javascript
import { 
  formatFileSize, 
  getFileTypeIcon, 
  isImageFile 
} from '../../../utils/helpers.js';

const MaterialCard = ({ material }) => {
  return (
    <div className="material-card">
      <div className="file-info">
        {getFileTypeIcon(material.mimeType)}
        <span>{formatFileSize(material.size)}</span>
      </div>
      {isImageFile(material.mimeType) && (
        <img src={material.thumbnail} alt={material.name} />
      )}
    </div>
  );
};
```

## 7. Módulos de Funcionalidad Específica Identificados

### 7.1 Sistema de Upload Avanzado (SubirArchivos)

#### Características Implementadas
- **Drag & Drop**: Zona de arrastre intuitiva
- **Multi-archivo**: Carga múltiples archivos simultáneamente
- **Progreso Real-time**: Seguimiento del progreso de subida
- **Validación de Tipos**: Restricción por extensiones permitidas
- **Configuración Individual**: Cada archivo puede tener nombre, descripción y tipo de acceso
- **Tema Oscuro**: Interfaz moderna y accesible

#### Funciones Técnicas Clave
```javascript
// Proceso de subida en 3 pasos
const uploadProcess = async (archivo, materialData) => {
  // 1. Obtener URL pre-firmada
  const { uploadUrl, materialId } = await getPresignedUrl(archivo, materialData);
  
  // 2. Subir archivo a MinIO
  await uploadToMinio(archivo, uploadUrl);
  
  // 3. Confirmar subida en backend
  await confirmUpload(materialId, materialData);
};
```

### 7.2 Sistema de Autenticación y Roles

#### Roles Identificados
- **Admin**: Acceso completo, puede subir contenido público
- **Teacher**: Puede subir materiales y gestionar contenido
- **Student**: Acceso de lectura principalmente
- **Guest**: Acceso limitado a contenido público

#### Control de Acceso
```javascript
// Ejemplo de uso en componentes
const { isAdmin, isTeacher, isAuthenticated } = useAuth();

// Control de renderizado condicional
{isAdmin() && <AdminPanel />}
{(isAdmin() || isTeacher()) && <SubirMaterial />}
{!isAuthenticated && <LoginRequired />}
```

### 7.3 Sistema de Logging Avanzado

El sistema usa un logger personalizado para debugging:

```javascript
// Tipos de logging identificados
logger.request('Solicitando URL pre-firmada...')
logger.data('Datos enviados:', payload)
logger.success('Operación exitosa')
logger.error('Error detectado:', error)
logger.upload('Progreso de subida')
logger.structure('Estructura de respuesta:', data)
```

---

## 🔄 Módulos Parcialmente Implementados

### **💬 Sistema de Mensajería (60% → 100%)**

#### **Funcionalidades Faltantes:**

##### **Cola de Mensajes**
```javascript
// src/components/domain/messaging/MessageQueue.jsx
const MessageQueue = () => {
  const messageQueue = useMessageQueue();
  
  return (
    <Box>
      <Typography variant="h6">Cola de Mensajes</Typography>
      <List>
        {messageQueue.pending.map(message => (
          <ListItem key={message.id}>
            <MessageQueueItem message={message} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
```

##### **Templates Avanzados**
```javascript
// src/components/domain/messaging/TemplateEditor.jsx
const TemplateEditor = () => {
  const templates = useTemplates();
  
  return (
    <Box>
      <RichTextEditor
        value={templates.currentTemplate}
        onChange={templates.updateTemplate}
        variables={templates.availableVariables}
      />
      <TemplatePreview template={templates.currentTemplate} />
    </Box>
  );
};
```

---

### **📅 Gestión de Horarios (40% → 100%)**

#### **Funcionalidades Faltantes:**

##### **Vista de Calendario**
```javascript
// src/components/domain/schedule/CalendarView.jsx
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const schedule = useSchedule();
  
  return (
    <Calendar
      localizer={localizer}
      events={schedule.events}
      startAccessor="start"
      endAccessor="end"
      onSelectEvent={schedule.handleEventSelect}
      onSelectSlot={schedule.handleSlotSelect}
      views={['month', 'week', 'day']}
    />
  );
};
```

##### **Detección de Conflictos**
```javascript
// src/hooks/domain/useSchedule.js
const useSchedule = () => {
  const detectConflicts = useCallback((newEvent, existingEvents) => {
    return existingEvents.filter(event => {
      return (
        newEvent.start < event.end && 
        newEvent.end > event.start &&
        newEvent.teacherId === event.teacherId
      );
    });
  }, []);
  
  return { detectConflicts, /* ... */ };
};
```

---

### **👨‍🏫 Gestión de Profesores (50% → 100%)**

#### **Funcionalidades Faltantes:**

##### **Perfiles Completos**
```javascript
// src/components/domain/profesores/ProfesorProfile.jsx
const ProfesorProfile = ({ profesorId }) => {
  const profesor = useProfesorProfile(profesorId);
  
  return (
    <Box>
      <ProfesorHeader profesor={profesor} />
      <ProfesorTabs>
        <TabPanel value="info">
          <ProfesorInfo profesor={profesor} />
        </TabPanel>
        <TabPanel value="schedule">
          <ProfesorSchedule profesorId={profesorId} />
        </TabPanel>
        <TabPanel value="students">
          <ProfesorStudents profesorId={profesorId} />
        </TabPanel>
        <TabPanel value="materials">
          <ProfesorMaterials profesorId={profesorId} />
        </TabPanel>
      </ProfesorTabs>
    </Box>
  );
};
```

---

## 🛠️ Cómo Utilizar la Estructura Existente

### **1. Usar Hooks Base Existentes**

#### **Para operaciones CRUD:**
```javascript
import { useCrudManager } from '../../hooks/base/useCrudManager.js';

const NuevoModulo = () => {
  const crud = useCrudManager('/api/nuevo-endpoint', 'NuevoItem', {
    enableSearch: true,
    enableBulkOperations: true,
    optimisticUpdates: true
  });
  
  // Ya tienes disponible: fetchItems, createItem, updateItem, deleteItem
  // Más funcionalidades: búsqueda, selección múltiple, paginación
};
```

#### **Para llamadas a API:**
```javascript
import { useApiCall } from '../../hooks/base/useApiCall.js';

const api = useApiCall(initialData);

// Ejecutar cualquier llamada a API
const handleAction = async () => {
  try {
    const result = await api.execute(() => 
      apiService.post('/endpoint', data)
    );
    // Manejo automático de loading, error, data
  } catch (error) {
    // Error ya manejado por el hook
  }
};
```

### **2. Usar Componentes Configurables**

#### **Para tablas con búsqueda:**
```javascript
import { SearchableTable } from '../configurable/SearchableTable.jsx';

const MiLista = () => {
  const data = useMiData();
  
  const columns = [
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'createdAt', label: 'Fecha', render: (item) => formatDate(item.createdAt) }
  ];
  
  const actions = [
    { label: 'Editar', icon: 'edit', onClick: handleEdit },
    { label: 'Eliminar', icon: 'delete', onClick: handleDelete, color: 'error' }
  ];
  
  return (
    <SearchableTable
      data={data}
      columns={columns}
      actions={actions}
      searchFields={['name', 'email']}
      enableExport
    />
  );
};
```

#### **Para grids con filtros:**
```javascript
import { FilterableGrid } from '../configurable/FilterableGrid.jsx';

const MiGrid = () => {
  return (
    <FilterableGrid
      items={items}
      columns={columns}
      filters={availableFilters}
      onFilter={handleFilter}
      sortable
      selectable
    />
  );
};
```

### **3. Usar Servicios Base**

#### **Extender el servicio de API:**
```javascript
import apiService from '../api.service.js';

export class NuevoModuloService {
  static async getItems(filters = {}) {
    // Usar métodos existentes del apiService
    return await apiService.get('/api/nuevo-modulo', { queryParams: filters });
  }
  
  static async create(data) {
    // Validación usando patrones existentes
    const validation = this.validateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    return await apiService.post('/api/nuevo-modulo', data);
  }
}
```

### **4. Seguir Patrones de Validación**

#### **Usar helpers existentes:**
```javascript
import { validateEmail, sanitizeString, formatDate } from '../../utils/helpers.js';

const validateNuevoModulo = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('El nombre es requerido');
  }
  
  if (data.email && !validateEmail(data.email)) {
    errors.push('Email no válido');
  }
  
  // Sanitizar datos
  const sanitizedData = {
    ...data,
    name: sanitizeString(data.name),
    description: sanitizeString(data.description)
  };
  
  return { isValid: errors.length === 0, errors, sanitizedData };
};
```

### **5. Integrar con Sistema de Autenticación**

#### **Usar contexto de auth:**
```javascript
import { useAuth } from '../../context/AuthContext.jsx';

const MiComponente = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  
  // Controlar visibilidad por rol
  const canEdit = isAdmin() || (isTeacher() && user.id === item.teacherId);
  
  return (
    <Box>
      {canEdit && (
        <Button onClick={handleEdit}>Editar</Button>
      )}
    </Box>
  );
};
```

---

## 📝 Checklist de Implementación

### **Para cada nuevo módulo:**

#### **1. Planificación (1 día)**
- [ ] Definir funcionalidades específicas
- [ ] Identificar hooks y componentes base a reutilizar
- [ ] Diseñar la estructura de archivos
- [ ] Planificar la integración con módulos existentes

#### **2. Implementación Backend (si aplica)**
- [ ] Crear endpoints de API necesarios
- [ ] Implementar validaciones del lado del servidor
- [ ] Configurar permisos y roles
- [ ] Tests de API

#### **3. Implementación Frontend**

##### **Capa de Servicios:**
- [ ] Crear servicio especializado extendiendo `apiService`
- [ ] Implementar validaciones específicas del dominio
- [ ] Agregar métodos CRUD especializados
- [ ] Tests unitarios del servicio

##### **Capa de Hooks:**
- [ ] Crear hook de dominio usando hooks base
- [ ] Implementar lógica de negocio específica
- [ ] Manejar estado local del módulo
- [ ] Tests del hook

##### **Capa de Componentes:**
- [ ] Componente Manager principal
- [ ] Subcomponentes específicos
- [ ] Formularios con validación
- [ ] Integrar componentes configurables existentes
- [ ] Estilos específicos
- [ ] Tests de componentes

#### **4. Integración:**
- [ ] Agregar rutas necesarias
- [ ] Integrar con sistema de navegación
- [ ] Configurar permisos de acceso
- [ ] Actualizar contextos si es necesario

#### **5. Testing:**
- [ ] Tests unitarios (hooks, servicios)
- [ ] Tests de componentes
- [ ] Tests de integración
- [ ] Tests E2E para flujos críticos

#### **6. Documentación:**
- [ ] Documentar API endpoints
- [ ] Comentarios en código complejo
- [ ] Actualizar README con nuevo módulo
- [ ] Guía de uso para otros desarrolladores

---

## 🚨 Errores Comunes a Evitar

### **1. No Reutilizar Código Existente**
```javascript
// ❌ MAL: Crear nuevo hook cuando existe useCrudManager
const useMiCrud = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... reimplementar toda la lógica CRUD
};

// ✅ BIEN: Usar hook base existente
const useMiModulo = () => {
  const crud = useCrudManager('/api/mi-modulo', 'MiItem');
  // Agregar solo lógica específica del dominio
  return { ...crud, miLogicaEspecifica };
};
```

### **2. No Seguir Convenciones de Nomenclatura**
```javascript
// ❌ MAL: Inconsistente con el resto del proyecto
const mi_componente = () => {};
const MiHook = () => {};
const miServicio = {};

// ✅ BIEN: Seguir convenciones establecidas
const MiComponente = () => {};
const useMiHook = () => {};
const MiServicio = {};
```

### **3. No Usar Sistema de Permisos**
```javascript
// ❌ MAL: No verificar permisos
const MiComponente = () => {
  return <Button onClick={handleDelete}>Eliminar</Button>;
};

// ✅ BIEN: Verificar permisos apropiados
const MiComponente = () => {
  const { isAdmin } = useAuth();
  
  return (
    <>
      {isAdmin() && (
        <Button onClick={handleDelete}>Eliminar</Button>
      )}
    </>
  );
};
```

### **4. No Manejar Estados de Loading/Error**
```javascript
// ❌ MAL: No mostrar estados de carga
const MiComponente = () => {
  const { data } = useMiHook();
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
};

// ✅ BIEN: Manejar todos los estados
const MiComponente = () => {
  const { data, loading, error } = useMiHook();
  
  if (loading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;
  if (!data.length) return <EmptyState />;
  
  return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
};
```

---

## 🎯 Próximos Pasos Recomendados

### **Prioridad Inmediata (1-2 semanas):**
1. **Dashboard de Analytics** - Implementación completa
2. **Búsqueda Global** - Completar funcionalidades faltantes

### **Prioridad Media (3-4 semanas):**
3. **Sistema de Reportes** - Implementación completa
4. **Configuración del Sistema** - Funcionalidades básicas
5. **Completar Módulos Parciales** - Mensajería, Horarios, Profesores

### **Prioridad Baja (1-2 meses):**
6. **Optimizaciones de Performance** - Code splitting, lazy loading
7. **Mejoras de Accesibilidad** - ARIA, navegación por teclado
8. **Internacionalización** - Soporte multiidioma
9. **PWA Features** - Offline support, notificaciones push

---

## 📞 Soporte para Desarrolladores

### **Recursos Adicionales:**
- **README.md principal** - Arquitectura completa del proyecto
- **Documentación de componentes** - JSDoc en archivos fuente
- **Tests existentes** - Como ejemplos de testing patterns
- **Storybook** (si se implementa) - Catálogo de componentes

### **Proceso de Ayuda:**
1. **Revisa el README principal** para entender la arquitectura
2. **Examina módulos similares** como referencia
3. **Usa los hooks y componentes base** existentes
4. **Sigue las convenciones** establecidas
5. **Escribe tests** para tu implementación
6. **Documenta** las funcionalidades nuevas

### **Contacto:**
Para dudas específicas de implementación, consulta con el equipo de desarrollo y referencia este documento junto con el README principal.

---

**Versión:** 2025-01-24  
**Estado:** Guía completa para implementación de módulos faltantes  
**Mantenido por:** Equipo de Desarrollo Frontend