import { BaseRepository } from './BaseRepository.js';
import { Result } from '../patterns/Result.js';
import Material from '../models/material.model.js';

/**
 * Repository específico para materiales
 * Refactorizado para coincidir exactamente con el schema del modelo Material
 */
export class MaterialRepository extends BaseRepository {
  constructor() {
    super(Material);
  }

  /**
   * Buscar materiales por usuario (usando email)
   * @param {string} userEmail - Email del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findByUser(userEmail, options = {}) {
    try {
      const filter = { usuario: userEmail };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding materials by user: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales públicos
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findPublicMaterials(options = {}) {
    try {
      const filter = { bucketTipo: 'publico' };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding public materials: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales privados del usuario
   * @param {string} userEmail - Email del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findPrivateMaterials(userEmail, options = {}) {
    try {
      const filter = { 
        bucketTipo: 'privado',
        usuario: userEmail 
      };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding private materials: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales con texto en nombre o descripción
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Result>}
   */
  async searchByText(searchTerm, options = {}) {
    try {
      const filter = {
        $or: [
          { nombre: { $regex: searchTerm, $options: 'i' } },
          { descripcion: { $regex: searchTerm, $options: 'i' } }
        ]
      };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error in text search: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales por tipo de contenido
   * @param {string} contentType - Tipo MIME del contenido
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findByContentType(contentType, options = {}) {
    try {
      const filter = { tipoContenido: contentType };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding materials by content type: ${error.message}`, 400);
    }
  }

  /**
   * Obtener materiales recientes
   * @param {number} limit - Límite de materiales
   * @param {string} userEmail - Email del usuario (opcional)
   * @returns {Promise<Result>}
   */
  async getRecentMaterials(limit = 10, userEmail = null) {
    try {
      let filter = {};

      if (userEmail) {
        filter = {
          $or: [
            { bucketTipo: 'publico' },
            { usuario: userEmail }
          ]
        };
      } else {
        filter = { bucketTipo: 'publico' };
      }

      const options = {
        limit,
        sort: { fechaSubida: -1 }
      };

      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error getting recent materials: ${error.message}`, 400);
    }
  }

  /**
   * Obtener estadísticas básicas de materiales
   * @returns {Promise<Result>}
   */
  async getBasicStats() {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            totalMaterials: { $sum: 1 },
            publicMaterials: { 
              $sum: { $cond: [{ $eq: ['$bucketTipo', 'publico'] }, 1, 0] } 
            },
            privateMaterials: { 
              $sum: { $cond: [{ $eq: ['$bucketTipo', 'privado'] }, 1, 0] } 
            },
            avgSize: { $avg: '$tamaño' },
            totalSize: { $sum: '$tamaño' }
          }
        },
        {
          $project: {
            _id: 0,
            totalMaterials: 1,
            publicMaterials: 1,
            privateMaterials: 1,
            avgSize: { $round: ['$avgSize', 2] },
            totalSize: 1
          }
        }
      ];

      const [stats] = await this.model.aggregate(pipeline);
      
      // Estadísticas por tipo de contenido
      const contentTypeStats = await this.model.aggregate([
        {
          $group: {
            _id: '$tipoContenido',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return Result.success({
        ...stats,
        materialsByContentType: contentTypeStats
      });
    } catch (error) {
      return Result.error(`Error getting material stats: ${error.message}`, 400);
    }
  }

  /**
   * Verificar si el usuario puede acceder al material
   * @param {string} materialId - ID del material
   * @param {string} userEmail - Email del usuario
   * @returns {Promise<Result>}
   */
  async canUserAccess(materialId, userEmail) {
    try {
      const material = await this.model.findById(materialId);
      
      if (!material) {
        return Result.notFound('Material not found');
      }

      const canAccess = material.bucketTipo === 'publico' || material.usuario === userEmail;
      
      return Result.success({
        canAccess,
        material: canAccess ? material : null
      });
    } catch (error) {
      return Result.error(`Error checking access: ${error.message}`, 400);
    }
  }

  /**
   * Obtener materiales accesibles para el usuario
   * @param {string} userEmail - Email del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findAccessibleMaterials(userEmail, options = {}) {
    try {
      console.log('🔍 findAccessibleMaterials called with:', { userEmail, options });
      
      // Filtro para materiales accesibles: públicos o del usuario
      const filter = {
        $or: [
          { bucketTipo: 'publico' },
          { usuario: userEmail }
        ]
      };
      
      console.log('🔍 Using filter:', filter);
      
      const result = await this.paginate(filter, options);
      console.log('📊 findAccessibleMaterials result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Error in findAccessibleMaterials:', error);
      return Result.error(`Error finding accessible materials: ${error.message}`, 400);
    }
  }

  /**
   * Registrar acceso a un material
   * @param {string} materialId - ID del material
   * @param {string} userEmail - Email del usuario
   * @param {string} ip - IP del usuario
   * @returns {Promise<Result>}
   */
  async registerAccess(materialId, userEmail, ip) {
    try {
      const material = await this.model.findById(materialId);
      
      if (!material) {
        return Result.notFound('Material not found');
      }

      const accessEntry = {
        usuario: userEmail,
        fecha: new Date(),
        ip: ip
      };

      const updatedMaterial = await this.model.findByIdAndUpdate(
        materialId,
        { $push: { accesos: accessEntry } },
        { new: true }
      );

      return Result.success(updatedMaterial);
    } catch (error) {
      return Result.error(`Error registering access: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales por rango de fechas
   * @param {Date} startDate - Fecha inicial
   * @param {Date} endDate - Fecha final
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const filter = {
        fechaSubida: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding materials by date range: ${error.message}`, 400);
    }
  }

  /**
   * Buscar materiales por tamaño
   * @param {number} minSize - Tamaño mínimo en bytes
   * @param {number} maxSize - Tamaño máximo en bytes
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findBySize(minSize, maxSize, options = {}) {
    try {
      const filter = {
        tamaño: {
          $gte: minSize,
          $lte: maxSize
        }
      };
      return await this.paginate(filter, options);
    } catch (error) {
      return Result.error(`Error finding materials by size: ${error.message}`, 400);
    }
  }
}

// Crear instancia singleton
export const materialRepository = new MaterialRepository();
export default materialRepository;
