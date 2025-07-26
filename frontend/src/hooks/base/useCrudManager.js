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
  const api = useApiCall([]); // ✅ Cambiar de null a array vacío
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
   * Obtener todos los items - CORREGIDO
   */
  const fetchItems = useCallback(async (filters = {}) => {
    try {
      let data;
      
      if (service && service.getAll) {
        const response = await service.getAll(filters);
        data = response.data || response;
      } else {
        // ✅ Corregir la llamada API
        const response = await api.execute(async () => {
          return await apiService.get(endpoint);
        });
        data = response.data || response;
      }
      
      const items = Array.isArray(data) ? data : [];
      api.updateData(items);
      return items;
    } catch (error) {
      errorHandler.captureError(error, { operation: 'fetchItems', endpoint });
      api.updateData([]);
      throw error;
    }
  }, [endpoint, service]); // ✅ Remover api y errorHandler de dependencias

  /**
   * Crear nuevo item - CORREGIDO
   */
  const createItem = useCallback(async (data) => {
    try {
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      let result;
      
      if (service && service.create) {
        result = await service.create(data);
      } else {
        // ✅ Corregir la llamada API
        result = await api.execute(async () => {
          return await apiService.post(endpoint, data);
        });
      }

      if (optimisticUpdates && api.data) {
        const newItem = result.data || result;
        api.updateData([...api.data, newItem]);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${itemName} creado exitosamente`, result);
      }

      return { success: true, data: result.data || result };
    } catch (error) {
      errorHandler.captureError(error, { operation: 'createItem', data });
      return { success: false, error: error.message };
    }
  }, [endpoint, itemName, service, validator, optimisticUpdates, onSuccess, fetchItems]);

  /**
   * Actualizar item existente - CORREGIDO
   */
  const updateItem = useCallback(async (id, data) => {
    try {
      if (validator) {
        const validation = validator(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
      }

      let result;
      
      if (service && service.update) {
        result = await service.update(id, data);
      } else {
        // ✅ Corregir la llamada API
        result = await api.execute(async () => {
          return await apiService.put(`${endpoint}/${id}`, data);
        });
      }

      if (optimisticUpdates && api.data) {
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

      return { success: true, data: result.data || result };
    } catch (error) {
      errorHandler.captureError(error, { operation: 'updateItem', id, data });
      return { success: false, error: error.message };
    }
  }, [endpoint, itemName, service, validator, optimisticUpdates, onSuccess, fetchItems]);

  // ✅ Agregar función saveItem faltante
  const saveItem = useCallback(async (formData) => {
    const isEditing = !!dialogState.editing;
    const id = dialogState.editing?.id || dialogState.editing?._id;
    
    if (isEditing && id) {
      return await updateItem(id, formData);
    } else {
      return await createItem(formData);
    }
  }, [dialogState.editing, createItem, updateItem]);

  /**
   * Eliminar item individual
   */
  const deleteItem = useCallback(async (id) => {
    try {
      let result;
      
      if (service && service.delete) {
        result = await service.delete(id);
      } else {
        result = await api.execute(async () => {
          return await apiService.delete(`${endpoint}/${id}`);
        });
      }

      if (optimisticUpdates && api.data) {
        const filteredData = api.data.filter(item => 
          (item.id !== id && item._id !== id)
        );
        api.updateData(filteredData);
      } else {
        await fetchItems();
      }

      if (onSuccess) {
        onSuccess(`${itemName} eliminado exitosamente`, result);
      }

      return { success: true, data: result.data || result };
    } catch (error) {
      errorHandler.captureError(error, { operation: 'deleteItem', id });
      return { success: false, error: error.message };
    }
  }, [endpoint, itemName, service, optimisticUpdates, onSuccess, fetchItems]);

  /**
   * Reordenar items (para drag & drop)
   */
  const reorderItems = useCallback(async (newOrder) => {
    if (!enableReordering) return;
    
    try {
      // Actualización optimista
      if (optimisticUpdates) {
        api.updateData(newOrder);
      }
      
      // Si hay servicio personalizado para reordenar
      if (service && service.reorder) {
        await service.reorder(newOrder);
      }
      
      return { success: true };
    } catch (error) {
      errorHandler.captureError(error, { operation: 'reorderItems' });
      // Revertir en caso de error
      await fetchItems();
      return { success: false, error: error.message };
    }
  }, [enableReordering, optimisticUpdates, service, fetchItems]);

  /**
   * Eliminación masiva
   */
  const bulkDelete = useCallback(async (ids) => {
    if (!enableBulkOperations) return;
    
    try {
      let result;
      
      if (service && service.bulkDelete) {
        result = await service.bulkDelete(ids);
      } else {
        result = await api.execute(async () => {
          return await apiService.delete(`${endpoint}/bulk`, { data: { ids } });
        });
      }

      if (optimisticUpdates && api.data) {
        const filteredData = api.data.filter(item => 
          !ids.includes(item.id) && !ids.includes(item._id)
        );
        api.updateData(filteredData);
      } else {
        await fetchItems();
      }

      // Limpiar selección
      setSelectedItems(new Set());

      if (onSuccess) {
        onSuccess(`${ids.length} ${itemName}s eliminados exitosamente`, result);
      }

      return { success: true, data: result.data || result };
    } catch (error) {
      errorHandler.captureError(error, { operation: 'bulkDelete', ids });
      return { success: false, error: error.message };
    }
  }, [enableBulkOperations, endpoint, itemName, service, optimisticUpdates, onSuccess, fetchItems]);

  /**
   * Gestión de diálogo - Abrir
   */
  const openDialog = useCallback((item = null, initialData = {}) => {
    setDialogState({
      open: true,
      editing: item,
      formData: item ? { ...item, ...initialData } : initialData
    });
  }, []);

  /**
   * Gestión de diálogo - Cerrar
   */
  const closeDialog = useCallback(() => {
    setDialogState({
      open: false,
      editing: null,
      formData: {}
    });
  }, []);

  /**
   * Actualizar datos del formulario
   */
  const updateFormData = useCallback((data) => {
    setDialogState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  /**
   * Gestión de confirmación de eliminación - Abrir
   */
  const openDeleteConfirm = useCallback((item) => {
    setDeleteConfirm({
      open: true,
      item
    });
  }, []);

  /**
   * Gestión de confirmación de eliminación - Cerrar
   */
  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirm({
      open: false,
      item: null
    });
  }, []);

  /**
   * Gestión de selección - Toggle individual
   */
  const toggleSelection = useCallback((id) => {
    if (!enableBulkOperations) return;
    
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, [enableBulkOperations]);

  /**
   * Gestión de selección - Seleccionar todos
   */
  const selectAll = useCallback(() => {
    if (!enableBulkOperations || !api.data) return;
    
    const allIds = api.data.map(item => item.id || item._id);
    setSelectedItems(new Set(allIds));
  }, [enableBulkOperations, api.data]);

  /**
   * Gestión de selección - Limpiar selección
   */
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
    saveItem,
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