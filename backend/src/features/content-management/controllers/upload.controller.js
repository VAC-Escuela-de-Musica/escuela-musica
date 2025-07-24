// Controlador de subida de materiales
import Material from '../../../core/models/material.model.js'
import { respondError, respondSuccess } from '../../../core/utils/responseHandler.util.js'
import { fileService, auditService, AuthorizationService } from '../../../services/index.js'

import { asyncHandler } from '../../../middlewares/index.js'

/**
 * Genera URL prefirmada para subida con validación de permisos
 */
export const getUploadUrl = asyncHandler(async (req, res) => {
  // Verificar que tenemos email (requisito de autenticación)
  if (!req.email) {
    return respondError(req, res, 401, 'Usuario no autenticado')
  }

  // Verificar roles
  const isAdmin = AuthorizationService.isUserAdmin(req)
  const isProfesor = AuthorizationService.isUserProfesor(req)

  const { extension, contentType, nombre, descripcion, bucketTipo } = req.body

  // Validar extensión permitida
  const allowedExtensions = [
    'pdf', 'doc', 'docx', 'txt', 'rtf',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
    'mp3', 'wav', 'ogg', 'm4a', 'flac',
    'mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm',
    'ppt', 'pptx', 'xls', 'xlsx',
    'zip', 'rar', '7z'
  ]

  if (!extension || !allowedExtensions.includes(extension.toLowerCase())) {
    return respondError(req, res, 400, `Tipo de archivo no permitido: ${extension}. Permitidos: ${allowedExtensions.join(', ')}`)
  }

  // Verificar permisos según tipo de bucket
  if (bucketTipo === 'publico' && !isAdmin) {
    return respondError(req, res, 403, 'Solo admins pueden subir contenido público')
  }

  // PRIMERO: Generar el filename usando el servicio
  const filename = fileService.generateUniqueFilename(extension)

  // SEGUNDO: Pre-registrar el material en BD con el filename
  const materialPendiente = new Material({
    nombre: nombre || 'Material pendiente',
    descripcion: descripcion || '',
    usuario: req.email,
    bucketTipo: bucketTipo || 'privado',
    tipoContenido: contentType,
    filename
  })

  await materialPendiente.save()

  // TERCERO: Usar el servicio para generar la URL con todos los datos
  const uploadData = await fileService.prepareUpload(materialPendiente, {
    extension,
    contentType,
    user: { email: req.email }
  })

  // Auditoría
  await auditService.logMaterialCreation(materialPendiente, { email: req.email })

  const responseData = {
    uploadUrl: uploadData.uploadUrl,
    materialId: materialPendiente._id,
    filename: uploadData.filename,
    expiresIn: uploadData.expiresIn,
    expiresAt: new Date(Date.now() + uploadData.expiresIn * 1000).toISOString()
  }

  console.log('✅ Sending response:', responseData)
  respondSuccess(req, res, 200, responseData)
})

/**
 * Confirma que la subida se completó exitosamente
 */
export const confirmUpload = asyncHandler(async (req, res) => {
  const { materialId, nombre, descripcion } = req.body

  const material = await Material.findById(materialId)
  if (!material || material.usuario !== req.email) {
    return respondError(req, res, 404, 'Material no encontrado o sin permisos')
  }

  // Verificar que el archivo realmente existe usando el servicio
  try {
    const fileInfo = await fileService.verifyUpload(material.filename, material.bucketTipo)

    // Actualizar material con datos finales
    material.nombre = nombre || material.nombre
    material.descripcion = descripcion || material.descripcion
    material.tamaño = fileInfo.size
    material.nombreArchivo = material.filename

    await material.save()

    // Auditoría
    await auditService.logFileUpload(material, { email: req.email }, fileInfo)

    respondSuccess(req, res, 200, material)
  } catch (fileError) {
    // El archivo no existe, eliminar registro
    await Material.findByIdAndDelete(materialId)
    return respondError(req, res, 404, 'El archivo no fue subido correctamente')
  }
})
