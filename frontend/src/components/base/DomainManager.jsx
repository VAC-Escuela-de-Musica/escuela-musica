import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useCrudManager } from '../../hooks/base/useCrudManager.js';
import DataTable from '../common/DataTable.jsx';
import FormDialog from '../common/FormDialog.jsx';

/**
 * Componente avanzado para gestión de dominios específicos
 * Capa 3 de la arquitectura - especializada pero reutilizable
 */
const DomainManager = ({
  title,
  endpoint,
  itemName,
  FormComponent,
  TableComponent = null,
  columns = [],
  search = null,
  validator = null,
  reorder = null,
  theme = 'default',
  specificLogic = {},
  permissions = { canEdit: true, canDelete: true, canCreate: true },
  actions = []
}) => {
  // Hook CRUD base
  const crud = useCrudManager(endpoint, itemName, {
    enableSearch: !!search,
    enableReordering: !!reorder,
    validator: validator?.validate
  });

  // Cargar datos al montar
  useEffect(() => {
    crud.fetchItems();
  }, [crud.fetchItems]);

  // Integrar búsqueda si está disponible
  const displayItems = search ? search.filteredItems : (crud.items || []); // ✅ Fallback a array vacío

  // Manejador de eliminación mejorado
  const handleDelete = async (id, item) => {
    if (specificLogic.handleDelete) {
      return await specificLogic.handleDelete(id, item, crud);
    }

    const itemTitle = item?.nombre || item?.username || item?.title || `${itemName}`;
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${itemTitle}"?`;
    
    if (window.confirm(confirmMessage)) {
      const result = await crud.deleteItem(id);
      if (result.success) {
        console.log(`${itemName} eliminado exitosamente`);
        specificLogic.onAfterDelete?.(item);
      }
    }
  };

  // Manejador de guardado mejorado
  const handleSave = async (formData) => {
    if (validator?.validate) {
      const validation = validator.validate(formData);
      if (!validation.isValid) {
        crud.setError(validation.errors.join(', '));
        return;
      }
    }

    if (specificLogic.handleSave) {
      return await specificLogic.handleSave(formData, crud);
    }

    const result = await crud.saveItem(formData);
    if (result.success) {
      specificLogic.onAfterSave?.(result.data);
    }
    return result;
  };

  // Estilos basados en el tema
  const themeStyles = {
    default: {},
    dark: {
      '& .MuiPaper-root': {
        backgroundColor: '#1e1e1e',
        color: '#ffffff'
      }
    }
  };

  // Loading inicial - también verificar null/undefined
  if (crud.loading && (!displayItems || displayItems.length === 0)) {
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
    <Paper elevation={1} sx={{ ...themeStyles[theme], p: 3 }}>
      {/* Header con información adicional */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {displayItems.length > 0 && (
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip 
                size="small" 
                label={`${displayItems.length} ${itemName}${displayItems.length !== 1 ? 's' : ''}`}
                color="primary" 
                variant="outlined"
              />
              {search?.query && (
                <Chip 
                  size="small" 
                  label={`Filtrado: "${search.query}"`}
                  color="secondary" 
                  variant="outlined"
                  onDelete={search.clearSearch}
                />
              )}
            </Box>
          )}
        </Box>

        <Box display="flex" gap={2}>
          {/* Acciones personalizadas */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outlined'}
              startIcon={action.icon}
              onClick={() => action.onClick(crud, displayItems)}
              disabled={crud.loading}
            >
              {action.label}
            </Button>
          ))}

          {/* Búsqueda si está habilitada */}
          {search && (
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={search.toggleSearch}
            >
              Buscar
            </Button>
          )}

          {/* Botón de crear */}
          {permissions.canCreate && (
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
      </Box>

      {/* Barra de búsqueda expandible */}
      {search?.showSearch && (
        <Box mb={3}>
          <search.SearchComponent />
        </Box>
      )}

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
      {TableComponent ? (
        <TableComponent
          data={displayItems}
          loading={crud.loading}
          onEdit={permissions.canEdit ? crud.openDialog : null}
          onDelete={permissions.canDelete ? handleDelete : null}
          reorder={reorder}
          specificLogic={specificLogic}
        />
      ) : (
        <DataTable
          data={displayItems}
          columns={columns}
          loading={crud.loading}
          onEdit={permissions.canEdit ? crud.openDialog : null}
          onDelete={permissions.canDelete ? handleDelete : null}
          itemName={itemName}
          reorderable={!!reorder}
          onReorder={reorder?.handleReorder}
        />
      )}

      {/* Dialog de Formulario */}
      <FormDialog
        open={crud.dialogState.open}
        onClose={crud.closeDialog}
        title={crud.isEditing ? `Editar ${itemName}` : `Nuevo ${itemName}`}
        FormComponent={FormComponent}
        formData={crud.dialogState.formData}
        onSubmit={handleSave}
        onInputChange={crud.updateFormData}
        isEditing={crud.isEditing}
        loading={crud.loading}
        validator={validator}
        specificLogic={specificLogic}
      />
    </Paper>
  );
};

export default DomainManager;