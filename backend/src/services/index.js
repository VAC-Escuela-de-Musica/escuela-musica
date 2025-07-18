/**
 * Archivo de inicialización de servicios
 * Inicializa buckets de MinIO y configura servicios al arrancar la aplicación
 */

import { minioService } from './minio.service.js';

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

export { minioService } from './minio.service.js';
export { fileService } from './file.service.js';
export { auditService } from './audit.service.js';
