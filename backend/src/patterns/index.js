/**
 * Exporta todos los patterns del sistema para facilitar el uso
 */
export { Result } from './Result.js';
export { CommandHandler, CommandHandlerFactory } from './CommandHandler.js';
export { CommandRegistry, RegisterCommand, registerCRUDCommands } from './CommandRegistry.js';
export { CommandValidator } from './CommandValidator.js';

export default {
  Result,
  CommandHandler,
  CommandHandlerFactory,
  CommandRegistry,
  RegisterCommand,
  registerCRUDCommands,
  CommandValidator
};
