import logger from '../utils/logger.util.js';

/**
 * Middleware para logging de requests HTTP
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Capturar cuando la respuesta termine
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.httpRequest(req, res, duration);
  });
  
  next();
};

/**
 * Middleware para medir performance
 */
export const performanceMonitor = (req, res, next) => {
  req.startTime = Date.now();
  
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    // Log si la respuesta toma más de 1 segundo
    if (duration > 1000) {
      logger.warn('Respuesta lenta detectada', {
        url: req.url,
        method: req.method,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent')
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para headers de seguridad adicionales
 */
export const securityHeaders = (req, res, next) => {
  // Remover headers que revelan información del servidor
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Agregar headers de seguridad personalizados
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Middleware para agregar información de la request
 */
export const requestInfo = (req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.timestamp = new Date().toISOString();
  
  next();
};

/**
 * Middleware global para manejo de errores
 */
export const globalErrorHandler = (err, req, res, next) => {
  logger.error('Error no manejado', {
    error: err,
    url: req.url,
    method: req.method,
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // No enviar stack traces en producción
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    statusCode: err.statusCode || 500,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(errorResponse);
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  logger.warn('Ruta no encontrada', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
};
