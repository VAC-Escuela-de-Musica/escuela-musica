'use strict'

import minioService from '../../features/file-system/services/minio.service.js'

/**
 * Realiza un health check completo del sistema
 * @returns {Object} - Objeto con información de salud del sistema
 */
export async function getSystemHealth () {
  try {
    const minioHealth = await minioService.healthCheck()

    const health = {
      minio: minioHealth,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }

    return {
      success: minioHealth.status === 'healthy',
      data: health,
      statusCode: minioHealth.status === 'healthy' ? 200 : 503
    }
  } catch (error) {
    console.error('Error en health check del sistema:', error)
    return {
      success: false,
      data: {
        error: error.message,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      },
      statusCode: 500
    }
  }
}

/**
 * Controller helper para health check - formato estándar de respuesta
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function healthCheckController (req, res) {
  try {
    const healthResult = await getSystemHealth()

    res.status(healthResult.statusCode).json({
      success: healthResult.success,
      data: healthResult.data
    })
  } catch (error) {
    console.error('Error en health check controller:', error)
    res.status(500).json({
      success: false,
      error: 'Error verificando salud del sistema',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Health check básico de MinIO solamente
 * @returns {Object} - Estado de MinIO
 */
export async function getMinioHealth () {
  try {
    return await minioService.healthCheck()
  } catch (error) {
    console.error('Error verificando salud de MinIO:', error)
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
