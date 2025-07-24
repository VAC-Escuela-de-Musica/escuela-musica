'use strict'

import { handleError } from '../core/utils/errorHandler.util.js'

/**
 * Clase base para servicios
 * Proporciona métodos comunes y estandariza las respuestas
 *
 * @description Esta clase base implementa el patrón Repository con respuestas estandarizadas.
 * Todos los servicios deben extender de esta clase para mantener consistencia.
 *
 * @example
 * ```javascript
 * class UserService extends BaseService {
 *   constructor() {
 *     super(User);
 *   }
 *
 *   async findByEmail(email) {
 *     return await this.findOne({ email });
 *   }
 * }
 * ```
 *
 * @author Sistema de Gestión - Escuela de Música
 * @version 2.0.0
 */
class BaseService {
  /**
   * Constructor de la clase base
   * @param {Object} model - Modelo de Mongoose a utilizar
   */
  constructor (model) {
    this.model = model
  }

  /**
   * Buscar un documento por ID
   * @param {string} id - ID del documento
   * @param {string} populate - Campos a popular
   * @returns {Object} Respuesta estandarizada
   */
  async findById (id, populate = null) {
    try {
      let query = this.model.findById(id)
      if (populate) {
        query = query.populate(populate)
      }

      const data = await query.exec()

      if (!data) {
        return {
          success: false,
          error: 'Documento no encontrado',
          data: null
        }
      }

      return {
        success: true,
        data,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.findById - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Buscar todos los documentos
   * @param {Object} filter - Filtros para la consulta
   * @param {string} populate - Campos a popular
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Object} Respuesta estandarizada
   */
  async findAll (filter = {}, populate = null, options = {}) {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
      const skip = (page - 1) * limit

      let query = this.model.find(filter)

      if (populate) {
        query = query.populate(populate)
      }

      const data = await query
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec()

      const total = await this.model.countDocuments(filter)

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.findAll - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Crear un nuevo documento
   * @param {Object} data - Datos del documento
   * @returns {Object} Respuesta estandarizada
   */
  async create (data) {
    try {
      const document = new this.model(data)
      const savedDocument = await document.save()

      return {
        success: true,
        data: savedDocument,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.create - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Actualizar un documento por ID
   * @param {string} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Object} Respuesta estandarizada
   */
  async updateById (id, data) {
    try {
      const updatedDocument = await this.model.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      )

      if (!updatedDocument) {
        return {
          success: false,
          error: 'Documento no encontrado',
          data: null
        }
      }

      return {
        success: true,
        data: updatedDocument,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.updateById - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Eliminar un documento por ID
   * @param {string} id - ID del documento
   * @returns {Object} Respuesta estandarizada
   */
  async deleteById (id) {
    try {
      const deletedDocument = await this.model.findByIdAndDelete(id)

      if (!deletedDocument) {
        return {
          success: false,
          error: 'Documento no encontrado',
          data: null
        }
      }

      return {
        success: true,
        data: deletedDocument,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.deleteById - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Buscar un documento por filtros
   * @param {Object} filter - Filtros para la consulta
   * @param {string} populate - Campos a popular
   * @returns {Object} Respuesta estandarizada
   */
  async findOne (filter, populate = null) {
    try {
      let query = this.model.findOne(filter)
      if (populate) {
        query = query.populate(populate)
      }

      const data = await query.exec()

      return {
        success: true,
        data,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.findOne - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Crear múltiples documentos
   * @param {Array} dataArray - Array de datos
   * @returns {Object} Respuesta estandarizada
   */
  async createMany (dataArray) {
    try {
      const documents = await this.model.insertMany(dataArray)
      return {
        success: true,
        data: documents,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.createMany - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Actualizar múltiples documentos
   * @param {Object} filter - Filtros para la consulta
   * @param {Object} update - Datos a actualizar
   * @returns {Object} Respuesta estandarizada
   */
  async updateMany (filter, update) {
    try {
      const result = await this.model.updateMany(filter, update)
      return {
        success: true,
        data: result,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.updateMany - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Eliminar múltiples documentos
   * @param {Object} filter - Filtros para la consulta
   * @returns {Object} Respuesta estandarizada
   */
  async deleteMany (filter) {
    try {
      const result = await this.model.deleteMany(filter)
      return {
        success: true,
        data: result,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.deleteMany - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Contar documentos
   * @param {Object} filter - Filtros para la consulta
   * @returns {Object} Respuesta estandarizada
   */
  async count (filter = {}) {
    try {
      const count = await this.model.countDocuments(filter)
      return {
        success: true,
        data: count,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.count - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Verificar si existe un documento
   * @param {Object} filter - Filtros para la consulta
   * @returns {Object} Respuesta estandarizada
   */
  async exists (filter) {
    try {
      const exists = await this.model.exists(filter)
      return {
        success: true,
        data: !!exists,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.exists - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Búsqueda con texto completo
   * @param {string} searchText - Texto a buscar
   * @param {Object} filter - Filtros adicionales
   * @param {Object} options - Opciones de paginación
   * @returns {Object} Respuesta estandarizada
   */
  async search (searchText, filter = {}, options = {}) {
    try {
      const { page = 1, limit = 10 } = options
      const skip = (page - 1) * limit

      const searchFilter = {
        ...filter,
        $text: { $search: searchText }
      }

      const data = await this.model
        .find(searchFilter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .exec()

      const total = await this.model.countDocuments(searchFilter)

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.search - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Agregaciones personalizadas
   * @param {Array} pipeline - Pipeline de agregación
   * @returns {Object} Respuesta estandarizada
   */
  async aggregate (pipeline) {
    try {
      const data = await this.model.aggregate(pipeline)
      return {
        success: true,
        data,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.aggregate - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Encontrar documentos distintos
   * @param {string} field - Campo para encontrar valores distintos
   * @param {Object} filter - Filtros para la consulta
   * @returns {Object} Respuesta estandarizada
   */
  async distinct (field, filter = {}) {
    try {
      const data = await this.model.distinct(field, filter)
      return {
        success: true,
        data,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.distinct - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Ejecutar operaciones en lotes
   * @param {Array} operations - Array de operaciones
   * @returns {Object} Respuesta estandarizada
   */
  async bulkWrite (operations) {
    try {
      const result = await this.model.bulkWrite(operations)
      return {
        success: true,
        data: result,
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.bulkWrite - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }

  /**
   * Obtener estadísticas del modelo
   * @returns {Object} Respuesta estandarizada
   */
  async getStats () {
    try {
      const total = await this.model.countDocuments()
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgCreated: { $avg: '$createdAt' }
          }
        }
      ])

      return {
        success: true,
        data: {
          total,
          stats: stats[0] || {}
        },
        error: null
      }
    } catch (error) {
      handleError(error, `BaseService.getStats - ${this.model.modelName}`)
      return {
        success: false,
        error: error.message,
        data: null
      }
    }
  }
}

export default BaseService
