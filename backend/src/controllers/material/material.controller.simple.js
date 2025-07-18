import { materialService } from '../../services/material/material.service.js';
import { respondSuccess, respondError } from "../../utils/responseHandler.util.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Controlador de materiales simplificado usando Repository Pattern
 * Elimina la complejidad del Command Pattern para mejor debugging
 */
class MaterialController {
  constructor() {
    this.materialService = materialService;
  }

  /**
   * Lista todos los materiales
   */
  async listMaterials(req, res) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
      const userId = req.user?.id;
      
      const result = await this.materialService.getMaterialsWithPagination({
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        order,
        userId
      });
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> listMaterials");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Crea un nuevo material
   */
  async createMaterial(req, res) {
    try {
      const materialData = req.body;
      const userId = req.user?.id;
      
      const result = await this.materialService.createMaterial({
        ...materialData,
        userId
      });
      
      if (result.success) {
        return respondSuccess(req, res, 201, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> createMaterial");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Sube un material
   */
  async uploadMaterial(req, res) {
    try {
      const uploadData = req.body;
      const userId = req.user?.id;
      
      const result = await this.materialService.uploadMaterial({
        ...uploadData,
        userId
      });
      
      if (result.success) {
        return respondSuccess(req, res, 201, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> uploadMaterial");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene un material por ID
   */
  async getMaterialById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const result = await this.materialService.getMaterialById(id, userId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 404, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> getMaterialById");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Actualiza un material
   */
  async updateMaterial(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;
      
      const result = await this.materialService.updateMaterial(id, updateData, userId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> updateMaterial");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Elimina un material
   */
  async deleteMaterial(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const result = await this.materialService.deleteMaterial(id, userId);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 404, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> deleteMaterial");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Obtiene materiales del usuario actual
   */
  async getMyMaterials(req, res) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await this.materialService.getMaterialsByUser(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, result.statusCode || 400, result.error);
      }
    } catch (error) {
      handleError(error, "MaterialController -> getMyMaterials");
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  /**
   * Método legacy para compatibilidad
   */
  async listMaterialsWithUrls(req, res) {
    return this.listMaterials(req, res);
  }
}

// Crear instancia singleton del controlador
const materialController = new MaterialController();

export default {
  listMaterials: materialController.listMaterials.bind(materialController),
  createMaterial: materialController.createMaterial.bind(materialController),
  uploadMaterial: materialController.uploadMaterial.bind(materialController),
  getMaterialById: materialController.getMaterialById.bind(materialController),
  updateMaterial: materialController.updateMaterial.bind(materialController),
  deleteMaterial: materialController.deleteMaterial.bind(materialController),
  getMyMaterials: materialController.getMyMaterials.bind(materialController),
  
  // Métodos legacy para compatibilidad
  listMaterialsWithUrls: materialController.listMaterialsWithUrls.bind(materialController),
  
  // Métodos adicionales que pueden ser necesarios
  uploadMultipleMaterials: materialController.uploadMaterial.bind(materialController),
  getMaterialsByCategory: materialController.listMaterials.bind(materialController),
  searchMaterials: materialController.listMaterials.bind(materialController),
  getCategories: materialController.listMaterials.bind(materialController),
  getPopularTags: materialController.listMaterials.bind(materialController),
  toggleFavorite: materialController.updateMaterial.bind(materialController),
  getFavorites: materialController.getMyMaterials.bind(materialController),
  getMaterialStats: materialController.listMaterials.bind(materialController),
  getRecentMaterials: materialController.listMaterials.bind(materialController)
};

export const listMaterials = materialController.listMaterials.bind(materialController);
export const createMaterial = materialController.createMaterial.bind(materialController);
export const uploadMaterial = materialController.uploadMaterial.bind(materialController);
export const getMaterialById = materialController.getMaterialById.bind(materialController);
export const updateMaterial = materialController.updateMaterial.bind(materialController);
export const deleteMaterial = materialController.deleteMaterial.bind(materialController);
export const getMyMaterials = materialController.getMyMaterials.bind(materialController);
export const listMaterialsWithUrls = materialController.listMaterialsWithUrls.bind(materialController);
