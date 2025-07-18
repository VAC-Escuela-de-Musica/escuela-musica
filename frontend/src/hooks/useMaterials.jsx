import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthProvider.jsx';
import { API_ENDPOINTS } from '../config/api.js';

/**
 * Hook para gestión de materiales
 * Optimizado con useMemo para cálculos computacionales
 */
const useMaterials = () => {
  const { user, isAuthenticated } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    instrument: '',
    difficulty: '',
    genre: '',
    tags: []
  });

  // Materiales filtrados - optimizado con useMemo
  const filteredMaterials = useMemo(() => {
    if (!materials.length) return [];
    
    return materials.filter(material => {
      const matchesSearch = !searchTerm || 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filters.type || material.type === filters.type;
      const matchesInstrument = !filters.instrument || material.instrument === filters.instrument;
      const matchesDifficulty = !filters.difficulty || material.difficulty === filters.difficulty;
      const matchesGenre = !filters.genre || material.genre === filters.genre;
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => material.tags?.includes(tag));

      return matchesSearch && matchesType && matchesInstrument && 
             matchesDifficulty && matchesGenre && matchesTags;
    });
  }, [materials, searchTerm, filters]);

  // Estadísticas - optimizado con useMemo
  const stats = useMemo(() => {
    if (!materials.length) return {
      totalMaterials: 0,
      byType: {},
      byInstrument: {},
      byDifficulty: {},
      byGenre: {}
    };

    const byType = {};
    const byInstrument = {};
    const byDifficulty = {};
    const byGenre = {};

    materials.forEach(material => {
      byType[material.type] = (byType[material.type] || 0) + 1;
      byInstrument[material.instrument] = (byInstrument[material.instrument] || 0) + 1;
      byDifficulty[material.difficulty] = (byDifficulty[material.difficulty] || 0) + 1;
      byGenre[material.genre] = (byGenre[material.genre] || 0) + 1;
    });

    return {
      totalMaterials: materials.length,
      byType,
      byInstrument,
      byDifficulty,
      byGenre
    };
  }, [materials]);

  // Filtros activos
  const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value && (Array.isArray(value) ? value.length > 0 : true)) {
      acc[key] = value;
    }
    return acc;
  }, {});

  // Cargar materiales
  const loadMaterials = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.materials.list, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setMaterials(data.data);
      } else {
        setError(data.error || 'Error al cargar materiales');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Subir material
  const uploadMaterial = useCallback(async (materialData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      
      // Agregar metadatos
      Object.keys(materialData).forEach(key => {
        if (key !== 'files') {
          formData.append(key, materialData[key]);
        }
      });

      // Agregar archivos
      if (materialData.files) {
        materialData.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.materials.create, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMaterials(); // Recargar materiales
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Error al subir material');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al subir material';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadMaterials]);

  // Eliminar material
  const deleteMaterial = useCallback(async (materialId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.materials.delete(materialId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadMaterials(); // Recargar materiales
        return { success: true };
      } else {
        setError(data.error || 'Error al eliminar material');
        return { success: false, error: data.error };
      }
    } catch (err) {
      const errorMsg = 'Error al eliminar material';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadMaterials]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      instrument: '',
      difficulty: '',
      genre: '',
      tags: []
    });
    setSearchTerm('');
  }, []);

  // Refrescar materiales
  const refreshMaterials = useCallback(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Cargar materiales al montar el componente
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  return {
    materials,
    filteredMaterials,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    activeFilters,
    stats,
    totalMaterials: materials.length,
    uploadMaterial,
    deleteMaterial,
    clearFilters,
    refreshMaterials
  };
};

export default useMaterials;
