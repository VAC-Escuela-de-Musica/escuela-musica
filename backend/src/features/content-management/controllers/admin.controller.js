// Controlador de administración de materiales
import { respondError, respondSuccess } from '../../../core/utils/responseHandler.util.js'
import { asyncHandler } from '../../../middlewares/index.js'
import { minioService } from '../../../services/index.js'

/**
 * Función para inicializar buckets en MinIO
 */
export const initializeBucket = asyncHandler(async (req, res) => {
  try {
    await minioService.initializeBuckets()
    respondSuccess(req, res, 200, {
      message: 'Buckets inicializados correctamente',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Error inicializando buckets:', error)
    respondError(req, res, 500, `Error inicializando buckets: ${error.message}`)
  }
})

/**
 * Ruta de prueba para verificar conexión a MinIO
 */
export const testMinioConnection = asyncHandler(async (req, res) => {
  const healthStatus = await minioService.healthCheck()

  if (healthStatus.status === 'healthy') {
    return respondSuccess(req, res, 200, {
      minioConnection: 'OK',
      health: healthStatus,
      message: 'MinIO está operativo'
    })
  } else {
    return respondError(req, res, 503, `MinIO no disponible: ${healthStatus.error}`)
  }
})

/**
 * Obtener estadísticas del sistema de almacenamiento
 */
export const getStorageStats = asyncHandler(async (req, res) => {
  try {
    const stats = await minioService.getStorageStatistics()
    respondSuccess(req, res, 200, {
      storage: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    respondError(req, res, 500, `Error obteniendo estadísticas: ${error.message}`)
  }
})

// Cache en memoria para URLs prefirmadas (en producción usar Redis)
const urlCache = new Map()

/**
 * Limpia cache de URLs expiradas (ejecutar periódicamente)
 */
export function cleanExpiredCache () {
  const now = Date.now()
  for (const [key, value] of urlCache.entries()) {
    if (value.expiresAt <= now) {
      urlCache.delete(key)
    }
  }
}

/**
 * Endpoint para limpiar cache manualmente
 */
export const clearCache = asyncHandler(async (req, res) => {
  const sizeBefore = urlCache.size
  cleanExpiredCache()
  const sizeAfter = urlCache.size

  respondSuccess(req, res, 200, {
    message: 'Cache limpiado',
    entriesRemoved: sizeBefore - sizeAfter,
    remainingEntries: sizeAfter
  })
})

// Limpiar cache cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000)
