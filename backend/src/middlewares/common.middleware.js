/**
 * Common middleware functions
 * Provides shared middleware utilities across the application
 */

/**
 * Error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error response
  const errorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

/**
 * CORS middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const corsMiddleware = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  const allowedHeaders = "Origin, X-Requested-With, Content-Type, Accept, Authorization";
  res.header("Access-Control-Allow-Headers", allowedHeaders);
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
};

/**
 * JSON parsing error handler
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
    });
  }
  next(err);
};

/**
 * Not found middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async wrapper for route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
};

/**
 * Security headers middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
};

export default {
  errorHandler,
  requestLogger,
  corsMiddleware,
  jsonErrorHandler,
  notFoundHandler,
  asyncHandler,
  rateLimitConfig,
  securityHeaders,
}; 