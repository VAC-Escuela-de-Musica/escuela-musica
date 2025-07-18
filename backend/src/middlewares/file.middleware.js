/**
 * Middleware específico para manejo de archivos
 */

export const fileAccessMiddleware = (req, res, next) => {
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

export const fileStreamMiddleware = (req, res, next) => {
  // Headers para streaming de archivos
  res.header('Accept-Ranges', 'bytes');
  res.header('X-Content-Type-Options', 'nosniff');
  
  next();
};
