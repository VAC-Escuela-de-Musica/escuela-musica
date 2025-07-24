/**
 * Result Pattern para respuestas consistentes
 * Elimina inconsistencias entre [data, error] y {success, data, error}
 */
export class Result {
  constructor (success, data = null, error = null, statusCode = 200) {
    this.success = success
    this.data = data
    this.error = error
    this.statusCode = statusCode
  }

  /**
   * Crear resultado exitoso
   * @param {*} data - Datos del resultado
   * @param {number} statusCode - Código de estado HTTP
   * @returns {Result}
   */
  static success (data, statusCode = 200) {
    return new Result(true, data, null, statusCode)
  }

  /**
   * Crear resultado de error
   * @param {string} error - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP
   * @returns {Result}
   */
  static error (error, statusCode = 400) {
    return new Result(false, null, error, statusCode)
  }

  /**
   * Crear resultado de error interno
   * @param {string} error - Mensaje de error
   * @returns {Result}
   */
  static internalError (error) {
    return new Result(false, null, error, 500)
  }

  /**
   * Crear resultado no encontrado
   * @param {string} message - Mensaje personalizado
   * @returns {Result}
   */
  static notFound (message = 'Recurso no encontrado') {
    return new Result(false, null, message, 404)
  }

  /**
   * Crear resultado no autorizado
   * @param {string} message - Mensaje personalizado
   * @returns {Result}
   */
  static unauthorized (message = 'No autorizado') {
    return new Result(false, null, message, 401)
  }

  /**
   * Crear resultado prohibido
   * @param {string} message - Mensaje personalizado
   * @returns {Result}
   */
  static forbidden (message = 'Acceso denegado') {
    return new Result(false, null, message, 403)
  }

  /**
   * Verificar si el resultado es exitoso
   * @returns {boolean}
   */
  isSuccess () {
    return this.success
  }

  /**
   * Verificar si el resultado es de error
   * @returns {boolean}
   */
  isError () {
    return !this.success
  }

  /**
   * Obtener datos o lanzar error
   * @returns {*}
   * @throws {Error}
   */
  getValue () {
    if (this.isError()) {
      throw new Error(this.error)
    }
    return this.data
  }

  /**
   * Obtener datos o valor por defecto
   * @param {*} defaultValue - Valor por defecto
   * @returns {*}
   */
  getValueOrDefault (defaultValue) {
    return this.isSuccess() ? this.data : defaultValue
  }

  /**
   * Transformar datos si es exitoso
   * @param {Function} transformer - Función de transformación
   * @returns {Result}
   */
  map (transformer) {
    if (this.isError()) {
      return this
    }

    try {
      const transformedData = transformer(this.data)
      return Result.success(transformedData, this.statusCode)
    } catch (error) {
      return Result.error(error.message, 500)
    }
  }

  /**
   * Encadenar operaciones
   * @param {Function} operation - Operación que retorna Result
   * @returns {Result}
   */
  flatMap (operation) {
    if (this.isError()) {
      return this
    }

    try {
      return operation(this.data)
    } catch (error) {
      return Result.error(error.message, 500)
    }
  }

  /**
   * Convertir a JSON para respuestas HTTP
   * @returns {Object}
   */
  toJSON () {
    return {
      success: this.success,
      data: this.data,
      error: this.error,
      statusCode: this.statusCode
    }
  }
}

export default Result
