"use strict";

import logger from './logger.util.js';

/**
 * Manejador de errores fatales
 * @param {Object} error Objecto con las especificaciones del error
 * @param {String} context Contexto donde ocurrió el error
 */
function handleFatalError(error, context) {
  logger.error(`[FATAL ERROR] Apagando servidor - ${context}`, {
    error,
    context,
    fatal: true
  });
  
  // En desarrollo, también mostrar en consola
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[FATAL ERROR] Apagando servidor - ${context}`);
    console.error(error);
  }
  
  process.exit(1);
}

/**
 * Manejador de errores
 * @param {Object} error Objecto con las especificaciones del error
 * @param {String} context Contexto donde ocurrió el error
 */
function handleError(error, context) {
  logger.error(`Error en: ${context}`, {
    error,
    context
  });
  
  // En desarrollo, también mostrar en consola
  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ [ERROR] Error en: ${context}`);
    console.error(`🗯  ${error.message}`);
  }
}

export { handleFatalError, handleError };
