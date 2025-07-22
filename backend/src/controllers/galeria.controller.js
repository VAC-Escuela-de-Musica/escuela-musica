import { respondError, respondSuccess } from "../utils/responseHandler.util.js";
import { minioService } from '../services/index.js';
import { AuthorizationService } from '../services/index.js';
import { asyncHandler } from "../middlewares/index.js";

/**
 * Genera URL prefirmada para subida de imágenes de galería
 */
export const getUploadUrl = asyncHandler(async (req, res) => {
  // Verificar que tenemos email (requisito de autenticación)
  if (!req.email) {
    return respondError(req, res, 401, "Usuario no autenticado");
  }
  
  // Verificar roles - Solo administradores y asistentes pueden subir a galería
  const isAdmin = AuthorizationService.isUserAdmin(req);
  const isAsistente = AuthorizationService.isUserAsistente(req);
  
  if (!isAdmin && !isAsistente) {
    return respondError(req, res, 403, "Solo administradores y asistentes pueden subir imágenes a la galería");
  }
  
  const { filename, contentType, bucketType } = req.body;
  
  // Validar que sea una imagen
  if (!contentType || !contentType.startsWith('image/')) {
    return respondError(req, res, 400, "Solo se permiten archivos de imagen");
  }
  
  // Validar tipos de imagen permitidos
  const allowedImageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/bmp', 'image/svg+xml'
  ];
  
  if (!allowedImageTypes.includes(contentType.toLowerCase())) {
    return respondError(req, res, 400, `Tipo de imagen no permitido: ${contentType}. Permitidos: JPG, PNG, GIF, WebP, BMP, SVG`);
  }
  
  try {
    // Usar el bucket de galería específicamente
    const bucketToUse = 'galery';
    const finalFilename = filename || `galeria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generar URL prefirmada usando MinioService
    const uploadData = await minioService.generateUploadUrl(
      bucketToUse,
      finalFilename,
      300, // 5 minutos
      {
        'Content-Type': contentType
      }
    );
    
    // Generar URL pública para la respuesta
    const publicUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${uploadData.bucket}/${finalFilename}`;
    
    const responseData = {
      uploadUrl: uploadData.uploadUrl,
      publicUrl: publicUrl,
      filename: finalFilename,
      bucket: uploadData.bucket,
      expiresIn: uploadData.expiresIn,
      expiresAt: new Date(Date.now() + uploadData.expiresIn * 1000).toISOString()
    };
    
    console.log("✅ Galería - URL de subida generada:", {
      filename: finalFilename,
      bucket: uploadData.bucket,
      contentType
    });
    
    respondSuccess(req, res, 200, { data: responseData });
  } catch (error) {
    console.error('Error al generar URL de subida para galería:', error);
    respondError(req, res, 500, `Error al generar URL de subida: ${error.message}`);
  }
});