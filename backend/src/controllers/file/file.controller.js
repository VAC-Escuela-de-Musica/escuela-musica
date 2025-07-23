import { fileService } from '../../services/storage/file.service.js';
import { minioService } from '../../services/storage/minio.service.js';
import { auditService } from '../../services/audit.service.js';
import Material from '../../core/models/material.model.js';
import { respondSuccess, respondError } from '../../utils/responseHandler.util.js';
import { ACCESS_JWT_SECRET } from "../../core/config/configEnv.js";
import jwt from "jsonwebtoken";

/**
 * CONTROLADOR DE ARCHIVOS - Operaciones específicas de archivos
 */

/**
 * Genera URL prefirmada para descarga
 */
export async function getDownloadUrl(req, res) {
  try {
    const { id } = req.params;
    const { action = 'download', duration = 300 } = req.query;
    
    const material = await Material.findById(id);
    if (!material) {
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    if (!canUserAccessMaterial(req, material)) {
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
    
  } catch (error) {
    console.error('Error preparando descarga:', error);
    await auditService.logAccessError(req.params.id, req, error, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    respondError(req, res, 500, "Error preparando descarga");
  }
}

/**
 * Sirve archivo con fallback automático
 */
export async function serveFileWithFallback(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    // Verificar token JWT si se proporciona
    verifyTokenFromUrl(req, token);
    
    const material = await Material.findById(id);
    if (!material) {
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    if (!canUserAccessMaterial(req, material)) {
      return respondError(req, res, 403, "Sin permisos para acceder a este material");
    }
    
    // Intentar método principal (URL prefirmada)
    try {
      const downloadData = await fileService.prepareDownload(material, {
        action: 'view',
        duration: 300
      });
      
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
      
      // Fallback: streaming a través del backend
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
    }
    
  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    await auditService.logAccessError(req.params.id, req, error, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    respondError(req, res, 500, "Error accediendo al archivo");
  }
}

/**
 * Descarga archivo con fallback automático
 */
export async function downloadFileWithFallback(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    // Verificar token JWT si se proporciona
    verifyTokenFromUrl(req, token);
    
    const material = await Material.findById(id);
    if (!material) {
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    if (!canUserAccessMaterial(req, material)) {
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
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    await auditService.logAccessError(req.params.id, req, error, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    respondError(req, res, 500, "Error descargando archivo");
  }
}

/**
 * Health check del sistema de archivos
 */
export async function healthCheck(req, res) {
  try {
    const minioHealth = await minioService.healthCheck();
    
    const health = {
      minio: minioHealth,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const statusCode = minioHealth.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: minioHealth.status === 'healthy',
      data: health
    });
    
  } catch (error) {
    console.error('Error en health check:', error);
    respondError(req, res, 500, "Error verificando salud del sistema");
  }
}

// ============= FUNCIONES AUXILIARES =============

/**
 * Función auxiliar que verifica y extrae información del token JWT
 */
function verifyTokenFromUrl(req, token) {
  // Si ya hay datos de usuario del middleware, usar esos
  if (req.user?.email) {
    return true;
  }
  
  // Si hay token en la URL, verificarlo
  if (token) {
    try {
      const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
      
      // Asignar datos del token tanto al formato legacy como al nuevo
      req.email = decoded.email;
      req.roles = decoded.roles || [];
      
      // También crear el objeto user para compatibilidad
      req.user = {
        email: decoded.email,
        roles: decoded.roles || []
      };
      
      return true;
    } catch (tokenError) {
      console.error(`❌ Error validando token URL: ${tokenError.message}`);
      return false;
    }
  }
  
  // Si no hay token ni datos de usuario
  return false;
}

/**
 * Verifica si un usuario puede acceder a un material
 */
function canUserAccessMaterial(req, material) {
  // Obtener email y roles del usuario (compatible con ambos sistemas)
  const userEmail = req.user?.email || req.email;
  const userRoles = req.user?.roleNames || req.user?.roles || req.roles || [];
  
  // Admins pueden acceder a todo
  if (isUserAdmin({ email: userEmail, roles: userRoles })) return true;
  
  // Material público es accesible para todos
  if (material.bucketTipo === 'publico') return true;
  
  // El dueño puede acceder a su material
  if (material.usuario === userEmail) return true;
  
  // Profesores pueden acceder a materiales de otros profesores
  if (isUserProfesor({ email: userEmail, roles: userRoles })) return true;
  
  return false;
}

/**
 * Verifica si un usuario tiene rol de admin
 */
function isUserAdmin(user) {
  if (!user.roles) return false;
  return user.roles.some(role => 
    role === 'administrador' || 
    role.name === 'administrador' || 
    (typeof role === 'string' && role === 'administrador')
  );
}

/**
 * Verifica si un usuario tiene rol de profesor
 */
function isUserProfesor(user) {
  if (!user.roles) return false;
  return user.roles.some(role => 
    role === 'profesor' || 
    role.name === 'profesor' || 
    (typeof role === 'string' && role === 'profesor')
  );
}
