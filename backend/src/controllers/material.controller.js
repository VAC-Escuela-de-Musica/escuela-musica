// Controlador de materiales educativos
import Material from "../models/material.entity.js";
import { respondError, respondSuccess } from "../utils/resHandler.js";
import { fileService } from "../services/file.service.js";
import { auditService } from "../services/audit.service.js";
import { ACCESS_JWT_SECRET } from "../config/configEnv.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// Cache en memoria para URLs prefirmadas (en producción usar Redis)
const urlCache = new Map();

/**
 * Genera URL prefirmada para subida con validación de permisos
 */
export async function getUploadUrl(req, res) {
  try {
    console.log("🔍 === getUploadUrl INICIO ===");
    
    // Verificar que tenemos email (requisito de autenticación)
    if (!req.email) {
      console.error("❌ No hay req.email - problema de autenticación");
      return respondError(req, res, 401, "Usuario no autenticado");
    }
    
    // Verificar roles
    const isAdmin = isUserAdmin(req);
    const isProfesor = isUserProfesor(req);
    
    const { extension, contentType, nombre, descripcion, bucketTipo } = req.body;
    
    console.log("📝 Datos recibidos:", {
      extension,
      contentType,
      nombre,
      descripcion,
      bucketTipo,
      userEmail: req.email
    });
    
    // Validar extensión permitida
    const allowedExtensions = [
      'pdf', 'doc', 'docx', 'txt', 'rtf',
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp',
      'mp3', 'wav', 'ogg', 'm4a', 'flac',
      'mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm',
      'ppt', 'pptx', 'xls', 'xlsx',
      'zip', 'rar', '7z'
    ];
    
    if (!extension || !allowedExtensions.includes(extension.toLowerCase())) {
      console.error("❌ Extensión no permitida:", extension);
      return respondError(req, res, 400, `Tipo de archivo no permitido: ${extension}. Permitidos: ${allowedExtensions.join(', ')}`);
    }
    
    // Verificar permisos según tipo de bucket
    if (bucketTipo === 'publico' && !isAdmin) {
      return respondError(req, res, 403, "Solo admins pueden subir contenido público");
    }
    
    // PRIMERO: Generar el filename usando el servicio
    console.log("🔧 Generando filename...");
    const filename = fileService.generateUniqueFilename(extension);
    console.log("✅ Filename generado:", filename);
    
    // SEGUNDO: Pre-registrar el material en BD con el filename
    const materialPendiente = new Material({
      nombre: nombre || 'Material pendiente',
      descripcion: descripcion || '',
      usuario: req.email,
      bucketTipo: bucketTipo || 'privado',
      tipoContenido: contentType,
      filename: filename
    });
    
    await materialPendiente.save();
    console.log("✅ Material registrado en BD:", materialPendiente._id);
    
    // TERCERO: Usar el servicio para generar la URL con todos los datos
    const uploadData = await fileService.prepareUpload(materialPendiente, {
      extension,
      contentType,
      user: { email: req.email }
    });
    
    // Auditoría
    await auditService.logMaterialCreation(materialPendiente, { email: req.email });
    
    const responseData = {
      uploadUrl: uploadData.uploadUrl,
      materialId: materialPendiente._id,
      filename: uploadData.filename,
      expiresIn: uploadData.expiresIn,
      expiresAt: new Date(Date.now() + uploadData.expiresIn * 1000).toISOString()
    };
    
    console.log("✅ Sending response:", responseData);
    respondSuccess(req, res, 200, responseData);
  } catch (error) {
    console.error('Error generando URL de subida:', error);
    respondError(req, res, 500, "Error generando URL de subida");
  }
}

/**
 * Confirma que la subida se completó exitosamente
 */
export async function confirmUpload(req, res) {
  try {
    const { materialId, nombre, descripcion } = req.body;
    
    const material = await Material.findById(materialId);
    if (!material || material.usuario !== req.email) {
      return respondError(req, res, 404, "Material no encontrado o sin permisos");
    }
    
    // Verificar que el archivo realmente existe usando el servicio
    try {
      const fileInfo = await fileService.verifyUpload(material.filename, material.bucketTipo);
      
      // Actualizar material con datos finales
      material.nombre = nombre || material.nombre;
      material.descripcion = descripcion || material.descripcion;
      material.tamaño = fileInfo.size;
      material.nombreArchivo = material.filename;
      
      await material.save();
      
      // Auditoría
      await auditService.logFileUpload(material, { email: req.email }, fileInfo);
      
      respondSuccess(req, res, 200, material);
    } catch (fileError) {
      // El archivo no existe, eliminar registro
      await Material.findByIdAndDelete(materialId);
      return respondError(req, res, 404, "El archivo no fue subido correctamente");
    }
  } catch (error) {
    console.error('Error confirmando subida:', error);
    respondError(req, res, 500, "Error confirmando subida");
  }
}

/**
 * Lista materiales con URLs para frontend
 */
export async function listMaterialsWithUrls(req, res) {
  try {
    console.log('📋 listMaterialsWithUrls - Iniciando');
    
    // Verificar permisos
    const isAdmin = isUserAdmin(req);
    const isProfesor = isUserProfesor(req);
    
    let query = {};
    
    // Filtrar por permisos
    if (isAdmin) {
      // Admin ve todo
      console.log('👑 Usuario admin: mostrando todos los materiales');
    } else if (isProfesor) {
      // Profesor ve sus materiales + materiales públicos
      query = {
        $or: [
          { usuario: req.email },
          { bucketTipo: 'publico' }
        ]
      };
    } else {
      // Usuario normal ve públicos + sus privados
      query = {
        $or: [
          { bucketTipo: 'publico' },
          { usuario: req.email }
        ]
      };
    }
    
    const materials = await Material.find(query).select('-accesos').sort({ fechaSubida: -1 });
    console.log(`📊 Materiales encontrados: ${materials.length}`);
    
    // Generar URLs para frontend usando estrategia inteligente
    const materialsWithUrls = materials.map(material => {
      let viewUrl, downloadUrl, downloadStrategy;
      
      if (material.bucketTipo === 'publico' || canUserAccessMaterial(req, material)) {
        // Estrategia basada en el tamaño del archivo
        if (material.tamaño && material.tamaño > 10 * 1024 * 1024) { // > 10MB
          downloadStrategy = 'presigned';
          downloadUrl = `/api/materials/${material._id}/download-url`;
          viewUrl = `/api/materials/${material._id}/view-url`;
        } else {
          downloadStrategy = 'hybrid'; // Intentará presigned con fallback
          // Usar las rutas correctas de files
          downloadUrl = `/api/files/download/${material._id}`;
          viewUrl = `/api/files/serve/${material._id}`;
        }
      }
      
      return {
        ...material.toObject(),
        viewUrl,
        downloadUrl,
        downloadStrategy,
        urlType: 'backend'
      };
    });
    
    respondSuccess(req, res, 200, materialsWithUrls);
  } catch (error) {
    console.error('❌ Error listando materiales:', error);
    respondError(req, res, 500, "Error al listar materiales");
  }
}

/**
 * Elimina material y archivo de MinIO
 */
export async function deleteMaterial(req, res) {
  try {
    const { materialId } = req.params;
    
    const material = await Material.findById(materialId);
    if (!material) {
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    // Verificar permisos
    if (material.usuario !== req.email && !isUserAdmin(req)) {
      return respondError(req, res, 403, "Sin permisos para eliminar este material");
    }
    
    // Eliminar archivo usando el servicio
    const fileDeleted = await fileService.deleteFile(material);
    if (!fileDeleted) {
      console.warn('Archivo no pudo ser eliminado de MinIO, pero continuando...');
    }
    
    // Eliminar registro de BD
    await Material.findByIdAndDelete(materialId);
    
    // Auditoría
    await auditService.logMaterialDeletion(material, { email: req.email });
    
    // Limpiar cache si existe
    const cacheKey = `${materialId}_${req.email}`;
    urlCache.delete(cacheKey);
    
    respondSuccess(req, res, 200, { mensaje: "Material eliminado exitosamente" });
  } catch (error) {
    console.error('Error eliminando material:', error);
    respondError(req, res, 500, "Error eliminando material");
  }
}

/**
 * Función para inicializar buckets en MinIO
 */
export async function initializeBucket() {
  try {
    // Delegar al servicio de MinIO
    const { minioService } = await import('../services/minio.service.js');
    await minioService.initializeBuckets();
    console.log("✅ Buckets inicializados correctamente desde servicio");
  } catch (error) {
    console.error("❌ Error inicializando buckets:", error);
    throw error;
  }
}

/**
 * Ruta de prueba para verificar conexión a MinIO
 */
export async function testMinioConnection(req, res) {
  try {
    // Usar el servicio de MinIO para health check
    const { minioService } = await import('../services/minio.service.js');
    const healthStatus = await minioService.healthCheck();
    
    if (healthStatus.status === 'healthy') {
      return respondSuccess(req, res, 200, {
        minioConnection: "OK",
        health: healthStatus,
        message: "MinIO está operativo"
      });
    } else {
      return respondError(req, res, 503, `MinIO no disponible: ${healthStatus.error}`);
    }
  } catch (error) {
    console.error("Error conectando a MinIO:", error);
    return respondError(req, res, 500, `Error conectando a MinIO: ${error.message}`);
  }
}

// ============= FUNCIONES AUXILIARES =============

/**
 * Verifica si un usuario tiene rol de admin
 */
function isUserAdmin(req) {
  return req.roles?.some(role => role.name === 'admin' || role === 'admin');
}

/**
 * Verifica si un usuario tiene rol de profesor
 */
function isUserProfesor(req) {
  return req.roles?.some(role => role.name === 'profesor' || role === 'profesor');
}

/**
 * Verifica si un usuario puede acceder a un material
 */
function canUserAccessMaterial(req, material) {
  // Admins pueden acceder a todo
  if (isUserAdmin(req)) return true;
  
  // Material público es accesible para todos
  if (material.bucketTipo === 'publico') return true;
  
  // El dueño puede acceder a su material
  if (material.usuario === req.email) return true;
  
  // Profesores pueden acceder a materiales de otros profesores
  if (isUserProfesor(req)) return true;
  
  return false;
}

/**
 * Limpia cache de URLs expiradas (ejecutar periódicamente)
 */
export function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (value.expiresAt <= now) {
      urlCache.delete(key);
    }
  }
}

// Limpiar cache cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);
