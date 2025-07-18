import { CommandHandler } from '../patterns/CommandHandler.js';
import { CommandValidator } from '../patterns/CommandValidator.js';
import { Result } from '../patterns/Result.js';
import { materialService } from '../services/material/material.service.js';
import Joi from 'joi';

/**
 * Esquemas de validación para comandos de material
 */
const materialSchemas = {
  create: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(500),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublic: Joi.boolean().optional().default(true),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    instrument: Joi.string().optional()
  }),
  
  update: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    description: Joi.string().min(10).max(500).optional(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublic: Joi.boolean().optional(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    instrument: Joi.string().optional()
  }),
  
  query: Joi.object({
    title: Joi.string().optional(),
    category: Joi.string().optional(),
    tags: Joi.string().optional(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    instrument: Joi.string().optional(),
    isPublic: Joi.boolean().optional(),
    userId: Joi.string().optional()
  }),

  upload: Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(500),
    category: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).optional(),
    isPublic: Joi.boolean().optional().default(true),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
    instrument: Joi.string().optional()
  })
};

/**
 * Opciones para validación de archivos
 */
const fileOptions = {
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  maxSize: 50 * 1024 * 1024, // 50MB
  required: true
};

/**
 * Comando para crear material
 */
export class CreateMaterialCommand extends CommandHandler {
  constructor() {
    super(
      'CreateMaterial',
      CommandValidator.createAuthValidator({ body: materialSchemas.create }),
      async (data, req) => {
        const materialData = { ...data.body, userId: req.user.id };
        return await materialService.createMaterial(materialData);
      }
    );
  }
}

/**
 * Comando para subir material con archivo
 */
export class UploadMaterialCommand extends CommandHandler {
  constructor() {
    super(
      'UploadMaterial',
      CommandValidator.combineValidators([
        CommandValidator.createAuthValidator({ body: materialSchemas.upload }),
        CommandValidator.createFileValidator({}, fileOptions)
      ]),
      async (data, req) => {
        const materialData = { ...data.body, userId: req.user.id };
        const file = req.file;
        return await materialService.uploadMaterial(materialData, file);
      }
    );
  }
}

/**
 * Comando para subir múltiples materiales
 */
export class UploadMultipleMaterialsCommand extends CommandHandler {
  constructor() {
    super(
      'UploadMultipleMaterials',
      CommandValidator.combineValidators([
        CommandValidator.createAuthValidator({}),
        CommandValidator.createFileValidator({}, { ...fileOptions, required: false })
      ]),
      async (data, req) => {
        const files = req.files || [];
        const metadata = JSON.parse(req.body.metadata || '{}');
        return await materialService.uploadMultipleMaterials(files, metadata, req.user.id);
      }
    );
  }
}

/**
 * Comando para obtener material por ID
 */
export class GetMaterialByIdCommand extends CommandHandler {
  constructor() {
    super(
      'GetMaterialById',
      CommandValidator.createCRUDValidator(),
      async (data, req) => {
        const { id } = data.params;
        const userId = req.user?.id;
        return await materialService.getMaterialById(id, userId);
      }
    );
  }
}

/**
 * Comando para actualizar material
 */
export class UpdateMaterialCommand extends CommandHandler {
  constructor() {
    super(
      'UpdateMaterial',
      CommandValidator.createAuthValidator({
        params: Joi.object({ id: Joi.string().required() }),
        body: materialSchemas.update
      }),
      async (data, req) => {
        const { id } = data.params;
        const updateData = data.body;
        const userId = req.user.id;
        return await materialService.updateMaterial(id, updateData, userId);
      }
    );
  }
}

/**
 * Comando para eliminar material
 */
export class DeleteMaterialCommand extends CommandHandler {
  constructor() {
    super(
      'DeleteMaterial',
      CommandValidator.createAuthValidator({
        params: Joi.object({ id: Joi.string().required() })
      }),
      async (data, req) => {
        const { id } = data.params;
        const userId = req.user.id;
        return await materialService.deleteMaterial(id, userId);
      }
    );
  }
}

/**
 * Comando para listar materiales con paginación
 */
export class ListMaterialsCommand extends CommandHandler {
  constructor() {
    super(
      'ListMaterials',
      CommandValidator.createQueryValidator(materialSchemas.query),
      async (data, req) => {
        const { page, limit, sort, order, ...filters } = data.query;
        const userId = req.user?.id;
        return await MaterialService.getMaterialsWithPagination({ 
          page, 
          limit, 
          sort, 
          order, 
          filters,
          userId
        });
      }
    );
  }
}

/**
 * Comando para obtener materiales del usuario actual
 */
export class GetMyMaterialsCommand extends CommandHandler {
  constructor() {
    super(
      'GetMyMaterials',
      CommandValidator.createAuthValidator({}),
      async (data, req) => {
        const userId = req.user.id;
        const { page, limit, sort, order } = data.query;
        return await MaterialService.getUserMaterials(userId, { page, limit, sort, order });
      }
    );
  }
}

/**
 * Comando para obtener materiales por categoría
 */
export class GetMaterialsByCategoryCommand extends CommandHandler {
  constructor() {
    super(
      'GetMaterialsByCategory',
      CommandValidator.createValidator({
        params: Joi.object({
          category: Joi.string().required()
        })
      }),
      async (data, req) => {
        const { category } = data.params;
        const userId = req.user?.id;
        return await MaterialService.getMaterialsByCategory(category, userId);
      }
    );
  }
}

/**
 * Comando para buscar materiales
 */
export class SearchMaterialsCommand extends CommandHandler {
  constructor() {
    super(
      'SearchMaterials',
      CommandValidator.createQueryValidator(
        Joi.object({
          q: Joi.string().required().min(2),
          category: Joi.string().optional(),
          tags: Joi.string().optional(),
          level: Joi.string().valid('beginner', 'intermediate', 'advanced').optional(),
          instrument: Joi.string().optional()
        })
      ),
      async (data, req) => {
        const { q, page, limit, sort, order, ...filters } = data.query;
        const userId = req.user?.id;
        return await MaterialService.searchMaterials(q, { 
          page, 
          limit, 
          sort, 
          order, 
          filters,
          userId
        });
      }
    );
  }
}

/**
 * Comando para obtener categorías disponibles
 */
export class GetCategoriesCommand extends CommandHandler {
  constructor() {
    super(
      'GetCategories',
      CommandValidator.createValidator({}),
      async () => {
        return await MaterialService.getCategories();
      }
    );
  }
}

/**
 * Comando para obtener tags populares
 */
export class GetPopularTagsCommand extends CommandHandler {
  constructor() {
    super(
      'GetPopularTags',
      CommandValidator.createValidator({}),
      async () => {
        return await MaterialService.getPopularTags();
      }
    );
  }
}

/**
 * Comando para marcar material como favorito
 */
export class ToggleFavoriteCommand extends CommandHandler {
  constructor() {
    super(
      'ToggleFavorite',
      CommandValidator.createAuthValidator({
        params: Joi.object({ id: Joi.string().required() })
      }),
      async (data, req) => {
        const { id } = data.params;
        const userId = req.user.id;
        return await MaterialService.toggleFavorite(id, userId);
      }
    );
  }
}

/**
 * Comando para obtener materiales favoritos del usuario
 */
export class GetFavoritesCommand extends CommandHandler {
  constructor() {
    super(
      'GetFavorites',
      CommandValidator.createAuthValidator({}),
      async (data, req) => {
        const userId = req.user.id;
        const { page, limit, sort, order } = data.query;
        return await MaterialService.getFavorites(userId, { page, limit, sort, order });
      }
    );
  }
}

/**
 * Comando para obtener estadísticas de materiales
 */
export class GetMaterialStatsCommand extends CommandHandler {
  constructor() {
    super(
      'GetMaterialStats',
      CommandValidator.createAuthValidator({}, ['admin']),
      async () => {
        return await MaterialService.getMaterialStats();
      }
    );
  }
}

/**
 * Comando para obtener materiales recientes
 */
export class GetRecentMaterialsCommand extends CommandHandler {
  constructor() {
    super(
      'GetRecentMaterials',
      CommandValidator.createValidator({
        query: Joi.object({
          limit: Joi.number().min(1).max(50).optional().default(10)
        })
      }),
      async (data, req) => {
        const { limit } = data.query;
        const userId = req.user?.id;
        return await MaterialService.getRecentMaterials(limit, userId);
      }
    );
  }
}

export default {
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
};
