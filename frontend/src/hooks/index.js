/**
 * Exporta todos los custom hooks del sistema
 */
export { useUsers } from './useUsers.js';
export { useMaterials } from './useMaterials.js';

// Exportar hooks como default también
export { default as useUsers } from './useUsers.js';
export { default as useMaterials } from './useMaterials.js';

export default {
  useUsers,
  useMaterials
};
