import { useState, useCallback } from 'react';
import apiService from '../services/api.service.js';

/**
 * Hook genérico para operaciones CRUD reutilizables
 * Elimina duplicación de código en gestores de datos
 * 
 * @param {string} endpoint - Endpoint de la API (ej: '/users', '/testimonios')
 * @param {string} itemName - Nombre del item para mensajes (ej: 'usuario', 'testimonio')
 * @returns {Object} Objeto con estados y funciones CRUD
 */
export const useCrudManager = (endpoint, itemName = 'item') => {
  // Estados centralizados
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogState, setDialogState] = useState({
    open: false,
    editing: null,
    formData: {}
  });

  /**
   * Obtener todos los items del endpoint
   */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await apiService.get(endpoint);
      const data = response.data || response;
      
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${itemName}s:`, err);
      setError(`Error al cargar ${itemName}s`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, itemName]);

  /**
   * Guardar item (crear o actualizar)
   * @param {Object} data - Datos del item a guardar
   */
  const saveItem = useCallback(async (data) => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (dialogState.editing) {
        // Actualizar item existente
        const id = dialogState.editing._id || dialogState.editing.id;
        response = await apiService.put(`${endpoint}/${id}`, data);
      } else {
        // Crear nuevo item
        response = await apiService.post(endpoint, data);
      }

      // Recargar lista después de guardar
      await fetchItems();
      closeDialog();
      
      return { success: true, data: response };
    } catch (err) {
      console.error(`Error saving ${itemName}:`, err);
      const errorMessage = err.response?.data?.message || err.message || `Error al guardar ${itemName}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint, dialogState.editing, fetchItems, itemName]);

  /**
   * Eliminar item
   * @param {string} id - ID del item a eliminar
   */
  const deleteItem = useCallback(async (id) => {
    try {
      setLoading(true);
      setError("");

      await apiService.delete(`${endpoint}/${id}`);
      
      // Recargar lista después de eliminar
      await fetchItems();
      
      return { success: true };
    } catch (err) {
      console.error(`Error deleting ${itemName}:`, err);
      const errorMessage = err.response?.data?.message || err.message || `Error al eliminar ${itemName}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [endpoint, fetchItems, itemName]);

  /**
   * Abrir dialog para crear o editar
   * @param {Object|null} item - Item a editar, null para crear nuevo
   */
  const openDialog = useCallback((item = null) => {
    setDialogState({
      open: true,
      editing: item,
      formData: item ? { ...item } : {}
    });
  }, []);

  /**
   * Cerrar dialog y limpiar estado
   */
  const closeDialog = useCallback(() => {
    setDialogState({
      open: false,
      editing: null,
      formData: {}
    });
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError("");
  }, []);

  /**
   * Actualizar datos del formulario en el dialog
   * @param {Object} newFormData - Nuevos datos del formulario
   */
  const updateFormData = useCallback((newFormData) => {
    setDialogState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...newFormData }
    }));
  }, []);

  // Interface pública del hook
  return {
    // Estados
    items,
    loading,
    error,
    dialogState,
    
    // Operaciones CRUD
    fetchItems,
    saveItem,
    deleteItem,
    
    // Gestión de diálogos
    openDialog,
    closeDialog,
    updateFormData,
    
    // Utilidades
    clearError,
    
    // Computed properties
    isEmpty: items.length === 0,
    hasError: !!error,
    isEditing: !!dialogState.editing,
    itemCount: items.length
  };
};

export default useCrudManager;