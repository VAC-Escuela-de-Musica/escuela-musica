"use strict";

/**
 * Middleware para configurar headers CORS específicos para archivos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const fileAccessMiddleware = (req, res, next) => {
  // Configurar headers CORS específicos para archivos
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

/**
 * Middleware para configurar headers de streaming de archivos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const fileStreamMiddleware = (req, res, next) => {
  // Headers para streaming de archivos
  res.header('Accept-Ranges', 'bytes');
  res.header('X-Content-Type-Options', 'nosniff');
  
  next();
};

/**
 * Middleware para configurar headers de seguridad para archivos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const fileSecurityMiddleware = (req, res, next) => {
  // Headers de seguridad
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

/**
 * Middleware para configurar headers de cache para archivos
 * @param {number} maxAge - Tiempo de cache en segundos (por defecto 1 día)
 */
const fileCacheMiddleware = (maxAge = 86400) => {
  return (req, res, next) => {
    res.header('Cache-Control', `public, max-age=${maxAge}`);
    res.header('ETag', req.params.id || req.params.filename);
    next();
  };
};

/**
 * Middleware para logging de acceso a archivos
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const fileAccessLogger = (req, res, next) => {
  const userInfo = req.user ? req.user.email : 'anonymous';
  const fileInfo = req.params.id || req.params.filename || 'unknown';
  
  console.log(`[${new Date().toISOString()}] File Access: ${fileInfo} by ${userInfo} from ${req.ip}`);
  
  next();
};

export { 
  fileAccessMiddleware, 
  fileStreamMiddleware, 
  fileSecurityMiddleware, 
  fileCacheMiddleware, 
  fileAccessLogger 
};
