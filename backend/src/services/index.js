/**
 * Archivo de inicialización de servicios
 * Inicializa buckets de MinIO y configura servicios al arrancar la aplicación
 */

import { minioService } from '../features/file-system/services/minio.service.js'

/**
 * Inicializa todos los servicios necesarios
 */
export async function initializeServices () {
  try {
    await minioService.initializeBuckets()

    const health = await minioService.healthCheck()
    if (health.status === 'healthy') {
      console.log('[SERVICES] MinIO initialized successfully')
    } else {
      console.warn('[SERVICES] MinIO not available:', health.error)
    }

    return true
  } catch (error) {
    console.error('[SERVICES] Error initializing services:', error)
    return false
  }
}

export { minioService } from '../features/file-system/services/minio.service.js'
export { fileService } from '../features/file-system/services/file.service.js'
export { auditService } from '../features/monitoring/services/audit.service.js'

// Servicios de autenticación y autorización (usando named exports)
export { AuthenticationService } from '../features/authentication/services/authentication.service.js'
export { AuthorizationService } from '../features/authentication/services/authorization.service.js'

// Servicios de usuario
export { userService } from '../features/user-management/services/user.service.js'

// Servicios de material
export { materialService } from '../features/content-management/services/material.service.js'
