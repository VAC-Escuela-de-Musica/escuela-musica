import React, { useState, useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Collapse,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ViewModule as GridIcon,
  ViewList as ListIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { useSearchFilter } from '../../hooks/configurable/useSearchFilter.js';

/**
 * Grid configurable con filtros dinámicos - Capa 2
 * Componente reutilizable para mostrar elementos en formato grid
 * Incluye búsqueda, filtros múltiples y diferentes vistas
 */
const FilterableGrid = ({
  data = [],
  searchFields = [],
  filters = [], // [{ field, label, options, type }]
  renderItem = null,
  renderCard = null,
  title = "Grid Filtrable",
  itemsPerRow = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 2,
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  defaultView = "grid", // "grid" | "list"
  emptyMessage = "No hay elementos que mostrar",
  emptySubMessage = "Ajusta los filtros para ver más resultados",
  loading = false,
  maxHeight = null,
  onItemClick = null,
  cardActions = null
}) => {
  const [view, setView] = useState(defaultView);
  const [activeFilters, setActiveFilters] = useState({});
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Hook de búsqueda
  const search = useSearchFilter(data, searchFields, {
    debounceMs: 300,
    caseSensitive: false,
    minSearchLength: 1
  });

  // Aplicar filtros adicionales
  const filteredData = useMemo(() => {
    let result = search.filteredItems;

    // Aplicar cada filtro activo
    Object.entries(activeFilters).forEach(([filterField, filterValue]) => {
      if (filterValue !== '' && filterValue !== 'all') {
        const filter = filters.find(f => f.field === filterField);
        
        if (filter) {
          switch (filter.type) {
            case 'select':
              result = result.filter(item => item[filterField] === filterValue);
              break;
            case 'multiselect':
              if (Array.isArray(filterValue) && filterValue.length > 0) {
                result = result.filter(item => 
                  filterValue.includes(item[filterField])
                );
              }
              break;
            case 'range':
              if (filterValue.min !== undefined) {
                result = result.filter(item => item[filterField] >= filterValue.min);
              }
              if (filterValue.max !== undefined) {
                result = result.filter(item => item[filterField] <= filterValue.max);
              }
              break;
            case 'boolean':
              result = result.filter(item => item[filterField] === filterValue);
              break;
            default:
              // Filtro de texto por defecto
              result = result.filter(item => 
                String(item[filterField]).toLowerCase().includes(String(filterValue).toLowerCase())
              );
          }
        }
      }
    });

    return result;
  }, [search.filteredItems, activeFilters, filters]);

  // Manejar cambio de filtro
  const handleFilterChange = (filterField, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterField]: value
    }));
  };

  // Limpiar filtro específico
  const clearFilter = (filterField) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterField];
      return newFilters;
    });
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setActiveFilters({});
    search.setQuery('');
  };

  // Contar filtros activos
  const activeFilterCount = Object.keys(activeFilters).length + (search.query ? 1 : 0);

  // Renderizar filtro individual
  const renderFilter = (filter) => {
    const value = activeFilters[filter.field] || '';

    switch (filter.type) {
      case 'select':
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              multiple
              value={value || []}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              )}
            >
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={true}>Sí</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return (
          <TextField
            size="small"
            label={filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            sx={{ minWidth: 120 }}
          />
        );
    }
  };

  // Renderizar card por defecto
  const defaultRenderCard = (item, index) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onItemClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': onItemClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4
        } : {}
      }}
      onClick={onItemClick ? () => onItemClick(item, index) : undefined}
    >
      {item.image && (
        <CardMedia
          component="img"
          height="140"
          image={item.image}
          alt={item.title || item.name || 'Imagen'}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {item.title || item.name || `Elemento ${index + 1}`}
        </Typography>
        {item.description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {item.description}
          </Typography>
        )}
        {item.category && (
          <Chip label={item.category} size="small" color="primary" />
        )}
      </CardContent>
      {cardActions && (
        <CardActions>
          {cardActions(item, index)}
        </CardActions>
      )}
    </Card>
  );

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Cargando...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Header con controles */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {/* Contador de filtros activos */}
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} filtro${activeFilterCount !== 1 ? 's' : ''} activo${activeFilterCount !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                onDelete={clearAllFilters}
                deleteIcon={<ClearIcon />}
              />
            )}

            {/* Toggle de vista */}
            {showViewToggle && (
              <Box>
                <Tooltip title="Vista grid">
                  <IconButton
                    size="small"
                    color={view === 'grid' ? 'primary' : 'default'}
                    onClick={() => setView('grid')}
                  >
                    <GridIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Vista lista">
                  <IconButton
                    size="small"
                    color={view === 'list' ? 'primary' : 'default'}
                    onClick={() => setView('list')}
                  >
                    <ListIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        {/* Controles de búsqueda y filtros */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {/* Búsqueda */}
          {showSearch && (
            <TextField
              placeholder="Buscar..."
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                endAdornment: search.query && (
                  <IconButton size="small" onClick={() => search.setQuery('')}>
                    <ClearIcon />
                  </IconButton>
                )
              }}
              sx={{ minWidth: 250 }}
            />
          )}

          {/* Toggle de filtros */}
          {showFilters && filters.length > 0 && (
            <Button
              startIcon={<FilterIcon />}
              endIcon={filtersExpanded ? <CollapseIcon /> : <ExpandIcon />}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              variant="outlined"
            >
              Filtros
            </Button>
          )}
        </Box>

        {/* Panel de filtros */}
        {showFilters && filters.length > 0 && (
          <Collapse in={filtersExpanded}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
                {filters.map((filter) => (
                  <Box key={filter.field} display="flex" alignItems="center" gap={1}>
                    {renderFilter(filter)}
                    {activeFilters[filter.field] && (
                      <IconButton
                        size="small"
                        onClick={() => clearFilter(filter.field)}
                        sx={{ ml: -1 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Collapse>
        )}
      </Box>

      {/* Información de resultados */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          {filteredData.length} elemento{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Grid/Lista de elementos */}
      <Box sx={{ maxHeight, overflow: maxHeight ? 'auto' : 'visible' }}>
        {filteredData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {emptyMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {emptySubMessage}
            </Typography>
            {activeFilterCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearAllFilters}
                sx={{ mt: 2 }}
              >
                Limpiar filtros
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={spacing}>
            {filteredData.map((item, index) => (
              <Grid 
                item 
                key={item.id || index}
                xs={view === 'list' ? 12 : itemsPerRow.xs}
                sm={view === 'list' ? 12 : itemsPerRow.sm}
                md={view === 'list' ? 12 : itemsPerRow.md}
                lg={view === 'list' ? 12 : itemsPerRow.lg}
              >
                {renderCard ? renderCard(item, index) : defaultRenderCard(item, index)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default FilterableGrid;