// Controlador de materiales educativos - CRUD básico
import Material from "../../models/material.model.js";
import { respondError, respondSuccess } from "../../utils/responseHandler.util.js";
import { auditService } from '../../services/index.js';
import { AuthorizationService } from '../../services/index.js';
import { asyncHandler } from "../../middlewares/index.js";
import { fileService } from '../../services/index.js';

/**
 * Lista materiales con URLs para frontend
 */
export const listMaterialsWithUrls = asyncHandler(async (req, res) => {
  console.log('📋 listMaterialsWithUrls - Iniciando');
  
  // Verificar permisos
  const isAdmin = AuthorizationService.isUserAdmin(req);
  const isProfesor = AuthorizationService.isUserProfesor(req);
  
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
    
    if (material.bucketTipo === 'publico' || AuthorizationService.canUserAccessMaterial(req, material)) {
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
});

/**
 * Obtener un material específico por ID
 */
export const getMaterialById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const material = await Material.findById(id);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  // Verificar permisos
  if (!AuthorizationService.canUserAccessMaterial(req, material)) {
    return respondError(req, res, 403, "Sin permisos para acceder a este material");
  }
  
  respondSuccess(req, res, 200, material);
});

/**
 * Actualizar información de un material
 */
export const updateMaterial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  
  const material = await Material.findById(id);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  // Verificar permisos (solo el creador o admin)
  if (material.usuario !== req.email && !AuthorizationService.isUserAdmin(req)) {
    return respondError(req, res, 403, "Sin permisos para modificar este material");
  }
  
  // Actualizar campos permitidos
  if (nombre) material.nombre = nombre;
  if (descripcion) material.descripcion = descripcion;
  
  await material.save();
  
  // Auditoría
  await auditService.logMaterialUpdate(material, { email: req.email }, { nombre, descripcion });
  
  respondSuccess(req, res, 200, material);
});

/**
 * Elimina material y archivo de MinIO
 */
export const deleteMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  
  const material = await Material.findById(materialId);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  // Verificar permisos
  if (material.usuario !== req.email && !AuthorizationService.isUserAdmin(req)) {
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
  
  respondSuccess(req, res, 200, { mensaje: "Material eliminado exitosamente" });
});
