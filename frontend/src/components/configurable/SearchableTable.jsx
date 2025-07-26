import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Box,
  Typography,
  TablePagination,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useSearchFilter } from '../../hooks/configurable/useSearchFilter.js';

/**
 * Tabla configurable con búsqueda avanzada - Capa 2
 * Componente reutilizable que puede ser usado en cualquier dominio
 * Incluye búsqueda, filtrado, paginación y ordenamiento
 */
const SearchableTable = ({
  data = [],
  columns = [],
  searchFields = [],
  title = "Tabla",
  searchPlaceholder = "Buscar...",
  noDataMessage = "No hay datos disponibles",
  enablePagination = true,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  onRowClick = null,
  renderRow = null,
  actions = null,
  loading = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Hook de búsqueda configurable
  const search = useSearchFilter(data, searchFields, {
    debounceMs: 300,
    caseSensitive: false,
    minSearchLength: 1
  });

  // Datos procesados con ordenamiento
  const processedData = useMemo(() => {
    let result = search.filteredItems;

    // Aplicar ordenamiento si hay campo seleccionado
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        let comparison = 0;
        if (aValue < bValue) {
          comparison = -1;
        } else if (aValue > bValue) {
          comparison = 1;
        }
        
        return sortDirection === 'desc' ? comparison * -1 : comparison;
      });
    }

    return result;
  }, [search.filteredItems, sortField, sortDirection]);

  // Datos paginados
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;
    
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, enablePagination]);

  // Manejo de ordenamiento
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Manejo de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    search.setQuery('');
    setPage(0);
  };

  return (
    <Box>
      {/* Header con título y búsqueda */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          {title}
          {search.query && (
            <Chip
              label={`${processedData.length} resultado${processedData.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search.query && (
                <InputAdornment position="end">
                  <Tooltip title="Limpiar búsqueda">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sx={{ 
                    minWidth: column.minWidth || 'auto',
                    fontWeight: 'bold'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {column.label}
                    {column.sortable !== false && (
                      <Tooltip title={`Ordenar por ${column.label}`}>
                        <IconButton
                          size="small"
                          onClick={() => handleSort(column.field)}
                          color={sortField === column.field ? 'primary' : 'default'}
                        >
                          <SortIcon 
                            sx={{ 
                              fontSize: 16,
                              transform: sortField === column.field && sortDirection === 'desc' 
                                ? 'rotate(180deg)' 
                                : 'none',
                              transition: 'transform 0.2s'
                            }} 
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              ))}
              {actions && (
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Cargando...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {search.query ? 'No se encontraron resultados' : noDataMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                if (renderRow) {
                  return renderRow(row, index);
                }

                return (
                  <TableRow
                    key={row.id || index}
                    hover={!!onRowClick}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    sx={{ 
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {}
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                      >
                        {column.render 
                          ? column.render(row[column.field], row)
                          : row[column.field]
                        }
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="center">
                        {actions(row)}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginación */}
      {enablePagination && processedData.length > 0 && (
        <TablePagination
          component="div"
          count={processedData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      )}
    </Box>
  );
};

export default SearchableTable;