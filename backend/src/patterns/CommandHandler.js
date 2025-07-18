import { Result } from './Result.js';
import { handleError } from '../utils/errorHandler.util.js';
import { respondSuccess, respondError } from '../utils/responseHandler.util.js';

/**
 * Command Handler base para eliminar duplicación en controladores
 * Implementa el patrón Command para operaciones CRUD consistentes
 */
export class CommandHandler {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Ejecutar comando con validación, servicio y respuesta unificada
   * @param {Object} options - Opciones del comando
   * @param {Object} options.req - Request object
   * @param {Object} options.res - Response object
   * @param {Function} options.validator - Función de validación
   * @param {Function} options.serviceMethod - Método del servicio
   * @param {string} options.context - Contexto para logging
   * @param {number} options.successStatus - Código de estado para éxito
   * @param {string} options.successMessage - Mensaje de éxito
   * @param {Function} options.dataTransformer - Transformador de datos opcional
   * @returns {Promise<void>}
   */
  async execute({
    req,
    res,
    validator,
    serviceMethod,
    context,
    successStatus = 200,
    successMessage = null,
    dataTransformer = null
  }) {
    const startTime = Date.now();
    
    try {
      // 1. Validación de entrada
      const validationResult = await this.validateInput(req, validator);
      if (validationResult.isError()) {
        return respondError(req, res, validationResult.statusCode, validationResult.error);
      }

      // 2. Ejecutar servicio
      const serviceResult = await this.executeService(serviceMethod, validationResult.data);
      if (serviceResult.isError()) {
        return respondError(req, res, serviceResult.statusCode, serviceResult.error);
      }

      // 3. Transformar datos si es necesario
      let responseData = serviceResult.data;
      if (dataTransformer) {
        responseData = await dataTransformer(responseData);
      }

      // 4. Logging de éxito
      const duration = Date.now() - startTime;
      this.logger?.info(`[${context}] Operation completed successfully in ${duration}ms`);

      // 5. Respuesta exitosa
      return respondSuccess(req, res, successStatus, responseData, successMessage);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger?.error(`[${context}] Operation failed after ${duration}ms:`, error);
      
      handleError(error, context);
      return respondError(req, res, 500, `Error interno en ${context}`);
    }
  }

  /**
   * Validar entrada del request
   * @param {Object} req - Request object
   * @param {Function} validator - Función de validación
   * @returns {Promise<Result>}
   */
  async validateInput(req, validator) {
    try {
      if (!validator) {
        return Result.success({ body: req.body, params: req.params, query: req.query });
      }

      const validationResult = await validator(req);
      if (validationResult.error) {
        return Result.error(validationResult.error, 400);
      }

      return Result.success(validationResult.data || { body: req.body, params: req.params, query: req.query });
    } catch (error) {
      return Result.error(`Error de validación: ${error.message}`, 400);
    }
  }

  /**
   * Ejecutar método del servicio
   * @param {Function} serviceMethod - Método del servicio
   * @param {Object} data - Datos validados
   * @returns {Promise<Result>}
   */
  async executeService(serviceMethod, data) {
    try {
      const result = await serviceMethod(data);
      
      // Manejar diferentes formatos de respuesta del servicio
      if (result instanceof Result) {
        return result;
      }

      // Formato {success, data, error}
      if (typeof result === 'object' && result.hasOwnProperty('success')) {
        return result.success 
          ? Result.success(result.data)
          : Result.error(result.error || 'Error del servicio', 400);
      }

      // Formato [data, error]
      if (Array.isArray(result) && result.length === 2) {
        const [data, error] = result;
        return error ? Result.error(error, 400) : Result.success(data);
      }

      // Resultado directo
      return Result.success(result);
    } catch (error) {
      return Result.internalError(`Error del servicio: ${error.message}`);
    }
  }
}

/**
 * Factory para crear command handlers específicos
 */
export class CommandHandlerFactory {
  static create(logger) {
    return new CommandHandler(logger);
  }

  /**
   * Crear comando CRUD estándar
   * @param {Object} service - Servicio a usar
   * @param {string} method - Método del servicio
   * @param {Function} validator - Validador
   * @param {string} context - Contexto para logging
   * @returns {Function}
   */
  static createCRUDCommand(service, method, validator, context) {
    const handler = new CommandHandler();
    
    return async (req, res) => {
      await handler.execute({
        req,
        res,
        validator,
        serviceMethod: (data) => service[method](data.params?.id, data.body, data.query),
        context: `${context} -> ${method}`
      });
    };
  }

  /**
   * Crear comando de consulta
   * @param {Object} service - Servicio a usar
   * @param {string} method - Método del servicio
   * @param {Function} validator - Validador
   * @param {string} context - Contexto para logging
   * @returns {Function}
   */
  static createQueryCommand(service, method, validator, context) {
    const handler = new CommandHandler();
    
    return async (req, res) => {
      await handler.execute({
        req,
        res,
        validator,
        serviceMethod: (data) => service[method](data.query, data.params),
        context: `${context} -> ${method}`,
        successStatus: 200
      });
    };
  }

  /**
   * Crear comando de creación
   * @param {Object} service - Servicio a usar
   * @param {string} method - Método del servicio
   * @param {Function} validator - Validador
   * @param {string} context - Contexto para logging
   * @returns {Function}
   */
  static createCreateCommand(service, method, validator, context) {
    const handler = new CommandHandler();
    
    return async (req, res) => {
      await handler.execute({
        req,
        res,
        validator,
        serviceMethod: (data) => service[method](data.body),
        context: `${context} -> ${method}`,
        successStatus: 201,
        successMessage: 'Recurso creado exitosamente'
      });
    };
  }
}

export default CommandHandler;
