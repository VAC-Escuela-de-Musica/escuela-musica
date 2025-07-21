import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { API_ENDPOINTS } from '../config/api.js';

/**
 * Hook para gestión de materiales
 * Versión completa con todas las funcionalidades
 */
const useMaterials = () => {
  const { user, isAuthenticated } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    instrument: '',
    tags: [],
    isPublic: null
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función principal para cargar materiales
  const fetchMaterials = useCallback(async (options = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      // Agregar parámetros de paginación
      params.append('page', options.page || pagination.page);
      params.append('limit', options.limit || pagination.limit);
      
      // Agregar filtros si existen
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(item => params.append(key, item));
            } else {
              params.append(key, value);
            }
          }
        });
      }

      const url = `${API_ENDPOINTS.materials.list}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log('📊 Datos recibidos del servidor:', data);
      console.log('📊 Tipo de data.data:', typeof data.data);
      console.log('📊 Es array data.data:', Array.isArray(data.data));
      console.log('📊 data.data.documents:', data.data?.documents);
      console.log('📊 data.data.pagination:', data.data?.pagination);
      
      if (data.success) {
        // El backend ahora devuelve { documents: [...], pagination: {...} }
        const materialsArray = Array.isArray(data.data) ? data.data : 
                              data.data?.documents || 
                              data.data?.materials || 
                              data.data?.items || 
                              [];
        
        console.log('📊 Array de materiales:', materialsArray);
        console.log('📊 Primer material:', materialsArray[0]);
        console.log('📊 URLs del primer material:', {
          downloadUrl: materialsArray[0]?.downloadUrl,
          viewUrl: materialsArray[0]?.viewUrl
        });
        setMaterials(materialsArray);
        
        // La paginación está en data.data.pagination
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        } else if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.error || 'Error al cargar materiales');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.page, pagination.limit]);

  // Función para buscar materiales
  const searchMaterials = useCallback(async (term, additionalFilters = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (term) {
        params.append('search', term);
      }
      
      // Agregar filtros adicionales
      Object.entries(additionalFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(key, item));
          } else {
            params.append(key, value);
          }
        }
      });

      const url = `${API_ENDPOINTS.materials.list}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log('🔍 Datos recibidos de búsqueda:', data);
      console.log('🔍 Tipo de data.data:', typeof data.data);
      console.log('🔍 Es array data.data:', Array.isArray(data.data));
      
      if (data.success) {
        // El backend devuelve { documents: [...], pagination: {...} }
        const materialsArray = Array.isArray(data.data) ? data.data : 
                              data.data?.documents || 
                              data.data?.materials || 
                              data.data?.items || 
                              [];
        
        console.log('🔍 Array de materiales de búsqueda:', materialsArray);
        setMaterials(materialsArray);
        
        // La paginación está en data.data.pagination
        if (data.data?.pagination) {
          setPagination(data.data.pagination);
        } else if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.error || 'Error al buscar materiales');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Función para alternar favoritos
  const toggleFavorite = useCallback(async (materialId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINTS.materials.list}/${materialId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar el material en la lista local
        setMaterials(prev => prev.map(material => 
          material._id === materialId 
            ? { ...material, isFavorite: !material.isFavorite }
            : material
        ));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Error de conexión' };
    }
  }, []);

  // Navegación de páginas
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      fetchMaterials({ page: pagination.page + 1 });
    }
  }, [pagination.hasNextPage, pagination.page, fetchMaterials]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      fetchMaterials({ page: pagination.page - 1 });
    }
  }, [pagination.hasPrevPage, pagination.page, fetchMaterials]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMaterials({ page });
    }
  }, [pagination.totalPages, fetchMaterials]);

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
        await fetchMaterials(); // Recargar materiales
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
  }, [fetchMaterials]);

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
        await fetchMaterials(); // Recargar materiales
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
  }, [fetchMaterials]);

  // Cargar materiales al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchMaterials();
    }
  }, [isAuthenticated]);

  return {
    materials,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    pagination,
    
    // Funciones principales
    fetchMaterials,
    searchMaterials,
    toggleFavorite,
    clearError,
    
    // Navegación
    nextPage,
    prevPage,
    goToPage,
    
    // CRUD
    uploadMaterial,
    deleteMaterial
  };
};

export { useMaterials };
export default useMaterials;
