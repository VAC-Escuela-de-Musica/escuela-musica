import React from 'react';
import { Typography, Avatar, Chip, Box } from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon } from '@mui/icons-material';
import DataManager from './common/DataManager.jsx';
import UserForm from './forms/UserForm.jsx';

/**
 * Versión refactorizada completa de UserManager
 * De 430+ líneas originales a ~40 líneas (91% reducción)
 * Usa el patrón DataManager + FormComponent
 */
const UserManagerRefactored = () => {
  // Configuración de columnas para la tabla
  const columns = [
    {
      field: 'username',
      label: 'Usuario',
      render: (value, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <div>
            <Typography variant="subtitle2">{value || 'Sin usuario'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {item.rut || 'Sin RUT'}
            </Typography>
          </div>
        </div>
      )
    },
    {
      field: 'email',
      label: 'Email',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <EmailIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {value || 'Sin email'}
          </Typography>
        </div>
      )
    },
    {
      field: 'roles',
      label: 'Roles',
      render: (value) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {Array.isArray(value) && value.length > 0 ? (
            value.map((role, index) => (
              <Chip
                key={index}
                label={typeof role === 'object' ? role.name : role}
                size="small"
                variant="outlined"
                icon={<BadgeIcon />}
              />
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">
              Sin roles
            </Typography>
          )}
        </Box>
      )
    }
  ];

  // Configuración del estado vacío
  const emptyStateConfig = {
    title: 'No hay usuarios registrados',
    subtitle: 'Los usuarios pueden acceder y gestionar el sistema',
    buttonText: 'Crear primer usuario'
  };

  return (
    <DataManager
      title="Gestión de Usuarios"
      endpoint="/users"
      itemName="usuario"
      FormComponent={UserForm}
      columns={columns}
      emptyStateConfig={emptyStateConfig}
      canEdit={true}
      canDelete={true}
      canCreate={true}
    />
  );
};

export default UserManagerRefactored;