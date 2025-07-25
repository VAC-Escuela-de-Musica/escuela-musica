import { galeriaService } from '../services/galeria.service.js'
import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import { minioService, AuthorizationService } from '../../../services/index.js'

import { asyncHandler } from '../../../middlewares/index.js'

/**
 * Obtener galería activa (pública)
 */
export const getActiveGallery = asyncHandler(async (req, res) => {
  const result = await galeriaService.getActiveGallery()
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Obtener galería por categoría (pública)
 */
export const getGalleryByCategory = asyncHandler(async (req, res) => {
  const { categoria } = req.params
  const result = await galeriaService.getGalleryByCategory(categoria)
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Obtener todas las imágenes (administración)
 */
export const getAllGallery = asyncHandler(async (req, res) => {
  const result = await galeriaService.getAllGallery()
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Obtener imagen por ID
 */
export const getImageById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await galeriaService.getImageById(id)
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Crear nueva imagen
 */
export const createImage = asyncHandler(async (req, res) => {
  const imageData = {
    ...req.body,
    usuario: req.email || req.user?.email
  }

  const result = await galeriaService.createImage(imageData)
  respondSuccess(req, res, 201, result.data, result.message)
})

/**
 * Actualizar imagen
 */
export const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await galeriaService.updateImage(id, req.body)
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Eliminar imagen
 */
export const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await galeriaService.deleteImage(id)
  respondSuccess(req, res, 200, null, result.message)
})

/**
 * Cambiar estado activo/inactivo
 */
export const toggleImageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const result = await galeriaService.toggleImageStatus(id)
  respondSuccess(req, res, 200, result.data, result.message)
})

/**
 * Actualizar orden de imágenes
 */
export const updateImageOrder = asyncHandler(async (req, res) => {
  const { ordenData } = req.body

  if (!Array.isArray(ordenData)) {
    return respondError(req, res, 400, 'ordenData debe ser un array')
  }

  const result = await galeriaService.updateImageOrder(ordenData)
  respondSuccess(req, res, 200, null, result.message)
})

/**
 * Obtener URL presignada de imagen para evitar problemas de CORS
 */
export const getImageUrl = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { action = 'view', duration = 3600 } = req.query

  const imageResult = await galeriaService.getImageById(id)
  const urlResult = await galeriaService.getImageUrl(imageResult.data, {
    action,
    duration: parseInt(duration)
  })

  respondSuccess(req, res, 200, urlResult.data, urlResult.message)
})

/**
 * Obtener URLs presignadas para todas las imágenes activas (público)
 */
export const getActiveGalleryWithUrls = asyncHandler(async (req, res) => {
  const result = await galeriaService.getActiveGallery()
  
  // Generar URLs presignadas para todas las imágenes
  const imagesWithUrls = await Promise.all(
    result.data.map(async (imagen) => {
      try {
        const urlResult = await galeriaService.getImageUrl(imagen, { duration: 3600 })
        return {
          ...imagen.toObject(),
          presignedUrl: urlResult.data.url
        }
      } catch (error) {
        console.error('Error generando URL para imagen:', imagen._id, error)
        return {
          ...imagen.toObject(),
          presignedUrl: imagen.imagen // Fallback a URL original
        }
      }
    })
  )
  
  respondSuccess(req, res, 200, imagesWithUrls, 'Galería activa con URLs presignadas obtenida exitosamente')
})

/**
 * Genera URL prefirmada para subida de imágenes de galería
 */
export const getUploadUrl = asyncHandler(async (req, res) => {
  // Verificar que tenemos email (requisito de autenticación)
  if (!req.email) {
    return respondError(req, res, 401, 'Usuario no autenticado')
  }

  // Verificar roles - Solo administradores y asistentes pueden subir a galería
  const isAdmin = AuthorizationService.isUserAdmin(req)
  const isAsistente = AuthorizationService.isUserAsistente(req)

  if (!isAdmin && !isAsistente) {
    return respondError(req, res, 403, 'Solo administradores y asistentes pueden subir imágenes a la galería')
  }

  const { filename, contentType, bucketType } = req.body

  // Validar que sea una imagen
  if (!contentType || !contentType.startsWith('image/')) {
    return respondError(req, res, 400, 'Solo se permiten archivos de imagen')
  }

  // Validar tipos de imagen permitidos
  const allowedImageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'image/webp', 'image/bmp', 'image/svg+xml'
  ]

  if (!allowedImageTypes.includes(contentType.toLowerCase())) {
    return respondError(req, res, 400, `Tipo de imagen no permitido: ${contentType}. Permitidos: JPG, PNG, GIF, WebP, BMP, SVG`)
  }

  try {
    // Usar el tipo de bucket 'galery' que el servicio MinIO mapea al bucket configurado
    const bucketType = 'galery'
    const finalFilename = filename || `galeria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Generar URL prefirmada usando MinioService
    const uploadData = await minioService.generateUploadUrl(
      bucketType,
      finalFilename,
      300, // 5 minutos
      {
        'Content-Type': contentType
      }
    )

    // Generar URL pública para la respuesta
    const minioPort = process.env.MINIO_PORT || 9000
    const publicUrl = `http://${process.env.MINIO_ENDPOINT}:${minioPort}/${uploadData.bucket}/${finalFilename}`

    const responseData = {
      uploadUrl: uploadData.uploadUrl,
      publicUrl,
      filename: finalFilename,
      bucket: uploadData.bucket,
      expiresIn: uploadData.expiresIn,
      expiresAt: new Date(Date.now() + uploadData.expiresIn * 1000).toISOString()
    }

    console.log('✅ Galería - URL de subida generada:', {
      filename: finalFilename,
      bucket: uploadData.bucket,
      contentType
    })

    respondSuccess(req, res, 200, { data: responseData })
  } catch (error) {
    console.error('Error al generar URL de subida para galería:', error)
    respondError(req, res, 500, `Error al generar URL de subida: ${error.message}`)
  }
})
