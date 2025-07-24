import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../base/useDebounce.js';

/**
 * Hook configurable para búsqueda y filtrado avanzado
 * Capa 2 - Funcionalidades configurables y reutilizables
 * 
 * @param {Array} items - Array de items a filtrar
 * @param {Array} searchFields - Campos por los que buscar ['username', 'email', 'name']
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Objeto con funcionalidades de búsqueda
 */
export const useSearchFilter = (items = [], searchFields = [], options = {}) => {
  const {
    debounceMs = 300,
    caseSensitive = false,
    minSearchLength = 2
  } = options;

  // Estados
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Debounce de la query para optimizar performance
  const debouncedQuery = useDebounce(query, debounceMs);

  // Función de búsqueda configurable
  const searchFunction = useCallback((item, searchQuery) => {
    if (!searchQuery || searchQuery.length < minSearchLength) {
      return true;
    }

    const searchTerm = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    
    return searchFields.some(field => {
      const fieldValue = item[field];
      if (!fieldValue) return false;
      
      const value = caseSensitive ? fieldValue.toString() : fieldValue.toString().toLowerCase();
      return value.includes(searchTerm);
    });
  }, [searchFields, caseSensitive, minSearchLength]);

  // Items filtrados (memoizado para performance)
  const filteredItems = useMemo(() => {
    return items.filter(item => searchFunction(item, debouncedQuery));
  }, [items, debouncedQuery, searchFunction]);

  // Handlers
  const handleSearchChange = useCallback((newQuery) => {
    setQuery(newQuery);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setQuery('');
    }
  }, [showSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setShowSearch(false);
  }, []);

  // Componente de búsqueda básico
  const SearchComponent = useCallback(() => {
    return (
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={`Buscar por ${searchFields.join(', ')}...`}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px'
        }}
      />
    );
  }, [query, searchFields, handleSearchChange]);

  // Estadísticas de búsqueda
  const searchStats = useMemo(() => ({
    total: items.length,
    filtered: filteredItems.length,
    hasActiveSearch: debouncedQuery.length >= minSearchLength
  }), [items.length, filteredItems.length, debouncedQuery, minSearchLength]);

  return {
    // Estados
    query,
    showSearch,
    
    // Datos procesados
    filteredItems,
    searchStats,
    
    // Funciones de control
    handleSearchChange,
    toggleSearch,
    clearSearch,
    
    // Componentes
    SearchComponent,
    
    // Configuración
    options: {
      searchFields,
      minSearchLength
    }
  };
};