/**
 * Exporta todos los repositories del sistema
 */
import { BaseRepository } from './BaseRepository.js';
import { UserRepository, userRepository } from './UserRepository.js';
import { MaterialRepository, materialRepository } from './MaterialRepository.js';

export { BaseRepository };
export { UserRepository, userRepository };
export { MaterialRepository, materialRepository };

export default {
  BaseRepository,
  UserRepository,
  MaterialRepository,
  userRepository,
  materialRepository
};
