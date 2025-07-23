// Controlador para descarga de archivos
import { fileService } from '../../services/index.js';
import { auditService } from '../../services/index.js';
import { AuthorizationService } from '../../services/index.js';
import Material from '../../core/models/material.model.js';
import { respondSuccess, respondError } from '../../utils/responseHandler.util.js';
import { asyncHandler } from '../../middlewares/index.js';
import { ACCESS_JWT_SECRET } from "../../core/config/configEnv.js";
import jwt from "jsonwebtoken";

/**
 * Genera URL prefirmada para descarga
 */
export const getDownloadUrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action = 'download', duration = 300 } = req.query;
  
  const material = await Material.findById(id);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  if (!AuthorizationService.canUserAccessMaterial(req, material)) {
    return respondError(req, res, 403, "Sin permisos para acceder a este material");
  }
  
  // Preparar descarga usando el servicio
  const downloadData = await fileService.prepareDownload(material, {
    action,
    duration: parseInt(duration)
  });
  
  // Auditoría
  await auditService.logMaterialAccess(material, req, `presigned_${action}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Guardar el material con la auditoría actualizada
  await material.save();
  
  respondSuccess(req, res, 200, {
    method: 'presigned',
    ...downloadData,
    expiresAt: new Date(Date.now() + downloadData.expiresIn * 1000).toISOString()
  });
});

/**
 * Descarga archivo con fallback automático
 */
export const downloadFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;
  
  // Verificar token JWT si se proporciona
  verifyTokenFromUrl(req, token);
  
  const material = await Material.findById(id);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  if (!AuthorizationService.canUserAccessMaterial(req, material)) {
    return respondError(req, res, 403, "Sin permisos para acceder a este material");
  }
  
  // Intentar método principal (URL prefirmada)
  try {
    const downloadData = await fileService.prepareDownload(material, {
      action: 'download',
      duration: 300
    });
    
    // Auditoría para método presigned
    await auditService.logMaterialAccess(material, req, 'presigned_download', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await material.save();
    
    // Para descarga, redirigir a la URL prefirmada
    return res.redirect(downloadData.downloadUrl);
    
  } catch (presignedError) {
    console.warn('⚠️ Fallo en URL prefirmada, usando fallback streaming:', presignedError.message);
    
    // Fallback: streaming a través del backend
    const fileStream = await fileService.getFileStreamForFallback(material);
    
    res.setHeader('Content-Type', material.tipoContenido || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${material.nombre}"`);
    res.setHeader('X-Served-By', 'fallback-stream');
    res.setHeader('Cache-Control', 'public, max-age=300');
    
    // Auditoría para fallback
    await auditService.logMaterialAccess(material, req, 'fallback_download', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await material.save();
    
    console.log(`✅ Archivo descargado via fallback: ${material.filename} por ${req.email || 'anónimo'}`);
    
    fileStream.pipe(res);
  }
});

/**
 * Función auxiliar que verifica y extrae información del token JWT
 */
function verifyTokenFromUrl(req, token) {
  if (token && !req.email) {
    try {
      const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
      
      req.email = decoded.email;
      req.roles = decoded.roles || [];
      
      return true;
    } catch (tokenError) {
      console.error(`❌ Error validando token URL: ${tokenError.message}`);
      return false;
    }
  }
  return !!req.email;
}
