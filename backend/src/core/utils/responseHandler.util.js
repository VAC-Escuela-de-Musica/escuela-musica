'use strict'
/**
 * Envía una respuesta exitosa estandarizada.
 * @function respondSuccess
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Number} statusCode - Código de estado para la operación
 * @param {Object} data - Objeto que contiene los datos a enviar
 * @param {String} message - Mensaje opcional de éxito
 * @returns {JSON} - Objeto de respuesta JSON estandarizado
 */
function respondSuccess (req, res, statusCode = 200, data = {}, message = null) {
  const response = {
    success: true,
    statusCode,
    data,
    error: null,
    timestamp: new Date().toISOString()
  }

  if (message) {
    response.message = message
  }

  return res.status(statusCode).json(response)
}

/**
 * Envía una respuesta de error estandarizada.
 * @function respondError
 * @param {Object} req - El objeto de petición
 * @param {Object} res - El objeto de respuesta
 * @param {Number} statusCode - Código de estado para la operación
 * @param {String} message - La descripción del motivo del error
 * @param {Object} details - Información adicional sobre el error
 * @returns {JSON} - El objeto de respuesta JSON estandarizado
 */
function respondError (
  req,
  res,
  statusCode = 500,
  message = 'No se pudo procesar la petición',
  details = {}
) {
  const response = {
    success: false,
    statusCode,
    data: null,
    error: message,
    details,
    timestamp: new Date().toISOString()
  }

  return res.status(statusCode).json(response)
}

/**
 * Envía una respuesta de error interno estandarizada.
 * @function respondInternalError
 * @param {Object} req - El objeto de petición
 * @param {Object} res - El objeto de respuesta
 * @param {Number} statusCode - El código de estado para la operación
 * @param {String} message - La descripción del motivo del error
 * @returns {JSON} - El objeto de respuesta JSON estandarizado
 */
function respondInternalError (
  req,
  res,
  statusCode = 500,
  message = 'Error interno del servidor'
) {
  const response = {
    success: false,
    statusCode,
    data: null,
    error: message,
    details: {},
    timestamp: new Date().toISOString()
  }

  return res.status(statusCode).json(response)
}

export { respondSuccess, respondError, respondInternalError }
