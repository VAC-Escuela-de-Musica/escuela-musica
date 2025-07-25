import { useState, useCallback, useMemo } from 'react';

/**
 * Hook configurable para selección múltiple - Capa 2
 * Proporciona funcionalidades avanzadas para manejo de selección
 * Incluye filtrado, límites, persistencia y callbacks
 */
export const useItemSelection = (items = [], options = {}) => {
  const {
    keyField = 'id',
    maxSelections = null,
    minSelections = 0,
    mode = 'multiple', // 'single' | 'multiple'
    persistSelection = false,
    storageKey = 'itemSelection',
    onSelectionChange = null,
    onMaxReached = null,
    onMinReached = null,
    disabledItems = () => false,
    enableGroups = false,
    groupBy = null
  } = options;

  // Estado de selección
  const [selectedItems, setSelectedItems] = useState(() => {
    if (persistSelection && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Persistir selección si está habilitado
  const persistSelectionIfEnabled = useCallback((selection) => {
    if (persistSelection && storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(selection)));
      } catch (error) {
        console.warn('No se pudo persistir la selección:', error);
      }
    }
  }, [persistSelection, storageKey]);

  // Obtener clave del elemento
  const getItemKey = useCallback((item) => {
    return typeof item === 'object' ? item[keyField] : item;
  }, [keyField]);

  // Elementos seleccionables
  const selectableItems = useMemo(() => {
    return items.filter(item => !disabledItems(item));
  }, [items, disabledItems]);

  // Elementos seleccionados como array de objetos
  const selectedItemsArray = useMemo(() => {
    return items.filter(item => selectedItems.has(getItemKey(item)));
  }, [items, selectedItems, getItemKey]);

  // Estados computados
  const isAllSelected = useMemo(() => {
    return selectableItems.length > 0 && 
           selectableItems.every(item => selectedItems.has(getItemKey(item)));
  }, [selectableItems, selectedItems, getItemKey]);

  const isIndeterminate = useMemo(() => {
    return selectedItems.size > 0 && !isAllSelected;
  }, [selectedItems.size, isAllSelected]);

  const canSelectMore = useMemo(() => {
    return !maxSelections || selectedItems.size < maxSelections;
  }, [maxSelections, selectedItems.size]);

  const hasMinimumSelection = useMemo(() => {
    return selectedItems.size >= minSelections;
  }, [selectedItems.size, minSelections]);

  // Seleccionar elemento individual
  const selectItem = useCallback((item) => {
    const itemKey = getItemKey(item);
    
    // Verificar si el elemento puede ser seleccionado
    if (disabledItems(item)) return false;

    const newSelection = new Set(selectedItems);

    if (mode === 'single') {
      // Modo selección única
      newSelection.clear();
      newSelection.add(itemKey);
    } else {
      // Modo selección múltiple
      if (selectedItems.has(itemKey)) {
        // Deseleccionar
        newSelection.delete(itemKey);
      } else {
        // Seleccionar
        if (maxSelections && newSelection.size >= maxSelections) {
          if (onMaxReached) {
            onMaxReached(maxSelections);
          }
          return false;
        }
        newSelection.add(itemKey);
      }
    }

    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    // Callback de cambio
    if (onSelectionChange) {
      const selectedData = items.filter(item => newSelection.has(getItemKey(item)));
      onSelectionChange(selectedData, newSelection);
    }

    return true;
  }, [
    getItemKey, disabledItems, mode, selectedItems, maxSelections, 
    onMaxReached, onSelectionChange, items, persistSelectionIfEnabled
  ]);

  // Deseleccionar elemento
  const deselectItem = useCallback((item) => {
    const itemKey = getItemKey(item);
    
    if (!selectedItems.has(itemKey)) return false;

    const newSelection = new Set(selectedItems);
    newSelection.delete(itemKey);

    // Verificar mínimo
    if (newSelection.size < minSelections) {
      if (onMinReached) {
        onMinReached(minSelections);
      }
      return false;
    }

    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    if (onSelectionChange) {
      const selectedData = items.filter(item => newSelection.has(getItemKey(item)));
      onSelectionChange(selectedData, newSelection);
    }

    return true;
  }, [
    getItemKey, selectedItems, minSelections, onMinReached, 
    onSelectionChange, items, persistSelectionIfEnabled
  ]);

  // Toggle selección
  const toggleItem = useCallback((item) => {
    const itemKey = getItemKey(item);
    
    if (selectedItems.has(itemKey)) {
      return deselectItem(item);
    } else {
      return selectItem(item);
    }
  }, [selectedItems, getItemKey, selectItem, deselectItem]);

  // Seleccionar todos
  const selectAll = useCallback(() => {
    let newSelection = new Set();
    let count = 0;

    for (const item of selectableItems) {
      if (maxSelections && count >= maxSelections) break;
      newSelection.add(getItemKey(item));
      count++;
    }

    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    if (onSelectionChange) {
      const selectedData = items.filter(item => newSelection.has(getItemKey(item)));
      onSelectionChange(selectedData, newSelection);
    }

    if (maxSelections && selectableItems.length > maxSelections && onMaxReached) {
      onMaxReached(maxSelections);
    }
  }, [
    selectableItems, maxSelections, getItemKey, onSelectionChange, 
    items, persistSelectionIfEnabled, onMaxReached
  ]);

  // Deseleccionar todos
  const deselectAll = useCallback(() => {
    const newSelection = new Set();
    
    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    if (onSelectionChange) {
      onSelectionChange([], newSelection);
    }
  }, [onSelectionChange, persistSelectionIfEnabled]);

  // Seleccionar rango
  const selectRange = useCallback((startItem, endItem) => {
    const startIndex = items.findIndex(item => getItemKey(item) === getItemKey(startItem));
    const endIndex = items.findIndex(item => getItemKey(item) === getItemKey(endItem));
    
    if (startIndex === -1 || endIndex === -1) return false;

    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    const newSelection = new Set(selectedItems);
    let count = selectedItems.size;

    for (let i = start; i <= end; i++) {
      const item = items[i];
      const itemKey = getItemKey(item);
      
      if (!disabledItems(item) && !newSelection.has(itemKey)) {
        if (maxSelections && count >= maxSelections) break;
        newSelection.add(itemKey);
        count++;
      }
    }

    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    if (onSelectionChange) {
      const selectedData = items.filter(item => newSelection.has(getItemKey(item)));
      onSelectionChange(selectedData, newSelection);
    }

    return true;
  }, [
    items, getItemKey, selectedItems, disabledItems, maxSelections, 
    onSelectionChange, persistSelectionIfEnabled
  ]);

  // Invertir selección
  const invertSelection = useCallback(() => {
    const newSelection = new Set();
    let count = 0;

    for (const item of selectableItems) {
      const itemKey = getItemKey(item);
      
      if (!selectedItems.has(itemKey)) {
        if (maxSelections && count >= maxSelections) break;
        newSelection.add(itemKey);
        count++;
      }
    }

    setSelectedItems(newSelection);
    persistSelectionIfEnabled(newSelection);

    if (onSelectionChange) {
      const selectedData = items.filter(item => newSelection.has(getItemKey(item)));
      onSelectionChange(selectedData, newSelection);
    }
  }, [
    selectableItems, getItemKey, selectedItems, maxSelections, 
    onSelectionChange, items, persistSelectionIfEnabled
  ]);

  // Verificar si un elemento está seleccionado
  const isSelected = useCallback((item) => {
    return selectedItems.has(getItemKey(item));
  }, [selectedItems, getItemKey]);

  // Obtener grupos de selección (si está habilitado)
  const selectionGroups = useMemo(() => {
    if (!enableGroups || !groupBy) return null;

    const groups = {};
    
    selectedItemsArray.forEach(item => {
      const groupKey = typeof groupBy === 'function' ? groupBy(item) : item[groupBy];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [enableGroups, groupBy, selectedItemsArray]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: selectedItems.size,
    percentage: items.length > 0 ? (selectedItems.size / items.length) * 100 : 0,
    remaining: maxSelections ? maxSelections - selectedItems.size : null,
    canSelectMore,
    hasMinimumSelection,
    isAtMaximum: maxSelections ? selectedItems.size >= maxSelections : false
  }), [selectedItems.size, items.length, maxSelections, canSelectMore, hasMinimumSelection]);

  return {
    // Estado
    selectedItems: selectedItemsArray,
    selectedKeys: Array.from(selectedItems),
    selectionCount: selectedItems.size,
    
    // Estados computados
    isAllSelected,
    isIndeterminate,
    canSelectMore,
    hasMinimumSelection,
    stats,
    selectionGroups,
    
    // Acciones
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    selectRange,
    invertSelection,
    
    // Utilidades
    isSelected,
    getItemKey,
    
    // Configuración
    maxSelections,
    minSelections,
    mode
  };
};

export default useItemSelection;