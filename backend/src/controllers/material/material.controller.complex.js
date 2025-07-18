import { CommandRegistry } from '../../patterns/CommandRegistry.js';
import MaterialCommands from '../../commands/MaterialCommands.js';

/**
 * Controlador de materiales refactorizado usando Command Pattern
 * Elimina toda la duplicación de código y maneja respuestas de forma consistente
 */
class MaterialController {
  constructor() {
    this.registry = new CommandRegistry();
    this.initializeCommands();
  }

  /**
   * Inicializa todos los comandos de material
   */
  initializeCommands() {
    // Registrar comandos CRUD básicos
    this.registry.register('materials.list', new MaterialCommands.ListMaterialsCommand());
    this.registry.register('materials.create', new MaterialCommands.CreateMaterialCommand());
    this.registry.register('materials.upload', new MaterialCommands.UploadMaterialCommand());
    this.registry.register('materials.uploadMultiple', new MaterialCommands.UploadMultipleMaterialsCommand());
    this.registry.register('materials.getById', new MaterialCommands.GetMaterialByIdCommand());
    this.registry.register('materials.update', new MaterialCommands.UpdateMaterialCommand());
    this.registry.register('materials.delete', new MaterialCommands.DeleteMaterialCommand());
    
    // Registrar comandos específicos de material
    this.registry.register('materials.myMaterials', new MaterialCommands.GetMyMaterialsCommand());
    this.registry.register('materials.byCategory', new MaterialCommands.GetMaterialsByCategoryCommand());
    this.registry.register('materials.search', new MaterialCommands.SearchMaterialsCommand());
    this.registry.register('materials.categories', new MaterialCommands.GetCategoriesCommand());
    this.registry.register('materials.popularTags', new MaterialCommands.GetPopularTagsCommand());
    this.registry.register('materials.toggleFavorite', new MaterialCommands.ToggleFavoriteCommand());
    this.registry.register('materials.favorites', new MaterialCommands.GetFavoritesCommand());
    this.registry.register('materials.stats', new MaterialCommands.GetMaterialStatsCommand());
    this.registry.register('materials.recent', new MaterialCommands.GetRecentMaterialsCommand());
  }

  /**
   * Lista materiales con paginación
   */
  async listMaterials(req, res) {
    await this.registry.execute('materials.list', req, res);
  }

  /**
   * Crea un nuevo material
   */
  async createMaterial(req, res) {
    await this.registry.execute('materials.create', req, res);
  }

  /**
   * Sube un material con archivo
   */
  async uploadMaterial(req, res) {
    await this.registry.execute('materials.upload', req, res);
  }

  /**
   * Sube múltiples materiales
   */
  async uploadMultipleMaterials(req, res) {
    await this.registry.execute('materials.uploadMultiple', req, res);
  }

  /**
   * Obtiene un material por su id
   */
  async getMaterialById(req, res) {
    await this.registry.execute('materials.getById', req, res);
  }

  /**
   * Actualiza un material por su id
   */
  async updateMaterial(req, res) {
    await this.registry.execute('materials.update', req, res);
  }

  /**
   * Elimina un material por su id
   */
  async deleteMaterial(req, res) {
    await this.registry.execute('materials.delete', req, res);
  }

  /**
   * Obtiene materiales del usuario actual
   */
  async getMyMaterials(req, res) {
    await this.registry.execute('materials.myMaterials', req, res);
  }

  /**
   * Obtiene materiales por categoría
   */
  async getMaterialsByCategory(req, res) {
    await this.registry.execute('materials.byCategory', req, res);
  }

  /**
   * Busca materiales
   */
  async searchMaterials(req, res) {
    await this.registry.execute('materials.search', req, res);
  }

  /**
   * Obtiene categorías disponibles
   */
  async getCategories(req, res) {
    await this.registry.execute('materials.categories', req, res);
  }

  /**
   * Obtiene tags populares
   */
  async getPopularTags(req, res) {
    await this.registry.execute('materials.popularTags', req, res);
  }

  /**
   * Marca/desmarca material como favorito
   */
  async toggleFavorite(req, res) {
    await this.registry.execute('materials.toggleFavorite', req, res);
  }

  /**
   * Obtiene materiales favoritos del usuario
   */
  async getFavorites(req, res) {
    await this.registry.execute('materials.favorites', req, res);
  }

  /**
   * Obtiene estadísticas de materiales
   */
  async getMaterialStats(req, res) {
    await this.registry.execute('materials.stats', req, res);
  }

  /**
   * Obtiene materiales recientes
   */
  async getRecentMaterials(req, res) {
    await this.registry.execute('materials.recent', req, res);
  }

  // Métodos legacy para compatibilidad (pueden ser removidos gradualmente)
  async listMaterialsWithUrls(req, res) {
    await this.listMaterials(req, res);
  }
}

// Crear instancia singleton del controlador
const materialController = new MaterialController();

export default {
  listMaterials: materialController.listMaterials.bind(materialController),
  createMaterial: materialController.createMaterial.bind(materialController),
  uploadMaterial: materialController.uploadMaterial.bind(materialController),
  uploadMultipleMaterials: materialController.uploadMultipleMaterials.bind(materialController),
  getMaterialById: materialController.getMaterialById.bind(materialController),
  updateMaterial: materialController.updateMaterial.bind(materialController),
  deleteMaterial: materialController.deleteMaterial.bind(materialController),
  getMyMaterials: materialController.getMyMaterials.bind(materialController),
  getMaterialsByCategory: materialController.getMaterialsByCategory.bind(materialController),
  searchMaterials: materialController.searchMaterials.bind(materialController),
  getCategories: materialController.getCategories.bind(materialController),
  getPopularTags: materialController.getPopularTags.bind(materialController),
  toggleFavorite: materialController.toggleFavorite.bind(materialController),
  getFavorites: materialController.getFavorites.bind(materialController),
  getMaterialStats: materialController.getMaterialStats.bind(materialController),
  getRecentMaterials: materialController.getRecentMaterials.bind(materialController),
  
  // Métodos legacy
  listMaterialsWithUrls: materialController.listMaterialsWithUrls.bind(materialController)
};

// Exportar también métodos individuales para compatibilidad
export const listMaterials = materialController.listMaterials.bind(materialController);
export const createMaterial = materialController.createMaterial.bind(materialController);
export const uploadMaterial = materialController.uploadMaterial.bind(materialController);
export const uploadMultipleMaterials = materialController.uploadMultipleMaterials.bind(materialController);
export const getMaterialById = materialController.getMaterialById.bind(materialController);
export const updateMaterial = materialController.updateMaterial.bind(materialController);
export const deleteMaterial = materialController.deleteMaterial.bind(materialController);
export const getMyMaterials = materialController.getMyMaterials.bind(materialController);
export const getMaterialsByCategory = materialController.getMaterialsByCategory.bind(materialController);
export const searchMaterials = materialController.searchMaterials.bind(materialController);
export const getCategories = materialController.getCategories.bind(materialController);
export const getPopularTags = materialController.getPopularTags.bind(materialController);
export const toggleFavorite = materialController.toggleFavorite.bind(materialController);
export const getFavorites = materialController.getFavorites.bind(materialController);
export const getMaterialStats = materialController.getMaterialStats.bind(materialController);
export const getRecentMaterials = materialController.getRecentMaterials.bind(materialController);
export const listMaterialsWithUrls = materialController.listMaterialsWithUrls.bind(materialController);
