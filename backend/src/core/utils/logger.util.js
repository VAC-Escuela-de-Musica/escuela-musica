import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Configuración de logging estructurado
 */
class Logger {
  constructor () {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'escuela-musica-backend' },
      transports: [
        // Archivo para errores
        new winston.transports.File({
          filename: path.join(__dirname, '../logs/error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // Archivo para todos los logs
        new winston.transports.File({
          filename: path.join(__dirname, '../logs/combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    })

    // En desarrollo, también logear a consola
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }))
    }
  }

  /**
   * Sanitiza datos sensibles antes de logear
   * @param {Object} data - Datos a sanitizar
   * @returns {Object} - Datos sanitizados
   */
  sanitizeData (data) {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'jwt', 'secret']
    const sanitized = { ...data }

    const sanitizeRecursive = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeRecursive(item))
      }

      if (obj && typeof obj === 'object') {
        const result = {}
        for (const [key, value] of Object.entries(obj)) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            result[key] = '[REDACTED]'
          } else if (typeof value === 'object') {
            result[key] = sanitizeRecursive(value)
          } else {
            result[key] = value
          }
        }
        return result
      }

      return obj
    }

    return sanitizeRecursive(sanitized)
  }

  /**
   * Log de información
   * @param {string} message - Mensaje
   * @param {Object} meta - Metadatos adicionales
   */
  info (message, meta = {}) {
    this.logger.info(message, this.sanitizeData(meta))
  }

  /**
   * Log de error
   * @param {string} message - Mensaje de error
   * @param {Error|Object} error - Error o metadatos
   */
  error (message, error = {}) {
    const sanitizedError = this.sanitizeData(error)

    if (error instanceof Error) {
      this.logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        ...sanitizedError
      })
    } else {
      this.logger.error(message, sanitizedError)
    }
  }

  /**
   * Log de advertencia
   * @param {string} message - Mensaje de advertencia
   * @param {Object} meta - Metadatos adicionales
   */
  warn (message, meta = {}) {
    this.logger.warn(message, this.sanitizeData(meta))
  }

  /**
   * Log de debug
   * @param {string} message - Mensaje de debug
   * @param {Object} meta - Metadatos adicionales
   */
  debug (message, meta = {}) {
    this.logger.debug(message, this.sanitizeData(meta))
  }

  /**
   * Log de request HTTP
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {number} duration - Duración en ms
   */
  httpRequest (req, res, duration) {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || req.user?.email || 'anonymous'
    }

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData)
    } else {
      this.info(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData)
    }
  }

  /**
   * Log de autenticación
   * @param {string} event - Tipo de evento (login, logout, etc.)
   * @param {string} userId - ID del usuario
   * @param {Object} meta - Metadatos adicionales
   */
  auth (event, userId, meta = {}) {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ...this.sanitizeData(meta)
    })
  }

  /**
   * Log de base de datos
   * @param {string} operation - Operación realizada
   * @param {string} collection - Colección afectada
   * @param {Object} meta - Metadatos adicionales
   */
  database (operation, collection, meta = {}) {
    this.info(`Database: ${operation} on ${collection}`, {
      operation,
      collection,
      ...this.sanitizeData(meta)
    })
  }
}

// Crear instancia singleton
const logger = new Logger()

export default logger
