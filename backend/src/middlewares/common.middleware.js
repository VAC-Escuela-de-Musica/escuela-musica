"use strict";

/**
 * Middleware para logging de requests HTTP
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const userInfo = req.user ? req.user.email : 'anonymous';
  
  // Log inicial
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - User: ${userInfo} - IP: ${req.ip}`);
  
  // Capturar el final de la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para rate limiting básico
 * @param {number} maxRequests - Número máximo de requests
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 */
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const clients = new Map();
  
  return (req, res, next) => {
    const clientId = req.ip;
    const now = Date.now();
    
    if (!clients.has(clientId)) {
      clients.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const client = clients.get(clientId);
    
    if (now > client.resetTime) {
      client.count = 1;
      client.resetTime = now + windowMs;
      return next();
    }
    
    if (client.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil((client.resetTime - now) / 1000)
      });
    }
    
    client.count++;
    next();
  };
};

/**
 * Middleware para medir performance de endpoints
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir a milisegundos
    
    // Log si la respuesta es lenta (>1000ms)
    if (duration > 1000) {
      console.warn(`[SLOW RESPONSE] ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
    
    // Aquí podrías enviar métricas a un sistema de monitoreo
    // como Prometheus, DataDog, etc.
  });
  
  next();
};

/**
 * Middleware para headers de seguridad básicos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const securityHeaders = (req, res, next) => {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * Middleware para agregar información de request al objeto req
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const requestInfo = (req, res, next) => {
  req.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.timestamp = new Date().toISOString();
  req.userAgent = req.get('User-Agent') || 'unknown';
  
  next();
};

export { 
  requestLogger, 
  rateLimiter, 
  performanceMonitor, 
  securityHeaders, 
  requestInfo 
};
