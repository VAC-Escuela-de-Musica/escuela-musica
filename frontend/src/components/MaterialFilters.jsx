import React, { useState } from 'react';
import './darkmode.css';

const MaterialFilters = ({ materiales, onFilterChange }) => {
  const [filtros, setFiltros] = useState({
    tipo: 'todos', // todos, publicos, privados
    busqueda: ''
  });

  const handleFilterChange = (newFiltros) => {
    setFiltros(newFiltros);
    
    let materialesFiltrados = [...materiales];

    // Filtrar por tipo
    if (newFiltros.tipo === 'publicos') {
      materialesFiltrados = materialesFiltrados.filter(m => m.bucketTipo === 'publico');
    } else if (newFiltros.tipo === 'privados') {
      materialesFiltrados = materialesFiltrados.filter(m => m.bucketTipo === 'privado');
    }

    // Filtrar por búsqueda
    if (newFiltros.busqueda) {
      const busquedaLower = newFiltros.busqueda.toLowerCase();
      materialesFiltrados = materialesFiltrados.filter(m => 
        m.nombre?.toLowerCase().includes(busquedaLower) ||
        m.descripcion?.toLowerCase().includes(busquedaLower) ||
        m.filename?.toLowerCase().includes(busquedaLower) ||
        m.usuario?.toLowerCase().includes(busquedaLower)
      );
    }

    onFilterChange(materialesFiltrados);
  };

  // Estadísticas para mostrar
  const stats = {
    total: materiales.length,
    publicos: materiales.filter(m => m.bucketTipo === 'publico').length,
    privados: materiales.filter(m => m.bucketTipo === 'privado').length
  };

  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '20px', 
      backgroundColor: 'var(--table-header-bg)', 
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <h4 style={{ margin: '0 0 15px 0', color: 'var(--heading-color)' }}>🔍 Filtrar materiales</h4>
      
      {/* Estadísticas */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '15px', 
        flexWrap: 'wrap' 
      }}>
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: 'var(--table-bg)', 
          borderRadius: '4px', 
          fontSize: '12px',
          color: 'var(--text-color)',
          border: '1px solid var(--border-color)'
        }}>
          📚 Total: {stats.total}
        </span>
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: 'var(--info-bg)', 
          borderRadius: '4px', 
          fontSize: '12px',
          color: 'var(--info-text)',
          border: '1px solid var(--info-border)'
        }}>
          🌐 Públicos: {stats.publicos}
        </span>
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: 'var(--warning-bg)', 
          borderRadius: '4px', 
          fontSize: '12px',
          color: 'var(--warning-text)',
          border: '1px solid var(--warning-border)'
        }}>
          🔒 Privados: {stats.privados}
        </span>
      </div>
      
      {/* Controles de filtro */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 'bold', marginRight: '8px', color: 'var(--text-color)' }}>
            Mostrar:
          </label>
          <select
            value={filtros.tipo}
            onChange={(e) => handleFilterChange({ ...filtros, tipo: e.target.value })}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              backgroundColor: 'var(--table-bg)',
              color: 'var(--text-color)'
            }}
          >
            <option value="todos">📚 Todos los materiales</option>
            <option value="publicos">🌐 Solo públicos</option>
            <option value="privados">🔒 Solo privados</option>
          </select>
        </div>
        
        <div style={{ flex: 1, minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por nombre, descripción, archivo o usuario..."
            value={filtros.busqueda}
            onChange={(e) => handleFilterChange({ ...filtros, busqueda: e.target.value })}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              backgroundColor: 'var(--table-bg)',
              color: 'var(--text-color)'
            }}
          />
        </div>
        
        {(filtros.tipo !== 'todos' || filtros.busqueda) && (
          <button
            onClick={() => handleFilterChange({ tipo: 'todos', busqueda: '' })}
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--text-muted)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🗑️ Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default MaterialFilters;
