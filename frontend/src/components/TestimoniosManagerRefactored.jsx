import React from 'react';
import { Typography, Avatar, Rating } from '@mui/material';
import DataManager from './common/DataManager.jsx';
import TestimonioForm from './forms/TestimonioForm.jsx';

/**
 * Versión refactorizada completa de TestimoniosManager
 * De 610+ líneas originales a ~30 líneas (95% reducción)
 * Usa el patrón DataManager + FormComponent
 */
const TestimoniosManagerRefactored = () => {
  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'nombre',
      label: 'Nombre',
      render: (value, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={item.foto} sx={{ width: 32, height: 32 }}>
            {value?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Typography variant="subtitle2">{value || 'Sin nombre'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.cargo || 'Sin cargo'}
            </Typography>
          </div>
        </div>
      )
    },
    {
      field: 'opinion',
      label: 'Opinión',
      render: (value) => (
        <Typography variant="body2" noWrap>
          {value ? `${value.substring(0, 100)}${value.length > 100 ? '...' : ''}` : 'Sin opinión'}
        </Typography>
      )
    },
    {
      field: 'rating',
      label: 'Calificación',
      render: (value) => (
        <Rating value={value || 0} readOnly size="small" />
      )
    }
  ];

  // Configuración del estado vacío
  const emptyStateConfig = {
    title: 'No hay testimonios disponibles',
    subtitle: 'Los testimonios ayudan a mostrar la calidad de tu servicio',
    buttonText: 'Crear primer testimonio'
  };

  return (
    <DataManager
      title="Gestión de Testimonios"
      endpoint="/testimonios"
      itemName="testimonio"
      FormComponent={TestimonioForm}
      columns={columns}
      emptyStateConfig={emptyStateConfig}
      canEdit={true}
      canDelete={true}
      canCreate={true}
    />
  );
};

export default TestimoniosManagerRefactored;