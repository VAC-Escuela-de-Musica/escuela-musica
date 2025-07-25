import { useState, useCallback } from 'react';

/**
 * Hook configurable para reordenamiento de items
 * Capa 2 - Funcionalidades configurables y reutilizables
 * 
 * @param {Array} initialItems - Array inicial de items
 * @param {Function} onReorder - Callback cuando se reordena (item, newIndex, oldIndex)
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Objeto con funcionalidades de reordenamiento
 */
export const useReordering = (initialItems = [], onReorder = null, options = {}) => {
  const {
    enableDragDrop = true,
    persistChanges = true,
    orderField = 'orden'
  } = options;

  // Estados
  const [items, setItems] = useState(initialItems);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Mover item hacia arriba
  const moveUp = useCallback((index) => {
    if (index <= 0) return;

    const newItems = [...items];
    const item = newItems[index];
    const prevItem = newItems[index - 1];

    // Intercambiar posiciones
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];

    setItems(newItems);

    // Callback para persistir cambios
    if (onReorder) {
      onReorder(item, index - 1, index);
    }

    return newItems;
  }, [items, onReorder]);

  // Mover item hacia abajo
  const moveDown = useCallback((index) => {
    if (index >= items.length - 1) return;

    const newItems = [...items];
    const item = newItems[index];
    const nextItem = newItems[index + 1];

    // Intercambiar posiciones
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];

    setItems(newItems);

    // Callback para persistir cambios
    if (onReorder) {
      onReorder(item, index + 1, index);
    }

    return newItems;
  }, [items, onReorder]);

  // Mover item a posición específica
  const moveTo = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    const newItems = [...items];
    const item = newItems.splice(fromIndex, 1)[0];
    newItems.splice(toIndex, 0, item);

    setItems(newItems);

    // Callback para persistir cambios
    if (onReorder) {
      onReorder(item, toIndex, fromIndex);
    }

    return newItems;
  }, [items, onReorder]);

  // Handlers para drag & drop
  const handleDragStart = useCallback((e, item, index) => {
    if (!enableDragDrop) return;

    setIsDragging(true);
    setDraggedItem({ item, index });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setData('text/plain', item[orderField] || index);
  }, [enableDragDrop, orderField]);

  const handleDragOver = useCallback((e) => {
    if (!enableDragDrop) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [enableDragDrop]);

  const handleDrop = useCallback((e, dropIndex) => {
    if (!enableDragDrop || !draggedItem) return;

    e.preventDefault();
    
    const { index: dragIndex } = draggedItem;
    
    if (dragIndex !== dropIndex) {
      moveTo(dragIndex, dropIndex);
    }

    setIsDragging(false);
    setDraggedItem(null);
  }, [enableDragDrop, draggedItem, moveTo]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
  }, []);

  // Actualizar items cuando cambian los items iniciales
  const updateItems = useCallback((newItems) => {
    setItems(newItems);
  }, []);

  // Resetear orden original
  const resetOrder = useCallback(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Generar props para elementos draggables
  const getDraggableProps = useCallback((item, index) => {
    if (!enableDragDrop) return {};

    return {
      draggable: true,
      onDragStart: (e) => handleDragStart(e, item, index),
      onDragOver: handleDragOver,
      onDrop: (e) => handleDrop(e, index),
      onDragEnd: handleDragEnd,
      style: {
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: draggedItem?.index === index ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }
    };
  }, [enableDragDrop, isDragging, draggedItem, handleDragStart, handleDragOver, handleDrop, handleDragEnd]);

  return {
    // Estados
    items,
    isDragging,
    draggedItem,

    // Funciones de reordenamiento
    moveUp,
    moveDown,
    moveTo,
    updateItems,
    resetOrder,

    // Props para drag & drop
    getDraggableProps,

    // Handlers de drag & drop
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,

    // Configuración
    options: {
      enableDragDrop,
      persistChanges,
      orderField
    }
  };
};