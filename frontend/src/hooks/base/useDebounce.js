import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Optimiza búsquedas y filtros evitando llamadas excesivas
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos (default: 300)
 * @returns {any} - Valor debouncé
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};