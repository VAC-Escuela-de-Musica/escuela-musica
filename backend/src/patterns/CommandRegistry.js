import { CommandHandlerFactory } from './CommandHandler.js';
import logger from '../utils/logger.util.js';

/**
 * Registry para comandos del sistema
 * Permite registro dinámico y ejecución de comandos
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.logger = logger;
  }

  /**
   * Registrar un comando
   * @param {string} name - Nombre del comando
   * @param {Object} config - Configuración del comando
   * @param {Object} config.service - Servicio a usar
   * @param {string} config.method - Método del servicio
   * @param {Function} config.validator - Función de validación
   * @param {string} config.context - Contexto para logging
   * @param {string} config.type - Tipo de comando (crud, query, create, custom)
   * @param {Function} config.customHandler - Handler personalizado (para type: custom)
   */
  register(name, config) {
    const { service, method, validator, context, type = 'crud', customHandler } = config;

    if (this.commands.has(name)) {
      throw new Error(`Command ${name} already registered`);
    }

    let commandHandler;

    switch (type) {
      case 'crud':
        commandHandler = CommandHandlerFactory.createCRUDCommand(service, method, validator, context);
        break;
      case 'query':
        commandHandler = CommandHandlerFactory.createQueryCommand(service, method, validator, context);
        break;
      case 'create':
        commandHandler = CommandHandlerFactory.createCreateCommand(service, method, validator, context);
        break;
      case 'custom':
        if (!customHandler) {
          throw new Error(`Custom handler required for command ${name}`);
        }
        commandHandler = customHandler;
        break;
      default:
        throw new Error(`Unknown command type: ${type}`);
    }

    this.commands.set(name, {
      handler: commandHandler,
      config: { ...config, registeredAt: new Date() }
    });

    this.logger.info(`Command registered: ${name} (${type})`);
  }

  /**
   * Ejecutar un comando registrado
   * @param {string} name - Nombre del comando
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Promise<void>}
   */
  async execute(name, req, res) {
    const command = this.commands.get(name);
    
    if (!command) {
      this.logger.error(`Command not found: ${name}`);
      return res.status(500).json({
        success: false,
        error: `Command ${name} not found`
      });
    }

    try {
      await command.handler(req, res);
    } catch (error) {
      this.logger.error(`Error executing command ${name}:`, error);
      return res.status(500).json({
        success: false,
        error: `Error executing command ${name}`
      });
    }
  }

  /**
   * Obtener middleware para un comando específico
   * @param {string} name - Nombre del comando
   * @returns {Function}
   */
  getMiddleware(name) {
    return (req, res, next) => {
      this.execute(name, req, res).catch(next);
    };
  }

  /**
   * Listar comandos registrados
   * @returns {Array}
   */
  listCommands() {
    return Array.from(this.commands.keys()).map(name => ({
      name,
      config: this.commands.get(name).config
    }));
  }

  /**
   * Verificar si un comando está registrado
   * @param {string} name - Nombre del comando
   * @returns {boolean}
   */
  hasCommand(name) {
    return this.commands.has(name);
  }

  /**
   * Eliminar un comando
   * @param {string} name - Nombre del comando
   * @returns {boolean}
   */
  unregister(name) {
    const deleted = this.commands.delete(name);
    if (deleted) {
      this.logger.info(`Command unregistered: ${name}`);
    }
    return deleted;
  }

  /**
   * Limpiar todos los comandos
   */
  clear() {
    const count = this.commands.size;
    this.commands.clear();
    this.logger.info(`Cleared ${count} commands`);
  }
}

// Instancia global del registry
export const commandRegistry = new CommandRegistry();

/**
 * Decorador para registrar comandos automáticamente
 * @param {string} name - Nombre del comando
 * @param {Object} config - Configuración del comando
 * @returns {Function}
 */
export function RegisterCommand(name, config) {
  return function(target, propertyKey, descriptor) {
    // Registrar el comando cuando se carga el módulo
    setTimeout(() => {
      commandRegistry.register(name, {
        ...config,
        customHandler: descriptor.value
      });
    }, 0);
    
    return descriptor;
  };
}

/**
 * Helper para crear comandos CRUD estándar de un servicio
 * @param {string} entityName - Nombre de la entidad
 * @param {Object} service - Servicio
 * @param {Object} validators - Validadores
 */
export function registerCRUDCommands(entityName, service, validators = {}) {
  const baseName = entityName.toLowerCase();
  
  // Comando para listar
  commandRegistry.register(`${baseName}.list`, {
    service,
    method: 'findAll',
    validator: validators.list,
    context: `${entityName}Controller`,
    type: 'query'
  });

  // Comando para obtener por ID
  commandRegistry.register(`${baseName}.getById`, {
    service,
    method: 'findById',
    validator: validators.getById,
    context: `${entityName}Controller`,
    type: 'query'
  });

  // Comando para crear
  commandRegistry.register(`${baseName}.create`, {
    service,
    method: 'create',
    validator: validators.create,
    context: `${entityName}Controller`,
    type: 'create'
  });

  // Comando para actualizar
  commandRegistry.register(`${baseName}.update`, {
    service,
    method: 'updateById',
    validator: validators.update,
    context: `${entityName}Controller`,
    type: 'crud'
  });

  // Comando para eliminar
  commandRegistry.register(`${baseName}.delete`, {
    service,
    method: 'deleteById',
    validator: validators.delete,
    context: `${entityName}Controller`,
    type: 'crud'
  });

  logger.info(`CRUD commands registered for ${entityName}`);
}

export default CommandRegistry;
