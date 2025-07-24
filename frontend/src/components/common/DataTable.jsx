import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

/**
 * Tabla genérica para mostrar datos con acciones CRUD
 * Soporte para vista de cards responsive
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  onEdit = null,
  onDelete = null,
  emptyStateConfig = {},
  itemName = 'item'
}) => {
  // Estado vacío
  if (data.length === 0 && !loading) {
    return (
      <Box textAlign="center" py={6}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyStateConfig.title || `No hay ${itemName}s disponibles`}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {emptyStateConfig.subtitle || `Comienza creando tu primer ${itemName}`}
        </Typography>
        {emptyStateConfig.showCreateButton !== false && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => onEdit && onEdit()}
            size="large"
          >
            {emptyStateConfig.buttonText || `Crear primer ${itemName}`}
          </Button>
        )}
      </Box>
    );
  }

  // Vista de cards responsiva
  return (
    <Box>
      {/* Loading overlay */}
      {loading && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          py={2}
        >
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Cargando...
          </Typography>
        </Box>
      )}

      {/* Grid de cards */}
      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id || item.id || index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Renderizar campos según configuración de columnas */}
                {columns.length > 0 ? (
                  columns.slice(0, 4).map((column, colIndex) => (
                    <Box key={colIndex} mb={1}>
                      {column.render ? (
                        column.render(item[column.field], item)
                      ) : (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            {column.label || column.field}
                          </Typography>
                          <Typography variant="body2">
                            {item[column.field] || '-'}
                          </Typography>
                        </>
                      )}
                    </Box>
                  ))
                ) : (
                  // Fallback: mostrar primeros campos del objeto
                  Object.entries(item)
                    .filter(([key]) => !key.startsWith('_') && key !== 'id')
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <Box key={key} mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {key}
                        </Typography>
                        <Typography variant="body2">
                          {String(value).substring(0, 50)}
                          {String(value).length > 50 ? '...' : ''}
                        </Typography>
                      </Box>
                    ))
                )}
              </CardContent>

              {/* Acciones */}
              {(onEdit || onDelete) && (
                <Box sx={{ p: 1, pt: 0 }}>
                  <Box display="flex" gap={1} justifyContent="flex-end">
                    {onEdit && (
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(item)}
                        disabled={loading}
                        title="Editar"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => onDelete(item._id || item.id, item)}
                        disabled={loading}
                        title="Eliminar"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DataTable;