import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useCrudManager } from '../../hooks/base/useCrudManager.js';
import DataTable from './DataTable.jsx';
import FormDialog from './FormDialog.jsx';

/**
 * Componente genérico para gestión CRUD de cualquier entidad
 * Elimina duplicación masiva de código en gestores
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del gestor (ej: "Gestión de Usuarios")
 * @param {string} props.endpoint - Endpoint de la API (ej: "/users")
 * @param {string} props.itemName - Nombre del item (ej: "usuario")
 * @param {React.Component} props.FormComponent - Componente del formulario
 * @param {Array} props.columns - Definición de columnas para la tabla
 * @param {boolean} props.canEdit - Permitir edición (default: true)
 * @param {boolean} props.canDelete - Permitir eliminación (default: true)  
 * @param {boolean} props.canCreate - Permitir creación (default: true)
 * @param {Object} props.emptyStateConfig - Configuración del estado vacío
 */
const DataManager = ({
  title,
  endpoint,
  itemName,
  FormComponent,
  columns = [],
  canEdit = true,
  canDelete = true,
  canCreate = true,
  emptyStateConfig = {}
}) => {
  // Hook genérico que maneja todo el CRUD
  const crud = useCrudManager(endpoint, itemName);

  // Cargar datos al montar el componente
  useEffect(() => {
    crud.fetchItems();
  }, [crud.fetchItems]);

  // Manejador de eliminación con confirmación
  const handleDelete = async (id, item) => {
    const itemTitle = item?.nombre || item?.username || item?.title || `${itemName}`;
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${itemTitle}"?`;
    
    if (window.confirm(confirmMessage)) {
      const result = await crud.deleteItem(id);
      if (result.success) {
        console.log(`${itemName} eliminado exitosamente`);
      }
    }
  };

  // Configuración del estado vacío
  const defaultEmptyConfig = {
    title: `No hay ${itemName}s disponibles`,
    buttonText: `Crear primer ${itemName}`,
    ...emptyStateConfig
  };

  // Loading inicial
  if (crud.loading && crud.items.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando {itemName}s...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => crud.openDialog()}
            disabled={crud.loading}
          >
            Nuevo {itemName}
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {crud.error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={crud.clearError}
        >
          {crud.error}
        </Alert>
      )}

      {/* Tabla de Datos */}
      <DataTable
        data={crud.items}
        columns={columns}
        loading={crud.loading}
        onEdit={canEdit ? crud.openDialog : null}
        onDelete={canDelete ? handleDelete : null}
        emptyStateConfig={defaultEmptyConfig}
        itemName={itemName}
      />

      {/* Dialog de Formulario */}
      <FormDialog
        open={crud.dialogState.open}
        onClose={crud.closeDialog}
        title={crud.isEditing ? `Editar ${itemName}` : `Nuevo ${itemName}`}
        FormComponent={FormComponent}
        formData={crud.dialogState.formData}
        onSubmit={crud.saveItem}
        onInputChange={crud.updateFormData}
        isEditing={crud.isEditing}
        loading={crud.loading}
      />
    </Box>
  );
};

export default DataManager;