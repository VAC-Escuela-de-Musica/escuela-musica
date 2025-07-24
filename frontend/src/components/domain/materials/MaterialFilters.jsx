import React, { useState, useEffect } from 'react';
import { useMaterials } from '../../../hooks/useMaterials.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { logger } from '../../../utils/logger.js';
import './MaterialFilters.styles.css';
import '../layout/darkmode.css';

const MaterialFilters = ({ onFilterChange, loading = false }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    level: '',
    instrument: '',
    tags: '',
    isPublic: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { materials, stats } = useMaterials();
  const { isAuthenticated } = useAuth();

  const categories = [
    'Partitura',
    'Ejercicio',
    'Método',
    'Teoría',
    'Grabación',
    'Video',
    'Otro'
  ];

  const levels = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  const instruments = [
    'Piano',
    'Violín',
    'Guitarra',
    'Batería',
    'Canto',
    'Saxofón',
    'Trompeta',
    'Clarinete',
    'Flauta',
    'Otro'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Fecha de creación' },
    { value: 'title', label: 'Título' },
    { value: 'category', label: 'Categoría' },
    { value: 'level', label: 'Nivel' }
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    logger.filters('Filtros actualizados:', newFilters);
    
    // Convertir tags string a array
    const processedFilters = {
      ...newFilters,
      tags: newFilters.tags ? newFilters.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    };
    
    onFilterChange(processedFilters);
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    handleFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      category: '',
      level: '',
      instrument: '',
      tags: '',
      isPublic: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    handleFilterChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return filters.searchTerm || filters.category || filters.level || 
           filters.instrument || filters.tags || filters.isPublic !== null;
  };

  // Estadísticas mejoradas
  const getStats = () => {
    if (!materials || materials.length === 0) {
      return {
        total: 0,
        public: 0,
        private: 0,
        categories: {},
        levels: {}
      };
    }

    const categoryCounts = {};
    const levelCounts = {};
    let publicCount = 0;
    let privateCount = 0;

    materials.forEach(material => {
      // Contar por visibilidad
      if (material.isPublic) {
        publicCount++;
      } else {
        privateCount++;
      }

      // Contar por categoría
      if (material.category) {
        categoryCounts[material.category] = (categoryCounts[material.category] || 0) + 1;
      }

      // Contar por nivel
      if (material.level) {
        levelCounts[material.level] = (levelCounts[material.level] || 0) + 1;
      }
    });

    return {
      total: materials.length,
      public: publicCount,
      private: privateCount,
      categories: categoryCounts,
      levels: levelCounts
    };
  };

  const statsData = getStats();

  return (
    <div className="material-filters">
      <div className="filters-header">
        <h3>🔍 Filtrar Materiales</h3>
        {hasActiveFilters() && (
          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Limpiar Filtros
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="stats-container">
        <div className="stat-item">
          <span className="stat-icon">📚</span>
          <span className="stat-label">Total:</span>
          <span className="stat-value">{statsData.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🌐</span>
          <span className="stat-label">Públicos:</span>
          <span className="stat-value">{statsData.public}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🔒</span>
          <span className="stat-label">Privados:</span>
          <span className="stat-value">{statsData.private}</span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="🔍 Buscar por título, descripción, tags..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="search-input"
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="advanced-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Categoría:</label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category} {statsData.categories[category] && `(${statsData.categories[category]})`}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Nivel:</label>
            <select
              value={filters.level}
              onChange={(e) => updateFilter('level', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="">Todos los niveles</option>
              {levels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label} {statsData.levels[level.value] && `(${statsData.levels[level.value]})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Instrumento:</label>
            <select
              value={filters.instrument}
              onChange={(e) => updateFilter('instrument', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="">Todos los instrumentos</option>
              {instruments.map(instrument => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Visibilidad:</label>
            <select
              value={filters.isPublic === null ? '' : filters.isPublic ? 'public' : 'private'}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'public';
                updateFilter('isPublic', value);
              }}
              className="filter-select"
              disabled={loading}
            >
              <option value="">Todos</option>
              <option value="public">🌐 Solo públicos</option>
              <option value="private">🔒 Solo privados</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Tags:</label>
            <input
              type="text"
              placeholder="Ej: piano, principiante, escalas"
              value={filters.tags}
              onChange={(e) => updateFilter('tags', e.target.value)}
              className="filter-input"
              disabled={loading}
            />
            <small>Separa los tags con comas</small>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Ordenar por:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Orden:</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="filter-select"
              disabled={loading}
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters() && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros activos:</span>
          <div className="active-filters-list">
            {filters.searchTerm && (
              <span className="active-filter">
                Búsqueda: "{filters.searchTerm}"
                <button onClick={() => updateFilter('searchTerm', '')}>×</button>
              </span>
            )}
            {filters.category && (
              <span className="active-filter">
                Categoría: {filters.category}
                <button onClick={() => updateFilter('category', '')}>×</button>
              </span>
            )}
            {filters.level && (
              <span className="active-filter">
                Nivel: {levels.find(l => l.value === filters.level)?.label}
                <button onClick={() => updateFilter('level', '')}>×</button>
              </span>
            )}
            {filters.instrument && (
              <span className="active-filter">
                Instrumento: {filters.instrument}
                <button onClick={() => updateFilter('instrument', '')}>×</button>
              </span>
            )}
            {filters.tags && (
              <span className="active-filter">
                Tags: {filters.tags}
                <button onClick={() => updateFilter('tags', '')}>×</button>
              </span>
            )}
            {filters.isPublic !== null && (
              <span className="active-filter">
                {filters.isPublic ? 'Solo públicos' : 'Solo privados'}
                <button onClick={() => updateFilter('isPublic', null)}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="filters-loading">
          <div className="loading-spinner-small"></div>
          <span>Aplicando filtros...</span>
        </div>
      )}
    </div>
  );
};

export default MaterialFilters;
