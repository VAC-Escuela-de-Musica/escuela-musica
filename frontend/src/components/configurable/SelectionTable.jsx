import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Box,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import SearchableTable from './SearchableTable.jsx';

/**
 * Tabla configurable con selección múltiple - Capa 2
 * Extiende SearchableTable agregando capacidades de selección
 * Incluye acciones masivas y gestión de selección avanzada
 */
const SelectionTable = ({
  data = [],
  columns = [],
  keyField = "id",
  onSelectionChange = null,
  bulkActions = [],
  maxSelections = null,
  selectionMode = "multiple", // "single" | "multiple"
  showSelectionInfo = true,
  showBulkActions = true,
  selectionDisabled = () => false,
  onBulkAction = null,
  ...searchableTableProps
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionError, setBulkActionError] = useState('');

  // Elementos seleccionados como array
  const selectedArray = useMemo(() => {
    return data.filter(item => selectedItems.has(item[keyField]));
  }, [data, selectedItems, keyField]);

  // Verificar si un elemento puede ser seleccionado
  const canSelectItem = useCallback((item) => {
    return !selectionDisabled(item);
  }, [selectionDisabled]);

  // Elementos seleccionables
  const selectableItems = useMemo(() => {
    return data.filter(canSelectItem);
  }, [data, canSelectItem]);

  // Estados de selección
  const isAllSelected = selectableItems.length > 0 && 
    selectableItems.every(item => selectedItems.has(item[keyField]));
  
  const isIndeterminate = selectedItems.size > 0 && !isAllSelected;

  // Seleccionar/deseleccionar elemento individual
  const handleItemSelect = (item) => {
    if (!canSelectItem(item)) return;

    const itemKey = item[keyField];
    const newSelection = new Set(selectedItems);

    if (selectionMode === "single") {
      // Modo selección única
      newSelection.clear();
      if (!selectedItems.has(itemKey)) {
        newSelection.add(itemKey);
      }
    } else {
      // Modo selección múltiple
      if (selectedItems.has(itemKey)) {
        newSelection.delete(itemKey);
      } else {
        // Verificar límite máximo
        if (maxSelections && newSelection.size >= maxSelections) {
          return;
        }
        newSelection.add(itemKey);
      }
    }

    setSelectedItems(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(item => newSelection.has(item[keyField]));
      onSelectionChange(selectedData, newSelection);
    }
  };

  // Seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    let newSelection = new Set();

    if (!isAllSelected) {
      // Seleccionar todos los elementos seleccionables
      let count = 0;
      for (const item of selectableItems) {
        if (maxSelections && count >= maxSelections) break;
        newSelection.add(item[keyField]);
        count++;
      }
    }
    // Si ya están todos seleccionados, newSelection queda vacío (deseleccionar todos)

    setSelectedItems(newSelection);
    
    if (onSelectionChange) {
      const selectedData = data.filter(item => newSelection.has(item[keyField]));
      onSelectionChange(selectedData, newSelection);
    }
  };

  // Limpiar selección
  const handleClearSelection = () => {
    setSelectedItems(new Set());
    if (onSelectionChange) {
      onSelectionChange([], new Set());
    }
  };

  // Ejecutar acción masiva
  const handleBulkAction = async (action) => {
    setBulkMenuAnchor(null);
    
    if (!onBulkAction || selectedArray.length === 0) return;

    try {
      setBulkActionLoading(true);
      setBulkActionError('');
      
      await onBulkAction(action, selectedArray);
      
      // Limpiar selección después de la acción
      handleClearSelection();
    } catch (error) {
      console.error('Error en acción masiva:', error);
      setBulkActionError(error.message || 'Error al ejecutar la acción');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Columnas extendidas con checkbox
  const extendedColumns = [
    {
      field: '__selection__',
      label: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
          disabled={selectableItems.length === 0}
          size="small"
        />
      ),
      minWidth: 50,
      sortable: false,
      render: (value, item) => (
        <Checkbox
          checked={selectedItems.has(item[keyField])}
          onChange={() => handleItemSelect(item)}
          disabled={!canSelectItem(item)}
          size="small"
        />
      )
    },
    ...columns
  ];

  // Renderizar fila personalizada
  const renderRow = (row, index) => (
    <TableRow
      key={row[keyField]}
      hover
      selected={selectedItems.has(row[keyField])}
      onClick={() => handleItemSelect(row)}
      sx={{ 
        cursor: 'pointer',
        '&.Mui-selected': {
          backgroundColor: 'action.selected',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }
      }}
    >
      {extendedColumns.map((column) => (
        <TableCell
          key={column.field}
          align={column.align || 'left'}
          onClick={(e) => {
            // Evitar que el click en el checkbox dispare el click de la fila
            if (column.field === '__selection__') {
              e.stopPropagation();
            }
          }}
        >
          {column.render 
            ? column.render(row[column.field], row)
            : row[column.field]
          }
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <Box>
      {/* Información de selección y acciones masivas */}
      {(showSelectionInfo || showBulkActions) && selectedItems.size > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {/* Info de selección */}
              {showSelectionInfo && (
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">
                    {selectedItems.size} elemento{selectedItems.size !== 1 ? 's' : ''} seleccionado{selectedItems.size !== 1 ? 's' : ''}
                    {maxSelections && ` (máximo ${maxSelections})`}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSelection}
                    sx={{ color: 'inherit' }}
                  >
                    Limpiar
                  </Button>
                </Box>
              )}

              {/* Acciones masivas */}
              {showBulkActions && bulkActions.length > 0 && (
                <Box>
                  <Button
                    size="small"
                    endIcon={<MoreIcon />}
                    onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                    disabled={bulkActionLoading}
                    sx={{ color: 'inherit' }}
                  >
                    Acciones masivas
                  </Button>
                  <Menu
                    anchorEl={bulkMenuAnchor}
                    open={Boolean(bulkMenuAnchor)}
                    onClose={() => setBulkMenuAnchor(null)}
                  >
                    {bulkActions.map((action, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => handleBulkAction(action)}
                        disabled={bulkActionLoading}
                      >
                        {action.icon && (
                          <Box sx={{ mr: 2, display: 'flex' }}>
                            {action.icon}
                          </Box>
                        )}
                        {action.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Indicador de carga de acción masiva */}
      {bulkActionLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ejecutando acción masiva...
          </Typography>
        </Box>
      )}

      {/* Error de acción masiva */}
      {bulkActionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBulkActionError('')}>
          {bulkActionError}
        </Alert>
      )}

      {/* Tabla con búsqueda */}
      <SearchableTable
        {...searchableTableProps}
        data={data}
        columns={extendedColumns}
        renderRow={renderRow}
        onRowClick={null} // Deshabilitado porque usamos selección
      />

      {/* Información adicional */}
      {maxSelections && (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Máximo {maxSelections} elemento{maxSelections !== 1 ? 's' : ''} seleccionable{maxSelections !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SelectionTable;