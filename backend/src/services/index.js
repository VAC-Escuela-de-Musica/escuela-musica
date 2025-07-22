/**
 * Archivo de inicialización de servicios
 * Inicializa buckets de MinIO y configura servicios al arrancar la aplicación
 */

import { minioService } from './storage/minio.service.js';

/**
 * Inicializa todos los servicios necesarios
 */
export async function initializeServices() {
  try {
    console.log('🚀 Inicializando servicios...');
    
    // Inicializar buckets de MinIO
    await minioService.initializeBuckets();
    
    // Verificar salud de MinIO
    const health = await minioService.healthCheck();
    if (health.status === 'healthy') {
      console.log('✅ MinIO está operativo');
    } else {
      console.warn('⚠️ MinIO no está disponible:', health.error);
    }
    
    console.log('✅ Servicios inicializados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando servicios:', error);
    return false;
  }
}

export { minioService } from './storage/minio.service.js';
export { fileService } from './storage/file.service.js';
export { auditService } from './monitoring/audit.service.js';

// Servicios de autenticación y autorización (usando named exports)
export { AuthenticationService } from './auth/authentication.service.js';
export { AuthorizationService } from './auth/authorization.service.js';

// Servicios de usuario  
export { userService } from './user/user.service.js';

// Servicios de material
export { materialService } from './material/material.service.js';
