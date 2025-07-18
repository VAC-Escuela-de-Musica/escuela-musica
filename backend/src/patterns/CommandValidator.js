import { Result } from '../patterns/Result.js';

/**
 * Validador base para comandos
 * Proporciona validación consistente para el Command Pattern
 */
export class CommandValidator {
  /**
   * Validar datos del request
   * @param {Object} req - Request object
   * @param {Object} schemas - Esquemas de validación Joi
   * @param {Object} schemas.body - Esquema para body
   * @param {Object} schemas.params - Esquema para params
   * @param {Object} schemas.query - Esquema para query
   * @returns {Promise<Result>}
   */
  static async validate(req, schemas = {}) {
    try {
      const validatedData = {
        body: req.body,
        params: req.params,
        query: req.query
      };

      // Validar body si hay esquema
      if (schemas.body && req.body) {
        const { error, value } = schemas.body.validate(req.body);
        if (error) {
          return Result.error(`Error en body: ${error.message}`, 400);
        }
        validatedData.body = value;
      }

      // Validar params si hay esquema
      if (schemas.params && req.params) {
        const { error, value } = schemas.params.validate(req.params);
        if (error) {
          return Result.error(`Error en parámetros: ${error.message}`, 400);
        }
        validatedData.params = value;
      }

      // Validar query si hay esquema
      if (schemas.query && req.query) {
        const { error, value } = schemas.query.validate(req.query);
        if (error) {
          return Result.error(`Error en query: ${error.message}`, 400);
        }
        validatedData.query = value;
      }

      return Result.success(validatedData);
    } catch (error) {
      return Result.error(`Error de validación: ${error.message}`, 400);
    }
  }

  /**
   * Crear validador para comando específico
   * @param {Object} schemas - Esquemas de validación
   * @returns {Function}
   */
  static createValidator(schemas) {
    return async (req) => {
      return await CommandValidator.validate(req, schemas);
    };
  }

  /**
   * Validador para operaciones CRUD por ID
   * @param {Object} bodySchema - Esquema para el body
   * @returns {Function}
   */
  static createCRUDValidator(bodySchema) {
    return async (req) => {
      const schemas = {
        params: {
          validate: (params) => {
            if (!params.id) {
              return { error: new Error('ID es requerido') };
            }
            return { value: params };
          }
        }
      };

      if (bodySchema) {
        schemas.body = bodySchema;
      }

      return await CommandValidator.validate(req, schemas);
    };
  }

  /**
   * Validador para consultas con paginación
   * @param {Object} querySchema - Esquema adicional para query
   * @returns {Function}
   */
  static createQueryValidator(querySchema) {
    return async (req) => {
      const baseQuerySchema = {
        validate: (query) => {
          const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
          
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);
          
          if (isNaN(pageNum) || pageNum < 1) {
            return { error: new Error('Page debe ser un número mayor a 0') };
          }
          
          if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return { error: new Error('Limit debe ser un número entre 1 y 100') };
          }
          
          return {
            value: {
              ...query,
              page: pageNum,
              limit: limitNum,
              sort,
              order
            }
          };
        }
      };

      const schemas = { query: baseQuerySchema };
      
      if (querySchema) {
        // Combinar esquemas si hay uno adicional
        schemas.query = {
          validate: (query) => {
            const baseResult = baseQuerySchema.validate(query);
            if (baseResult.error) return baseResult;
            
            const additionalResult = querySchema.validate(query);
            if (additionalResult.error) return additionalResult;
            
            return { value: { ...baseResult.value, ...additionalResult.value } };
          }
        };
      }

      return await CommandValidator.validate(req, schemas);
    };
  }

  /**
   * Validador para operaciones que requieren autenticación
   * @param {Object} schemas - Esquemas de validación
   * @param {Array} requiredRoles - Roles requeridos
   * @returns {Function}
   */
  static createAuthValidator(schemas, requiredRoles = []) {
    return async (req) => {
      // Validar esquemas base
      const baseResult = await CommandValidator.validate(req, schemas);
      if (baseResult.isError()) {
        return baseResult;
      }

      // Validar autenticación
      if (!req.user) {
        return Result.unauthorized('Usuario no autenticado');
      }

      // Validar roles si se especifican
      if (requiredRoles.length > 0) {
        const userRoles = req.user.roles || [];
        const hasRequiredRole = requiredRoles.some(role => 
          userRoles.includes(role) || 
          userRoles.some(userRole => userRole.name === role)
        );

        if (!hasRequiredRole) {
          return Result.forbidden(`Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`);
        }
      }

      return baseResult;
    };
  }

  /**
   * Validador para operaciones de archivo
   * @param {Object} schemas - Esquemas de validación
   * @param {Object} fileOptions - Opciones para archivos
   * @returns {Function}
   */
  static createFileValidator(schemas, fileOptions = {}) {
    return async (req) => {
      const baseResult = await CommandValidator.validate(req, schemas);
      if (baseResult.isError()) {
        return baseResult;
      }

      // Validar archivo si es requerido
      if (fileOptions.required && !req.file && !req.files) {
        return Result.error('Archivo es requerido', 400);
      }

      // Validar tipo de archivo
      if (fileOptions.allowedTypes && req.file) {
        const allowedTypes = fileOptions.allowedTypes;
        if (!allowedTypes.includes(req.file.mimetype)) {
          return Result.error(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`, 400);
        }
      }

      // Validar tamaño de archivo
      if (fileOptions.maxSize && req.file) {
        if (req.file.size > fileOptions.maxSize) {
          return Result.error(`Archivo demasiado grande. Tamaño máximo: ${fileOptions.maxSize} bytes`, 400);
        }
      }

      return baseResult;
    };
  }

  /**
   * Combinar múltiples validadores
   * @param {Array} validators - Array de validadores
   * @returns {Function}
   */
  static combineValidators(validators) {
    return async (req) => {
      for (const validator of validators) {
        const result = await validator(req);
        if (result.isError()) {
          return result;
        }
      }
      
      return Result.success({
        body: req.body,
        params: req.params,
        query: req.query
      });
    };
  }
}

export default CommandValidator;
