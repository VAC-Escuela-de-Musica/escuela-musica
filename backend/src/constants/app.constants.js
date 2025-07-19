"use strict";

/**
 * Constantes de la aplicación
 */

// Constantes de HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Constantes de validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  RUT_REGEX: /^[0-9]+-[0-9kK]{1}$/,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
};

// Constantes de rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 2000, // Aumentado para desarrollo
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  AUTH_MAX_REQUESTS: 100 // Aumentado para desarrollo - era 5
};

// Constantes de JWT
export const JWT = {
  ACCESS_EXPIRES_IN: '1d',
  REFRESH_EXPIRES_IN: '7d'
};

// Constantes de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Constantes de logging
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Constantes de archivos
export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
  VIDEO: 'video'
};

// Constantes de buckets MinIO
export const MINIO_BUCKETS = {
  PRIVATE: 'materiales',
  PUBLIC: 'imagenes-publicas',
  TEMP: 'temp-uploads'
};
