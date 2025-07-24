import { logger } from './logger.util.js'
import { errorHandler } from './errorHandler.util.js'

/**
 * Wrapper universal para manejo de errores
 * Elimina duplicación de código en controladores y servicios
 */
class ErrorWrapper {
  /**
   * Wrapper para funciones asíncronas con manejo de errores
   * @param {Function} asyncFunction - Función asíncrona a ejecutar
   * @param {Object} options - Opciones de configuración
   */
  static wrapAsync (asyncFunction, options = {}) {
    const {
      context = 'Unknown',
      logLevel = 'error',
      includeStack = false,
      customErrorHandler = null
    } = options

    return async (...args) => {
      try {
        return await asyncFunction(...args)
      } catch (error) {
        // Log del error con contexto
        const errorMessage = `[${context}] Error: ${error.message}`

        if (includeStack) {
          logger[logLevel](errorMessage, error.stack)
        } else {
          logger[logLevel](errorMessage)
        }

        // Usar handler personalizado si está definido
        if (customErrorHandler) {
          return customErrorHandler(error, args)
        }

        // Usar handler por defecto
        throw errorHandler.handle(error, context)
      }
    }
  }

  /**
   * Wrapper para controladores Express
   * @param {Function} controllerFunction - Función del controlador
   * @param {Object} options - Opciones de configuración
   */
  static wrapController (controllerFunction, options = {}) {
    const {
      context = 'Controller',
      successMessage = null,
      errorMessage = null
    } = options

    return this.wrapAsync(async (req, res, next) => {
      try {
        const result = await controllerFunction(req, res, next)

        if (successMessage) {
          logger.info(`[${context}] ${successMessage}`)
        }

        return result
      } catch (error) {
        if (errorMessage) {
          logger.error(`[${context}] ${errorMessage}: ${error.message}`)
        }

        // Pasar el error al middleware de manejo de errores
        next(error)
      }
    }, { context, logLevel: 'error', includeStack: true })
  }

  /**
   * Wrapper para servicios
   * @param {Function} serviceFunction - Función del servicio
   * @param {Object} options - Opciones de configuración
   */
  static wrapService (serviceFunction, options = {}) {
    const {
      context = 'Service',
      transformError = null,
      retryCount = 0,
      retryDelay = 1000
    } = options

    return this.wrapAsync(async (...args) => {
      let lastError

      for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
          return await serviceFunction(...args)
        } catch (error) {
          lastError = error

          if (attempt < retryCount) {
            logger.warn(`[${context}] Intento ${attempt + 1} falló, reintentando en ${retryDelay}ms`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }

          // Transformar error si es necesario
          if (transformError) {
            throw transformError(error)
          }

          throw error
        }
      }

      throw lastError
    }, { context, logLevel: 'error', includeStack: true })
  }

  /**
   * Wrapper para validaciones
   * @param {Function} validationFunction - Función de validación
   * @param {Object} options - Opciones de configuración
   */
  static wrapValidation (validationFunction, options = {}) {
    const { context = 'Validation' } = options

    return this.wrapAsync(validationFunction, {
      context,
      logLevel: 'warn',
      customErrorHandler: (error) => {
        // Los errores de validación se manejan de forma especial
        throw {
          name: 'ValidationError',
          message: error.message,
          details: error.details || null,
          statusCode: 400
        }
      }
    })
  }

  /**
   * Wrapper para operaciones de base de datos
   * @param {Function} dbFunction - Función de base de datos
   * @param {Object} options - Opciones de configuración
   */
  static wrapDatabase (dbFunction, options = {}) {
    const {
      context = 'Database',
      operation = 'unknown',
      retryCount = 2,
      retryDelay = 500
    } = options

    return this.wrapService(dbFunction, {
      context: `${context}-${operation}`,
      retryCount,
      retryDelay,
      transformError: (error) => {
        // Transformar errores específicos de MongoDB
        if (error.code === 11000) {
          return {
            name: 'DuplicateKeyError',
            message: 'El registro ya existe',
            statusCode: 409
          }
        }

        if (error.name === 'CastError') {
          return {
            name: 'InvalidIdError',
            message: 'ID inválido',
            statusCode: 400
          }
        }

        return error
      }
    })
  }

  /**
   * Wrapper para operaciones de archivos
   * @param {Function} fileFunction - Función de manejo de archivos
   * @param {Object} options - Opciones de configuración
   */
  static wrapFile (fileFunction, options = {}) {
    const {
      context = 'File',
      operation = 'unknown'
    } = options

    return this.wrapAsync(fileFunction, {
      context: `${context}-${operation}`,
      logLevel: 'error',
      includeStack: true,
      customErrorHandler: (error) => {
        // Transformar errores específicos de archivos
        if (error.code === 'ENOENT') {
          throw {
            name: 'FileNotFoundError',
            message: 'Archivo no encontrado',
            statusCode: 404
          }
        }

        if (error.code === 'EACCES') {
          throw {
            name: 'FilePermissionError',
            message: 'Sin permisos para acceder al archivo',
            statusCode: 403
          }
        }

        throw error
      }
    })
  }

  /**
   * Crear un wrapper personalizado
   * @param {Object} config - Configuración del wrapper
   */
  static createCustomWrapper (config) {
    const {
      context = 'Custom',
      logLevel = 'error',
      includeStack = false,
      retryCount = 0,
      retryDelay = 1000,
      errorTransformer = null,
      successCallback = null,
      errorCallback = null
    } = config

    return (targetFunction) => {
      return this.wrapAsync(async (...args) => {
        let lastError

        for (let attempt = 0; attempt <= retryCount; attempt++) {
          try {
            const result = await targetFunction(...args)

            if (successCallback) {
              successCallback(result, args)
            }

            return result
          } catch (error) {
            lastError = error

            if (errorCallback) {
              errorCallback(error, args, attempt)
            }

            if (attempt < retryCount) {
              await new Promise(resolve => setTimeout(resolve, retryDelay))
              continue
            }

            if (errorTransformer) {
              throw errorTransformer(error)
            }

            throw error
          }
        }

        throw lastError
      }, { context, logLevel, includeStack })
    }
  }
}

export { ErrorWrapper }
