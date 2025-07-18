"use strict";

import { respondError } from "../../utils/resHandler.js";
import { handleError } from "../../utils/errorHandler.js";

/**
 * Middleware global para manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const globalErrorHandler = (err, req, res, next) => {
  // Log del error
  handleError(err, req.originalUrl || 'unknown-route');

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return respondError(req, res, 400, "Error de validación", errors);
  }

  // Errores de cast de MongoDB (ID inválido)
  if (err.name === 'CastError') {
    return respondError(req, res, 400, "ID inválido", "El ID proporcionado no es válido");
  }

  // Errores de duplicación de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return respondError(req, res, 409, "Conflicto", `Ya existe un registro con ese ${field}`);
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return respondError(req, res, 401, "Token inválido", "El token proporcionado no es válido");
  }

  if (err.name === 'TokenExpiredError') {
    return respondError(req, res, 401, "Token expirado", "El token ha expirado");
  }

  // Errores de Multer (subida de archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return respondError(req, res, 400, "Archivo muy grande", "El archivo excede el tamaño máximo permitido");
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return respondError(req, res, 400, "Demasiados archivos", "Se ha excedido el número máximo de archivos");
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return respondError(req, res, 400, "Campo de archivo inesperado", "El campo de archivo no es esperado");
  }

  // Error por defecto
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message;
  
  return respondError(req, res, statusCode, "Error del servidor", message);
};

/**
 * Middleware para manejar rutas no encontradas (404)
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Middleware para capturar errores async/await sin try-catch
 * @param {Function} fn - Función async a ejecutar
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para logging de errores de acceso
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const accessErrorLogger = (err, req, res, next) => {
  if (err.statusCode === 401 || err.statusCode === 403) {
    console.log(`[${new Date().toISOString()}] Access Error: ${req.method} ${req.originalUrl} - User: ${req.user?.email || 'anonymous'} - IP: ${req.ip}`);
  }
  next(err);
};

export { 
  globalErrorHandler, 
  notFoundHandler, 
  asyncHandler, 
  accessErrorLogger 
};
