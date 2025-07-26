import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook para manejo centralizado de errores - Capa Base
 * Proporciona funcionalidades avanzadas para captura, logging y recovery
 * Incluye retry automático, throttling y categorización de errores
 */
export const useErrorHandler = (options = {}) => {
  const {
    enableLogging = true,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    enableThrottling = true,
    throttleMs = 5000,
    onError = null,
    onRecovery = null,
    autoReset = true,
    resetDelayMs = 10000
  } = options;

  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorHistory, setErrorHistory] = useState([]);
  
  const lastErrorTime = useRef(0);
  const retryTimeoutRef = useRef(null);
  const resetTimeoutRef = useRef(null);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  // Categorizar tipo de error
  const categorizeError = useCallback((error) => {
    if (!error) return 'unknown';

    // Error de red
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return 'network';
    }

    // Errores HTTP
    if (error.response) {
      const status = error.response.status;
      if (status >= 400 && status < 500) return 'client';
      if (status >= 500) return 'server';
    }

    // Errores de validación
    if (error.name === 'ValidationError' || error.message?.includes('validación')) {
      return 'validation';
    }

    // Errores de autenticación
    if (error.response?.status === 401 || error.message?.includes('unauthorized')) {
      return 'auth';
    }

    // Errores de permisos
    if (error.response?.status === 403 || error.message?.includes('forbidden')) {
      return 'permission';
    }

    return 'application';
  }, []);

  // Verificar si debe aplicar throttling
  const shouldThrottle = useCallback(() => {
    if (!enableThrottling) return false;
    
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTime.current;
    
    return timeSinceLastError < throttleMs;
  }, [enableThrottling, throttleMs]);

  // Logging de errores
  const logError = useCallback((error, context = {}) => {
    if (!enableLogging) return;

    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Error desconocido',
      stack: error.stack,
      category: categorizeError(error),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: retryCount
    };

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.info('Context:', context);
      console.info('Category:', errorInfo.category);
      console.groupEnd();
    }

    // Agregar al historial
    setErrorHistory(prev => [errorInfo, ...prev.slice(0, 49)]);

    // Log a servicio externo en producción
    if (process.env.NODE_ENV === 'production') {
      // Aquí se podría enviar a un servicio como Sentry, LogRocket, etc.
      // sendToLoggingService(errorInfo);
    }
  }, [enableLogging, categorizeError, retryCount]);

  // Capturar y manejar error
  const captureError = useCallback((error, context = {}) => {
    // Aplicar throttling si está habilitado
    if (shouldThrottle()) {
      console.warn('Error throttled:', error.message);
      return;
    }

    lastErrorTime.current = Date.now();
    
    // Log del error
    logError(error, context);
    
    // Establecer error en el estado
    setError({
      ...error,
      message: error.message || 'Error desconocido',
      category: categorizeError(error),
      timestamp: Date.now(),
      context
    });

    // Callback personalizado
    if (onError) {
      onError(error, context);
    }

    // Auto reset si está habilitado
    if (autoReset && resetDelayMs > 0) {
      resetTimeoutRef.current = setTimeout(() => {
        reset();
      }, resetDelayMs);
    }
  }, [shouldThrottle, logError, categorizeError, onError, autoReset, resetDelayMs]);

  // Retry automático
  const retry = useCallback(async (operation, context = {}) => {
    if (!enableRetry || retryCount >= maxRetries) {
      throw new Error(`Máximo número de reintentos alcanzado (${maxRetries})`);
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Delay antes del retry
      await new Promise(resolve => {
        retryTimeoutRef.current = setTimeout(resolve, retryDelay * Math.pow(2, retryCount));
      });

      const result = await operation();
      
      // Recovery exitoso
      if (onRecovery) {
        onRecovery(result, retryCount + 1);
      }

      // Reset estado de error
      reset();
      
      return result;
    } catch (retryError) {
      captureError(retryError, { ...context, isRetry: true, retryAttempt: retryCount + 1 });
      throw retryError;
    } finally {
      setIsRetrying(false);
    }
  }, [enableRetry, retryCount, maxRetries, retryDelay, onRecovery, captureError]);

  // Wrapper para ejecutar operaciones con manejo de errores
  const withErrorHandling = useCallback((operation) => {
    return async (...args) => {
      try {
        return await operation(...args);
      } catch (error) {
        captureError(error, { operation: operation.name, args });
        throw error;
      }
    };
  }, [captureError]);

  // Reset del estado de error
  const reset = useCallback(() => {
    setError(null);
    setIsRetrying(false);
    setRetryCount(0);
    
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setErrorHistory([]);
  }, []);

  // Obtener errores por categoría
  const getErrorsByCategory = useCallback((category) => {
    return errorHistory.filter(error => error.category === category);
  }, [errorHistory]);

  return {
    // Estado
    error,
    isRetrying,
    retryCount,
    errorHistory,
    hasError: !!error,
    
    // Acciones
    captureError,
    retry,
    withErrorHandling,
    reset,
    clearHistory,
    
    // Utilidades
    getErrorsByCategory,
    
    // Información del error actual
    errorMessage: error?.message || null,
    errorCategory: error?.category || null,
    canRetry: enableRetry && retryCount < maxRetries,
    
    // Estadísticas
    totalErrors: errorHistory.length,
    errorsByCategory: errorHistory.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {})
  };
};

/**
 * Hook simplificado para casos básicos
 */
export const useSimpleErrorHandler = () => {
  const [error, setError] = useState(null);

  const captureError = useCallback((error) => {
    setError(error?.message || 'Error desconocido');
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    captureError,
    reset,
    hasError: !!error
  };
};

export default useErrorHandler;