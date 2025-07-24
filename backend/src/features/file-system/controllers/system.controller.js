// Controlador para health checks y diagnósticos del sistema de archivos
import { minioService } from '../services/index.js'
import { asyncHandler } from '../../../middlewares/index.js'

/**
 * Health check del sistema de archivos
 */
export const healthCheck = asyncHandler(async (req, res) => {
  const minioHealth = await minioService.healthCheck()

  const health = {
    minio: minioHealth,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  }

  const statusCode = minioHealth.status === 'healthy' ? 200 : 503

  res.status(statusCode).json({
    success: minioHealth.status === 'healthy',
    data: health
  })
})

/**
 * Diagnóstico completo del sistema de archivos
 */
export const systemDiagnostics = asyncHandler(async (req, res) => {
  try {
    // Health check de MinIO
    const minioHealth = await minioService.healthCheck()

    // Información de buckets
    const bucketsInfo = await minioService.getBucketsInfo()

    // Estadísticas de almacenamiento (si está disponible)
    let storageStats = null
    try {
      storageStats = await minioService.getStorageStatistics()
    } catch (error) {
      console.warn('No se pudieron obtener estadísticas de almacenamiento:', error.message)
    }

    const diagnostics = {
      minio: minioHealth,
      buckets: bucketsInfo,
      storage: storageStats,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    }

    const statusCode = minioHealth.status === 'healthy' ? 200 : 503

    res.status(statusCode).json({
      success: minioHealth.status === 'healthy',
      data: diagnostics
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en diagnóstico del sistema',
      details: error.message
    })
  }
})
