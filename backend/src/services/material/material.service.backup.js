"use strict";

import Material from "../../models/material.model.js";
import BaseService from "../base.service.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Servicio para manejo de materiales
 * Extiende BaseService para operaciones CRUD estándar
 */
class MaterialService extends BaseService {
  constructor() {
    super(Material);
  }

  /**
   * Busca materiales por múltiples filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findMaterials(filters = {}, options = {}) {
    try {
      const {
        categoria,
        subCategoria,
        tipoContenido,
        nivel,
        publico,
        autor,
        searchTerm,
        page = 1,
        limit = 10,
        sort = { createdAt: -1 }
      } = { ...filters, ...options };

      // Construir query de filtros
      const query = {};

      if (categoria) query.categoria = categoria;
      if (subCategoria) query.subCategoria = subCategoria;
      if (tipoContenido) query.tipoContenido = tipoContenido;
      if (nivel) query.nivel = nivel;
      if (publico !== undefined) query.publico = publico;
      if (autor) query.autor = autor;

      // Búsqueda por texto
      if (searchTerm) {
        query.$or = [
          { nombre: { $regex: searchTerm, $options: 'i' } },
          { descripcion: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ];
      }

      return await this.findAll(query, null, { page, limit, sort });
    } catch (error) {
      handleError(error, "MaterialService -> findMaterials");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene materiales por categoría
   * @param {string} categoria - Categoría del material
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByCategoria(categoria, options = {}) {
    try {
      return await this.findAll({ categoria }, null, options);
    } catch (error) {
      handleError(error, "MaterialService -> findByCategoria");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene materiales públicos
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findPublicMaterials(options = {}) {
    try {
      return await this.findAll({ publico: true }, null, options);
    } catch (error) {
      handleError(error, "MaterialService -> findPublicMaterials");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene materiales por autor
   * @param {string} autor - Email del autor
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByAutor(autor, options = {}) {
    try {
      return await this.findAll({ autor }, null, options);
    } catch (error) {
      handleError(error, "MaterialService -> findByAutor");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Incrementa el contador de descargas
   * @param {string} id - ID del material
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async incrementDownloadCount(id) {
    try {
      const material = await this.model.findByIdAndUpdate(
        id,
        { $inc: { descargas: 1 } },
        { new: true }
      );

      if (!material) {
        return {
          success: false,
          error: "Material no encontrado",
          data: null
        };
      }

      return {
        success: true,
        data: material,
        error: null
      };
    } catch (error) {
      handleError(error, "MaterialService -> incrementDownloadCount");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Actualiza el último acceso del material
   * @param {string} id - ID del material
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async updateLastAccess(id) {
    try {
      const material = await this.model.findByIdAndUpdate(
        id,
        { ultimoAcceso: new Date() },
        { new: true }
      );

      if (!material) {
        return {
          success: false,
          error: "Material no encontrado",
          data: null
        };
      }

      return {
        success: true,
        data: material,
        error: null
      };
    } catch (error) {
      handleError(error, "MaterialService -> updateLastAccess");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Exportar instancia del servicio usando named export
const materialService = new MaterialService();
export { materialService as MaterialService };
