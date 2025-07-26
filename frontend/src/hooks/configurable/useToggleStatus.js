import { useState, useCallback } from 'react';

/**
 * Hook configurable para toggle de estado - Capa 2
 * Proporciona funcionalidades avanzadas para cambio de estado
 * Incluye confirmación, logging y manejo de errores
 */
export const useToggleStatus = (options = {}) => {
  const {
    onToggle = null,
    confirmToggle = false,
    confirmMessage = '¿Confirmar cambio de estado?',
    enableLogging = true,
    enableOptimisticUpdates = true,
    onSuccess = null,
    onError = null
  } = options;

  const [isToggling, setIsToggling] = useState(false);
  const [lastToggled, setLastToggled] = useState(null);
  const [toggleHistory, setToggleHistory] = useState([]);

  /**
   * Toggle del estado de un elemento
   */
  const toggle = useCallback(async (id, currentValue, newValue = null) => {
    // Calcular nuevo valor si no se proporciona
    const targetValue = newValue !== null ? newValue : !currentValue;

    // Confirmación si está habilitada
    if (confirmToggle) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return false;
    }

    try {
      setIsToggling(true);
      
      // Logging si está habilitado
      if (enableLogging) {
        console.log(`Toggling status for ${id}: ${currentValue} → ${targetValue}`);
      }

      // Ejecutar callback de toggle
      if (onToggle) {
        await onToggle(id, targetValue, currentValue);
      }

      // Actualizar historial
      const toggleEvent = {
        id,
        from: currentValue,
        to: targetValue,
        timestamp: Date.now()
      };
      
      setToggleHistory(prev => [toggleEvent, ...prev.slice(0, 99)]);
      setLastToggled({ id, value: targetValue, timestamp: Date.now() });

      // Callback de éxito
      if (onSuccess) {
        onSuccess(id, targetValue, currentValue);
      }

      return true;
    } catch (error) {
      console.error('Error toggling status:', error);
      
      if (onError) {
        onError(error, id, targetValue, currentValue);
      }
      
      throw error;
    } finally {
      setIsToggling(false);
    }
  }, [onToggle, confirmToggle, confirmMessage, enableLogging, onSuccess, onError]);

  /**
   * Toggle múltiple para varios elementos
   */
  const toggleMultiple = useCallback(async (items, targetValue) => {
    const results = [];
    
    for (const item of items) {
      try {
        const result = await toggle(item.id, item.currentValue, targetValue);
        results.push({ id: item.id, success: true, result });
      } catch (error) {
        results.push({ id: item.id, success: false, error });
      }
    }

    return results;
  }, [toggle]);

  /**
   * Activar elemento(s)
   */
  const activate = useCallback(async (id, currentValue) => {
    return await toggle(id, currentValue, true);
  }, [toggle]);

  /**
   * Desactivar elemento(s)
   */
  const deactivate = useCallback(async (id, currentValue) => {
    return await toggle(id, currentValue, false);
  }, [toggle]);

  /**
   * Activar múltiples elementos
   */
  const activateMultiple = useCallback(async (items) => {
    return await toggleMultiple(items.map(item => ({ ...item, targetValue: true })));
  }, [toggleMultiple]);

  /**
   * Desactivar múltiples elementos
   */
  const deactivateMultiple = useCallback(async (items) => {
    return await toggleMultiple(items.map(item => ({ ...item, targetValue: false })));
  }, [toggleMultiple]);

  /**
   * Obtener historial de toggles para un elemento específico
   */
  const getToggleHistory = useCallback((id) => {
    return toggleHistory.filter(event => event.id === id);
  }, [toggleHistory]);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setToggleHistory([]);
    setLastToggled(null);
  }, []);

  /**
   * Verificar si un elemento fue toggleado recientemente
   */
  const wasRecentlyToggled = useCallback((id, withinMs = 5000) => {
    if (!lastToggled || lastToggled.id !== id) return false;
    
    const now = Date.now();
    return (now - lastToggled.timestamp) <= withinMs;
  }, [lastToggled]);

  return {
    // Estado
    isToggling,
    lastToggled,
    toggleHistory,
    
    // Acciones principales
    toggle,
    toggleMultiple,
    
    // Acciones específicas
    activate,
    deactivate,
    activateMultiple,
    deactivateMultiple,
    
    // Utilidades
    getToggleHistory,
    clearHistory,
    wasRecentlyToggled,
    
    // Estadísticas
    totalToggles: toggleHistory.length,
    recentToggles: toggleHistory.filter(event => 
      Date.now() - event.timestamp <= 60000 // Últimos 60 segundos
    ).length
  };
};

export default useToggleStatus;