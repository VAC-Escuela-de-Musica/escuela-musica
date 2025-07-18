/**
 * Exporta todos los comandos del sistema para facilitar el uso
 */
export { default as UserCommands } from './UserCommands.js';
export { default as MaterialCommands } from './MaterialCommands.js';

// Exportar clases individuales para flexibilidad
export {
  CreateUserCommand,
  GetUserByIdCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ListUsersCommand,
  GetUserProfileCommand,
  UpdateUserProfileCommand,
  ChangePasswordCommand,
  GetUsersByRoleCommand,
  ToggleUserStatusCommand,
  AssignRolesCommand,
  GetUserStatsCommand
} from './UserCommands.js';

export {
  CreateMaterialCommand,
  UploadMaterialCommand,
  UploadMultipleMaterialsCommand,
  GetMaterialByIdCommand,
  UpdateMaterialCommand,
  DeleteMaterialCommand,
  ListMaterialsCommand,
  GetMyMaterialsCommand,
  GetMaterialsByCategoryCommand,
  SearchMaterialsCommand,
  GetCategoriesCommand,
  GetPopularTagsCommand,
  ToggleFavoriteCommand,
  GetFavoritesCommand,
  GetMaterialStatsCommand,
  GetRecentMaterialsCommand
} from './MaterialCommands.js';

export default {
  UserCommands,
  MaterialCommands
};
