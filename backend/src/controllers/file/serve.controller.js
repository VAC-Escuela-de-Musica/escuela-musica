// Controlador para servir archivos
import { fileService } from '../../services/index.js';
import { auditService } from '../../services/index.js';
import { AuthorizationService } from '../../services/index.js';
import Material from '../../core/models/material.model.js';
import { respondError } from '../../utils/responseHandler.util.js';
import { asyncHandler } from '../../middlewares/index.js';
import { ACCESS_JWT_SECRET } from "../../core/config/configEnv.js";
import jwt from "jsonwebtoken";

/**
 * Sirve archivo con fallback automático para visualización
 */
export const serveFile = asyncHandler(async (req, res) => {
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
      action: 'view',
      duration: 300
    });
    
    console.log(`✅ URL prefirmada generada exitosamente para: ${material.filename}`);
    
    // Auditoría para método presigned
    await auditService.logMaterialAccess(material, req, 'presigned_view', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    await material.save();
    
    // Para vista previa, redirigir a la URL prefirmada
    return res.redirect(downloadData.downloadUrl);
    
  } catch (presignedError) {
    console.warn('⚠️ Fallo en URL prefirmada, usando fallback streaming:', presignedError.message);
    console.warn('⚠️ Stack trace:', presignedError.stack);
    
    // Fallback: streaming a través del backend
    try {
      const fileStream = await fileService.getFileStreamForFallback(material);
      
      res.setHeader('Content-Type', material.tipoContenido || 'application/octet-stream');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Served-By', 'fallback-stream');
      res.setHeader('Cache-Control', 'public, max-age=300');
      
      // Auditoría para fallback
      await auditService.logMaterialAccess(material, req, 'fallback_stream', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      await material.save();
      
      console.log(`✅ Archivo servido via fallback: ${material.filename} a ${req.email || 'anónimo'}`);
      
      fileStream.pipe(res);
    } catch (fallbackError) {
      console.error('❌ Error en fallback streaming:', fallbackError.message);
      console.error('❌ Stack trace:', fallbackError.stack);
      return respondError(req, res, 500, "Error al servir el archivo");
    }
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
