import { Result } from '../../patterns/Result.js'

/**
 * Interfaz base para todos los repositorios
 * Implementa el patrón Repository para abstraer la lógica de acceso a datos
 */
export class BaseRepository {
  constructor (model) {
    this.model = model
  }

  /**
   * Crear un nuevo documento
   * @param {Object} data - Datos del documento
   * @returns {Promise<Result>}
   */
  async create (data) {
    try {
      const document = new this.model(data)
      const saved = await document.save()
      return Result.success(saved)
    } catch (error) {
      return Result.error(`Error creating document: ${error.message}`, 400)
    }
  }

  /**
   * Obtener documento por ID
   * @param {string} id - ID del documento
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findById (id, options = {}) {
    try {
      let query = this.model.findById(id)

      if (options.populate) {
        query = query.populate(options.populate)
      }

      if (options.select) {
        query = query.select(options.select)
      }

      const document = await query

      if (!document) {
        return Result.notFound('Document not found')
      }

      return Result.success(document)
    } catch (error) {
      return Result.error(`Error finding document: ${error.message}`, 400)
    }
  }

  /**
   * Obtener todos los documentos con filtros
   * @param {Object} filter - Filtros de consulta
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findMany (filter = {}, options = {}) {
    try {
      let query = this.model.find(filter)

      if (options.populate) {
        query = query.populate(options.populate)
      }

      if (options.select) {
        query = query.select(options.select)
      }

      if (options.sort) {
        query = query.sort(options.sort)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.skip) {
        query = query.skip(options.skip)
      }

      const documents = await query
      return Result.success(documents)
    } catch (error) {
      return Result.error(`Error finding documents: ${error.message}`, 400)
    }
  }

  /**
   * Obtener un documento con filtros
   * @param {Object} filter - Filtros de consulta
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Result>}
   */
  async findOne (filter, options = {}) {
    try {
      let query = this.model.findOne(filter)

      if (options.populate) {
        query = query.populate(options.populate)
      }

      if (options.select) {
        query = query.select(options.select)
      }

      const document = await query

      if (!document) {
        return Result.notFound('Document not found')
      }

      return Result.success(document)
    } catch (error) {
      return Result.error(`Error finding document: ${error.message}`, 400)
    }
  }

  /**
   * Actualizar documento por ID
   * @param {string} id - ID del documento
   * @param {Object} update - Datos a actualizar
   * @param {Object} options - Opciones de actualización
   * @returns {Promise<Result>}
   */
  async updateById (id, update, options = {}) {
    try {
      const defaultOptions = { new: true, runValidators: true }
      const mergedOptions = { ...defaultOptions, ...options }

      let query = this.model.findByIdAndUpdate(id, update, mergedOptions)

      if (options.populate) {
        query = query.populate(options.populate)
      }

      const document = await query

      if (!document) {
        return Result.notFound('Document not found')
      }

      return Result.success(document)
    } catch (error) {
      return Result.error(`Error updating document: ${error.message}`, 400)
    }
  }

  /**
   * Actualizar múltiples documentos
   * @param {Object} filter - Filtros de consulta
   * @param {Object} update - Datos a actualizar
   * @param {Object} options - Opciones de actualización
   * @returns {Promise<Result>}
   */
  async updateMany (filter, update, options = {}) {
    try {
      const result = await this.model.updateMany(filter, update, options)
      return Result.success(result)
    } catch (error) {
      return Result.error(`Error updating documents: ${error.message}`, 400)
    }
  }

  /**
   * Eliminar documento por ID
   * @param {string} id - ID del documento
   * @returns {Promise<Result>}
   */
  async deleteById (id) {
    try {
      const document = await this.model.findByIdAndDelete(id)

      if (!document) {
        return Result.notFound('Document not found')
      }

      return Result.success(document)
    } catch (error) {
      return Result.error(`Error deleting document: ${error.message}`, 400)
    }
  }

  /**
   * Eliminar múltiples documentos
   * @param {Object} filter - Filtros de consulta
   * @returns {Promise<Result>}
   */
  async deleteMany (filter) {
    try {
      const result = await this.model.deleteMany(filter)
      return Result.success(result)
    } catch (error) {
      return Result.error(`Error deleting documents: ${error.message}`, 400)
    }
  }

  /**
   * Contar documentos
   * @param {Object} filter - Filtros de consulta
   * @returns {Promise<Result>}
   */
  async count (filter = {}) {
    try {
      const count = await this.model.countDocuments(filter)
      return Result.success(count)
    } catch (error) {
      return Result.error(`Error counting documents: ${error.message}`, 400)
    }
  }

  /**
   * Verificar si existe documento
   * @param {Object} filter - Filtros de consulta
   * @returns {Promise<Result>}
   */
  async exists (filter) {
    try {
      const exists = await this.model.exists(filter)
      return Result.success(!!exists)
    } catch (error) {
      return Result.error(`Error checking existence: ${error.message}`, 400)
    }
  }

  /**
   * Obtener documentos con paginación
   * @param {Object} filter - Filtros de consulta
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Result>}
   */
  async paginate (filter = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = null,
        select = null
      } = options

      const skip = (page - 1) * limit

      // Obtener documentos
      let query = this.model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)

      if (populate) {
        query = query.populate(populate)
      }

      if (select) {
        query = query.select(select)
      }

      const [documents, totalCount] = await Promise.all([
        query.exec(),
        this.model.countDocuments(filter)
      ])

      const totalPages = Math.ceil(totalCount / limit)

      return Result.success({
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      })
    } catch (error) {
      return Result.error(`Error paginating: ${error.message}`, 400)
    }
  }

  /**
   * Buscar documentos con texto completo
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Result>}
   */
  async search (searchTerm, options = {}) {
    try {
      const {
        fields = [],
        filter = {},
        page = 1,
        limit = 10,
        sort = { score: { $meta: 'textScore' } }
      } = options

      let query = {}

      if (searchTerm) {
        if (fields.length > 0) {
          // Búsqueda en campos específicos
          query.$or = fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
          }))
        } else {
          // Búsqueda de texto completo
          query.$text = { $search: searchTerm }
        }
      }

      // Combinar con filtros adicionales
      query = { ...query, ...filter }

      const skip = (page - 1) * limit

      const [documents, totalCount] = await Promise.all([
        this.model.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        this.model.countDocuments(query)
      ])

      const totalPages = Math.ceil(totalCount / limit)

      return Result.success({
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      })
    } catch (error) {
      return Result.error(`Error searching: ${error.message}`, 400)
    }
  }

  /**
   * Operaciones de agregación
   * @param {Array} pipeline - Pipeline de agregación
   * @returns {Promise<Result>}
   */
  async aggregate (pipeline) {
    try {
      const result = await this.model.aggregate(pipeline)
      return Result.success(result)
    } catch (error) {
      return Result.error(`Error in aggregation: ${error.message}`, 400)
    }
  }
}

export default BaseRepository
