import { useState, useCallback, useEffect } from 'react';
import apiService from '../../services/api.service.js';
import { useApiCall } from './useApiCall.js';
import { useErrorHandler } from './useErrorHandler.js';

/**
 * Hook perfeccionado para operaciones CRUD - Capa Base
 * Versión mejorada con manejo de errores robusto y funcionalidades avanzadas
 * Compatible con hooks configurables de Capa 2
 * 
 * @param {string} endpoint - Endpoint de la API
 * @param {string} itemName - Nombre del item para mensajes
 * @param {Object} options - Opciones de configuración
 */
export const useCrudManager = (endpoint, itemName = 'item', options = {}) => {
  const {
    enableSearch = false,
    enableReordering = false,
    enableBulkOperations = false,
    autoFetch = true,
    validator = null,
    service = null,
    cache = false,
    optimisticUpdates = true,
    onSuccess = null,
    onError = null
  } = options;

  // Hooks base para API y manejo de errores
  const api = useApiCall([]);
  const errorHandler = useErrorHandler({
    enableRetry: true,
    maxRetries: 3,
    onError: onError
  });

  // Estados específicos del CRUD
  const [dialogState, setDialogState] = useState({
    open: false,
    editing: null,
    formData: {}
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    item: null
  });
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Auto-fetch inicial
  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [autoFetch]);

  /**
   * Obtener todos los items
   */
  const fetchItems = useCallback(async (filters = {}) => {
    try {
      let data;
      
      if (service && service.getAll) {
        // Usar service especializado si está disponible
        const response = await service.getAll(filters);
        data = response.data || response;
      } else {
        // Usar API service genérico - FIX: Bind the method properly
        const response = await api.execute(() => apiService.get(endpoint), endpoint);
        data = response.data || response;
      }
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      errorHandler.captureError(error, { operation: 'fetchItems', endpoint });
      throw error;
    }
  }, [endpoint, service, api, errorHandler]);

  /**
   * Crear nuevo item
   */
  const createItem = useCallback(async (data) => {
    try {
      // Validación si está disponible
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      let result;
      
      if (service && service.create) {
        // Usar service especializado
        result = await service.create(data);
      } else {
        // Usar API service genérico - FIX: Bind the method properly
        result = await api.execute(() => apiService.post(endpoint, data));
      }

      // Update optimista
      if (optimisticUpdates) {
        const newItem = result.data || result;
        api.updateData([...api.data, newItem]);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${itemName} creado exitosamente`, result);
      }

      return result;
    } catch (error) {
      errorHandler.captureError(error, { operation: 'createItem', data });
      throw error;
    }
  }, [endpoint, itemName, service, validator, api, optimisticUpdates, onSuccess, errorHandler, fetchItems]);

  /**
   * Actualizar item existente
   */
  const updateItem = useCallback(async (id, data) => {
    try {
      // Validación si está disponible
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      let result;
      
      if (service && service.update) {
        // Usar service especializado
        result = await service.update(id, data);
      } else {
        // Usar API service genérico - FIX: Bind the method properly
        result = await api.execute(() => apiService.put(`${endpoint}/${id}`, data));
      }

      // Update optimista
      if (optimisticUpdates) {
        const updatedItem = result.data || result;
        const updatedData = api.data.map(item => 
          (item.id === id || item._id === id) ? updatedItem : item
        );
        api.updateData(updatedData);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${itemName} actualizado exitosamente`, result);
      }

      return result;
    } catch (error) {
      errorHandler.captureError(error, { operation: 'updateItem', id, data });
      throw error;
    }
  }, [endpoint, itemName, service, validator, api, optimisticUpdates, onSuccess, errorHandler, fetchItems]);

  /**
   * Eliminar item
   */
  const deleteItem = useCallback(async (id) => {
    try {
      let result;
      
      if (service && service.delete) {
        // Usar service especializado
        result = await service.delete(id);
      } else {
        // Usar API service genérico - FIX: Bind the method properly
        result = await api.execute(() => apiService.delete(`${endpoint}/${id}`));
      }

      // Update optimista
      if (optimisticUpdates) {
        const filteredData = api.data.filter(item => 
          item.id !== id && item._id !== id
        );
        api.updateData(filteredData);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${itemName} eliminado exitosamente`, result);
      }

      return result;
    } catch (error) {
      errorHandler.captureError(error, { operation: 'deleteItem', id });
      throw error;
    }
  }, [endpoint, itemName, service, validator, api, optimisticUpdates, onSuccess, errorHandler, fetchItems]);

  /**
   * Reordenar items (si está habilitado)
   */
  const reorderItems = useCallback(async (reorderedItems) => {
    if (!enableReordering) return;

    try {
      const orderData = reorderedItems.map((item, index) => ({
        id: item.id || item._id,
        orden: index + 1
      }));

      if (service && service.reorder) {
        await service.reorder(orderData);
      } else {
        await api.execute(apiService.put, `${endpoint}/reorder`, { items: orderData });
      }

      // Update optimista
      if (optimisticUpdates) {
        api.updateData(reorderedItems);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess('Orden actualizado exitosamente');
      }
    } catch (error) {
      errorHandler.captureError(error, { operation: 'reorderItems', items: reorderedItems });
      throw error;
    }
  }, [enableReordering, endpoint, service, api, optimisticUpdates, onSuccess, errorHandler, fetchItems]);

  /**
   * Operaciones masivas (si están habilitadas)
   */
  const bulkDelete = useCallback(async (ids) => {
    if (!enableBulkOperations) return;

    try {
      const promises = ids.map(id => 
        service?.delete ? service.delete(id) : apiService.delete(`${endpoint}/${id}`)
      );
      
      await Promise.all(promises);
      
      // Update optimista
      if (optimisticUpdates) {
        const filteredData = api.data.filter(item => 
          !ids.includes(item.id) && !ids.includes(item._id)
        );
        api.updateData(filteredData);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${ids.length} ${itemName}s eliminados exitosamente`);
      }
    } catch (error) {
      errorHandler.captureError(error, { operation: 'bulkDelete', ids });
      throw error;
    }
  }, [enableBulkOperations, endpoint, itemName, service, api, optimisticUpdates, onSuccess, errorHandler, fetchItems]);

  // Gestión del diálogo
  const openDialog = useCallback((item = null) => {
    setDialogState({
      open: true,
      editing: item,
      formData: item ? { ...item } : {}
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({
      open: false,
      editing: null,
      formData: {}
    });
  }, []);

  const updateFormData = useCallback((newData) => {
    setDialogState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...newData }
    }));
  }, []);

  // Gestión de confirmación de eliminación
  const openDeleteConfirm = useCallback((item) => {
    setDeleteConfirm({
      open: true,
      item
    });
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm({
      open: false,
      item: null
    });
  }, []);

  // Gestión de selección múltiple
  const toggleSelection = useCallback((id) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(api.data.map(item => item.id || item._id));
    setSelectedItems(allIds);
  }, [api.data]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    // Datos
    items: api.data,
    loading: api.loading,
    error: api.error || errorHandler.error,
    
    // Estados de UI
    dialogState,
    deleteConfirm,
    selectedItems: Array.from(selectedItems),
    
    // Operaciones CRUD
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    bulkDelete,
    
    // Gestión de diálogo
    openDialog,
    closeDialog,
    updateFormData,
    
    // Gestión de eliminación
    openDeleteConfirm,
    closeDeleteConfirm,
    
    // Gestión de selección
    toggleSelection,
    selectAll,
    clearSelection,
    
    // Utilidades
    refresh: fetchItems,
    reset: api.reset,
    clearError: () => {
      api.clearError();
      errorHandler.reset();
    },
    
    // Estados computados
    hasItems: api.data.length > 0,
    hasSelection: selectedItems.size > 0,
    isDialogOpen: dialogState.open,
    isEditing: !!dialogState.editing,
    canRetry: errorHandler.canRetry,
    
    // Funcionalidades habilitadas
    enableSearch,
    enableReordering,
    enableBulkOperations
  };
};

export default useCrudManager;