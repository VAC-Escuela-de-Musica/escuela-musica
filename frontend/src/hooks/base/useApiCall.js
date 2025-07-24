import { useState, useCallback } from 'react';

/**
 * Hook genérico para llamadas API - Capa Base
 * Centraliza el manejo de estados de loading, error y datos
 * Proporciona funcionalidades comunes para todas las llamadas API
 */
export const useApiCall = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ejecutar llamada API
  const execute = useCallback(async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error en la llamada API';
      setError(errorMessage);
      
      // Registrar error para debugging
      console.error('API Error:', {
        function: apiFunction.name,
        args,
        error: err
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ejecutar múltiples llamadas en paralelo
  const executeParallel = useCallback(async (apiCalls) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.allSettled(apiCalls);
      
      // Separar resultados exitosos y errores
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
      
      // Si hay errores, mostrar el primero
      if (failed.length > 0) {
        const firstError = failed[0];
        const errorMessage = firstError.response?.data?.message || firstError.message || 'Error en llamadas paralelas';
        setError(errorMessage);
      }
      
      setData(successful);
      
      return {
        successful,
        failed,
        results
      };
    } catch (err) {
      const errorMessage = err.message || 'Error en llamadas paralelas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset del estado
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  // Actualizar datos sin llamada API
  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    executeParallel,
    reset,
    updateData,
    clearError,
    
    // Estados computados útiles
    hasData: data !== null && data !== undefined,
    hasError: error !== null,
    isIdle: !loading && !error && data === initialData
  };
};

/**
 * Hook especializado para operaciones CRUD
 * Extiende useApiCall con funcionalidades específicas para CRUD
 */
export const useCrudApiCall = (service, initialData = []) => {
  const api = useApiCall(initialData);
  
  // Obtener todos los elementos
  const fetchAll = useCallback(async (filters = {}) => {
    const method = service.getAll || service[`get${service.name}`] || service.get;
    return await api.execute(method, filters);
  }, [api, service]);

  // Obtener elemento por ID
  const fetchById = useCallback(async (id) => {
    const method = service.getById || service[`get${service.name}ById`];
    return await api.execute(method, id);
  }, [api, service]);

  // Crear elemento
  const create = useCallback(async (data) => {
    const method = service.create || service[`create${service.name}`] || service.post;
    const result = await api.execute(method, data);
    
    // Actualizar lista local si es posible
    if (Array.isArray(api.data)) {
      api.updateData([...api.data, result]);
    }
    
    return result;
  }, [api, service]);

  // Actualizar elemento
  const update = useCallback(async (id, data) => {
    const method = service.update || service[`update${service.name}`] || service.put;
    const result = await api.execute(method, id, data);
    
    // Actualizar lista local si es posible
    if (Array.isArray(api.data)) {
      const updatedData = api.data.map(item => 
        (item.id === id || item._id === id) ? result : item
      );
      api.updateData(updatedData);
    }
    
    return result;
  }, [api, service]);

  // Eliminar elemento
  const remove = useCallback(async (id) => {
    const method = service.delete || service[`delete${service.name}`] || service.remove;
    const result = await api.execute(method, id);
    
    // Actualizar lista local si es posible
    if (Array.isArray(api.data)) {
      const filteredData = api.data.filter(item => 
        item.id !== id && item._id !== id
      );
      api.updateData(filteredData);
    }
    
    return result;
  }, [api, service]);

  return {
    ...api,
    fetchAll,
    fetchById,
    create,
    update,
    remove
  };
};

export default useApiCall;