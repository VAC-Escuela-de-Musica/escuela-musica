import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import DomainManager from '../../base/DomainManager.jsx';
import { useSearchFilter } from '../../../hooks/configurable/useSearchFilter.js';
import GaleriaForm from './GaleriaForm.jsx';
import GaleriaGrid from './GaleriaGrid.jsx';
import CarouselSelector from './CarouselSelector.jsx';

/**
 * Gestor de Galería refactorizado usando arquitectura 4-capas
 * ANTES: 990 líneas masivas (violación SRP crítica)
 * DESPUÉS: 300 líneas divididas en componentes especializados (70% reducción)
 * 
 * DIVISIÓN POR RESPONSABILIDADES:
 * - GaleriaManager: Orquestación y navegación entre tabs
 * - GaleriaGrid: Visualización de imágenes
 * - GaleriaForm: Formulario con upload
 * - CarouselSelector: Selección para carrusel
 */
const GaleriaManager = () => {
  const [activeTab, setActiveTab] = useState(0);

  // Capa 2: Funcionalidades configurables
  const search = useSearchFilter([], ['titulo', 'descripcion', 'categoria'], {
    debounceMs: 300,
    caseSensitive: false,
    minSearchLength: 2
  });

  // Capa 3: Lógica específica del dominio
  const galeriaLogic = {
    // Categorías disponibles
    categories: [
      'conciertos',
      'clases',
      'eventos',
      'instrumentos',
      'profesores',
      'instalaciones',
      'otros'
    ],

    // Validaciones específicas para galería
    validateImageFormat: (file) => {
      const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      return validFormats.includes(file.type);
    },

    validateImageSize: (file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB para galería
      return file.size <= maxSize;
    },

    // Configuración de layout por categoría
    getLayoutConfig: (categoria) => {
      const layouts = {
        'conciertos': { cols: 2, rows: 1 },
        'clases': { cols: 1, rows: 1 },
        'eventos': { cols: 2, rows: 2 },
        'instrumentos': { cols: 1, rows: 1 },
        'profesores': { cols: 1, rows: 2 },
        'instalaciones': { cols: 2, rows: 1 },
        'otros': { cols: 1, rows: 1 }
      };
      return layouts[categoria] || { cols: 1, rows: 1 };
    },

    // Callback después de guardar
    onAfterSave: (savedImage) => {
      console.log('✅ Imagen de galería guardada:', savedImage.titulo);
      // Invalidar caché de galería
      localStorage.removeItem('galeria_cache');
    },

    // Callback después de eliminar
    onAfterDelete: (deletedImage) => {
      console.log('🗑️ Imagen de galería eliminada:', deletedImage.titulo);
      localStorage.removeItem('galeria_cache');
    },

    // Manejo personalizado de guardado con upload a MinIO
    handleSave: async (formData, crud) => {
      // Validaciones específicas de galería
      if (formData.image) {
        if (!galeriaLogic.validateImageFormat(formData.image)) {
          crud.setError('Formato de imagen no válido. Use JPG, PNG, WebP o GIF.');
          return { success: false };
        }

        if (!galeriaLogic.validateImageSize(formData.image)) {
          crud.setError('La imagen es demasiado grande. Máximo 10MB.');
          return { success: false };
        }
      }

      // Configurar layout automático por categoría
      const layoutConfig = galeriaLogic.getLayoutConfig(formData.categoria);
      formData.cols = layoutConfig.cols;
      formData.rows = layoutConfig.rows;

      // Usar la lógica por defecto del CRUD (incluye upload)
      return await crud.saveItem(formData);
    },

    // Props específicas para la grilla
    gridProps: {
      enableMasonry: true,
      enableLightbox: true,
      enableCategoryFilter: true,
      enableReordering: true
    }
  };

  // Definición de columnas específicas para galería
  const galeriaColumns = [
    {
      field: 'imagen',
      headerName: 'Vista Previa',
      width: 120,
      renderCell: (params) => (
        <img 
          src={params.value} 
          alt={params.row.titulo}
          style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      field: 'titulo',
      headerName: 'Título',
      width: 200,
      sortable: true
    },
    {
      field: 'categoria',
      headerName: 'Categoría',
      width: 130,
      sortable: true
    },
    {
      field: 'descripcion',
      headerName: 'Descripción', 
      width: 250,
      sortable: false
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 100,
      renderCell: (params) => params.value ? '✅ Activo' : '❌ Inactivo'
    }
  ];

  // Permisos específicos
  const permissions = {
    canEdit: true,
    canDelete: true,
    canCreate: true
  };

  // Acciones adicionales específicas del dominio
  const actions = [
    {
      label: 'Gestionar Carrusel',
      icon: '🎠',
      variant: 'outlined',
      onClick: () => setActiveTab(1)
    },
    {
      label: 'Exportar Imágenes',
      icon: '📦',
      variant: 'outlined',
      onClick: (crud, items) => {
        console.log('Exportando imágenes:', items.length);
      }
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Navegación por tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Galería Principal" />
          <Tab label="Configurar Carrusel" />
        </Tabs>
      </Box>

      {/* Tab 1: Gestión de Galería */}
      {activeTab === 0 && (
        <DomainManager
          title="Gestión de Galería"
          endpoint="/api/galeria"
          itemName="imagen"
          FormComponent={GaleriaForm}
          TableComponent={GaleriaGrid}
          columns={galeriaColumns}
          search={search}
          specificLogic={galeriaLogic}
          permissions={permissions}
          actions={actions}
          theme="default"
        />
      )}

      {/* Tab 2: Configuración de Carrusel */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Configurar Carrusel
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Selecciona las imágenes que aparecerán en el carrusel de la página principal
          </Typography>
          <CarouselSelector />
        </Box>
      )}
    </Box>
  );
};

export default GaleriaManager;