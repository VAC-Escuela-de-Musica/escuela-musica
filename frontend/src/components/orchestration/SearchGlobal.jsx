import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Chip,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Tooltip,
  Collapse,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as UserIcon,
  Image as GalleryIcon,
  RateReview as TestimonioIcon,
  ViewCarousel as CarouselIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useSearchFilter } from '../../hooks/configurable/useSearchFilter.js';

/**
 * Componente de búsqueda global - Capa 4
 * Permite buscar a través de múltiples dominios simultáneamente
 * Incluye resultados categorizados, historial y navegación
 */
const SearchGlobal = ({
  domains = {},
  onNavigate = null,
  onItemSelect = null,
  placeholder = "Buscar en toda la aplicación...",
  maxResults = 50,
  enableHistory = true,
  enableCategories = true,
  showStats = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Configuración de dominios por defecto
  const defaultDomains = {
    users: {
      name: 'Usuarios',
      icon: <UserIcon />,
      data: [],
      searchFields: ['nombre', 'username', 'email', 'cargo'],
      getDisplayText: (item) => item.nombre || item.username,
      getSecondaryText: (item) => item.email || item.cargo,
      getAvatarSrc: (item) => item.foto || null
    },
    galeria: {
      name: 'Galería',
      icon: <GalleryIcon />,
      data: [],
      searchFields: ['titulo', 'descripcion', 'categoria'],
      getDisplayText: (item) => item.titulo,
      getSecondaryText: (item) => item.categoria,
      getAvatarSrc: (item) => item.imagen
    },
    testimonios: {
      name: 'Testimonios',
      icon: <TestimonioIcon />,
      data: [],
      searchFields: ['nombre', 'cargo', 'opinion', 'institucion'],
      getDisplayText: (item) => item.nombre,
      getSecondaryText: (item) => item.cargo,
      getAvatarSrc: (item) => item.foto
    },
    carousel: {
      name: 'Carrusel',
      icon: <CarouselIcon />,
      data: [],
      searchFields: ['titulo', 'descripcion'],
      getDisplayText: (item) => item.titulo,
      getSecondaryText: (item) => 'Carrusel',
      getAvatarSrc: (item) => item.imagen
    }
  };

  // Combinar dominios por defecto con los proporcionados
  const activeDomains = { ...defaultDomains, ...domains };

  // Combinar todos los datos para búsqueda global
  const allData = useMemo(() => {
    const combined = [];
    
    Object.entries(activeDomains).forEach(([key, domain]) => {
      if (Array.isArray(domain.data)) {
        domain.data.forEach(item => {
          combined.push({
            ...item,
            _domain: key,
            _domainName: domain.name,
            _domainIcon: domain.icon,
            _searchFields: domain.searchFields,
            _displayText: domain.getDisplayText(item),
            _secondaryText: domain.getSecondaryText(item),
            _avatarSrc: domain.getAvatarSrc(item)
          });
        });
      }
    });
    
    return combined;
  }, [activeDomains]);

  // Hook de búsqueda global
  const globalSearch = useSearchFilter(allData, ['_displayText', '_secondaryText', ...Object.values(activeDomains).flatMap(d => d.searchFields)], {
    debounceMs: 300,
    caseSensitive: false,
    minSearchLength: 2
  });

  // Filtrar por categoría
  const filteredResults = useMemo(() => {
    let results = globalSearch.filteredItems;
    
    if (selectedCategory !== 'all') {
      results = results.filter(item => item._domain === selectedCategory);
    }
    
    return results.slice(0, maxResults);
  }, [globalSearch.filteredItems, selectedCategory, maxResults]);

  // Agrupar resultados por dominio
  const groupedResults = useMemo(() => {
    const groups = {};
    
    filteredResults.forEach(item => {
      const domain = item._domain;
      if (!groups[domain]) {
        groups[domain] = {
          name: item._domainName,
          icon: item._domainIcon,
          items: []
        };
      }
      groups[domain].items.push(item);
    });
    
    return groups;
  }, [filteredResults]);

  // Estadísticas de resultados
  const stats = useMemo(() => {
    const statsByDomain = {};
    
    Object.keys(activeDomains).forEach(domain => {
      statsByDomain[domain] = filteredResults.filter(item => item._domain === domain).length;
    });
    
    return {
      total: filteredResults.length,
      byDomain: statsByDomain
    };
  }, [filteredResults, activeDomains]);

  // Manejar búsqueda
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    globalSearch.setQuery(query);
    
    // Agregar al historial si es una búsqueda nueva
    if (enableHistory && query.length >= 2 && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
    }
  }, [globalSearch, enableHistory, searchHistory]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    globalSearch.setQuery('');
    setSelectedCategory('all');
  }, [globalSearch]);

  // Manejar selección de elemento
  const handleItemClick = useCallback((item) => {
    if (onItemSelect) {
      onItemSelect(item, item._domain);
    }
    
    if (onNavigate) {
      onNavigate(item._domain, item);
    }
  }, [onItemSelect, onNavigate]);

  // Manejar búsqueda del historial
  const handleHistorySearch = useCallback((query) => {
    handleSearch(query);
  }, [handleSearch]);

  // Renderizar elemento de resultado
  const renderResultItem = (item, index) => (
    <ListItem
      key={`${item._domain}-${item.id || index}`}
      button
      onClick={() => handleItemClick(item)}
      sx={{
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <ListItemIcon>
        {item._avatarSrc ? (
          <Avatar
            src={item._avatarSrc}
            alt={item._displayText}
            sx={{ width: 32, height: 32 }}
          >
            {item._displayText?.charAt(0)?.toUpperCase()}
          </Avatar>
        ) : (
          item._domainIcon
        )}
      </ListItemIcon>
      
      <ListItemText
        primary={item._displayText}
        secondary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {item._secondaryText}
            </Typography>
            <Chip
              label={item._domainName}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Tooltip title={`Ir a ${item._domainName}`}>
          <IconButton size="small" onClick={() => handleItemClick(item)}>
            <LaunchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      {/* Campo de búsqueda */}
      <TextField
        fullWidth
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* Filtros por categoría */}
      {enableCategories && (
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={stats.total} color="primary" max={99}>
                Todos
              </Badge>
            }
            value="all"
          />
          {Object.entries(activeDomains).map(([key, domain]) => (
            <Tab
              key={key}
              label={
                <Badge badgeContent={stats.byDomain[key]} color="primary" max={99}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {domain.icon}
                    {domain.name}
                  </Box>
                </Badge>
              }
              value={key}
            />
          ))}
        </Tabs>
      )}

      {/* Resultados de búsqueda */}
      {globalSearch.query && (
        <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredResults.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados para "{globalSearch.query}"
              </Typography>
            </Box>
          ) : (
            <List dense>
              {/* Mostrar por grupos o lista plana */}
              {enableCategories && selectedCategory === 'all' ? (
                // Vista agrupada
                Object.entries(groupedResults).map(([domain, group]) => (
                  <React.Fragment key={domain}>
                    <ListItem>
                      <ListItemIcon>
                        {group.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="medium">
                            {group.name} ({group.items.length})
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                    {group.items.map((item, index) => renderResultItem(item, index))}
                    {Object.keys(groupedResults).indexOf(domain) < Object.keys(groupedResults).length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </React.Fragment>
                ))
              ) : (
                // Vista plana
                filteredResults.map((item, index) => renderResultItem(item, index))
              )}
            </List>
          )}
        </Paper>
      )}

      {/* Historial de búsqueda */}
      {enableHistory && searchHistory.length > 0 && !globalSearch.query && (
        <Paper sx={{ mt: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <HistoryIcon color="action" />
              <Typography variant="subtitle2">
                Búsquedas recientes
              </Typography>
            </Box>
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </Box>
          
          <Collapse in={isExpanded}>
            <Divider />
            <List dense>
              {searchHistory.map((query, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleHistorySearch(query)}
                >
                  <ListItemIcon>
                    <SearchIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary={query} />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Paper>
      )}

      {/* Estadísticas */}
      {showStats && globalSearch.query && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            {filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''} encontrado{filteredResults.length !== 1 ? 's' : ''} para "{globalSearch.query}"
            {stats.total !== filteredResults.length && ` (mostrando primeros ${filteredResults.length})`}
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SearchGlobal;