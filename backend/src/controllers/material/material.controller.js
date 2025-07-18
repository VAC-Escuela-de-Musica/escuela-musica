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
  const materialsWithUrls = await Promise.all(materials.map(async (material) => {
    let viewUrl, downloadUrl, downloadStrategy;
    
    if (material.bucketTipo === 'publico' || AuthorizationService.canUserAccessMaterial(req, material)) {
      try {
        // Generar URLs presignadas directamente
        const urls = await fileService.generatePresignedUrls(material);
        viewUrl = urls.viewUrl;
        downloadUrl = urls.downloadUrl;
        downloadStrategy = 'presigned';
      } catch (error) {
        console.warn('Error generando URLs presignadas, usando fallback:', error.message);
        // Fallback a URLs del backend
        downloadUrl = `/api/files/download/${material._id}`;
        viewUrl = `/api/files/serve/${material._id}`;
        downloadStrategy = 'backend';
      }
    }
    
    // Mapear campos para compatibilidad con frontend
    return {
      _id: material._id,
      // Campos originales (compatibilidad con versión anterior)
      nombre: material.nombre,
      descripcion: material.descripcion,
      usuario: material.usuario,
      fechaSubida: material.fechaSubida,
      tamaño: material.tamaño,
      tipoContenido: material.tipoContenido,
      bucketTipo: material.bucketTipo,
      // Campos mapeados para nueva versión
      title: material.nombre,
      description: material.descripcion,
      mimeType: material.tipoContenido,
      fileSize: material.tamaño,
      createdAt: material.fechaSubida,
      isPublic: material.bucketTipo === 'publico',
      userId: material.usuario,
      // URLs
      viewUrl,
      downloadUrl,
      downloadStrategy,
      urlType: downloadStrategy === 'presigned' ? 'direct' : 'backend'
    };
  }));
  
  console.log(`📊 Materiales con URLs generados: ${materialsWithUrls.length}`);
  
  // Estructura de respuesta para paginación
  const response = {
    documents: materialsWithUrls,
    pagination: {
      page: 1,
      limit: materialsWithUrls.length,
      totalCount: materialsWithUrls.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  };
  
  respondSuccess(req, res, 200, response);
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
  
  console.log('🗑️ deleteMaterial called with materialId:', materialId);
  console.log('🗑️ req.email:', req.email);
  console.log('🗑️ req.user:', req.user);
  
  const material = await Material.findById(materialId);
  if (!material) {
    return respondError(req, res, 404, "Material no encontrado");
  }
  
  console.log('🗑️ Material found:', {
    id: material._id,
    nombre: material.nombre,
    usuario: material.usuario,
    fechaSubida: material.fechaSubida
  });
  
  // Verificar permisos
  console.log('🗑️ Permission check:');
  console.log('  - material.usuario:', material.usuario);
  console.log('  - req.email:', req.email);
  console.log('  - Are equal?:', material.usuario === req.email);
  console.log('  - Is admin?:', AuthorizationService.isUserAdmin(req));
  
  if (material.usuario !== req.email && !AuthorizationService.isUserAdmin(req)) {
    console.log('🗑️ Permission denied');
    return respondError(req, res, 403, "Sin permisos para eliminar este material");
  }
  
  console.log('🗑️ Permissions verified, proceeding with deletion');
  
  // Eliminar archivo usando el servicio
  const fileDeleted = await fileService.deleteFile(material);
  if (!fileDeleted) {
    console.warn('Archivo no pudo ser eliminado de MinIO, pero continuando...');
  }
  
  // Eliminar registro de BD
  await Material.findByIdAndDelete(materialId);
  
  // Auditoría
  await auditService.logMaterialDeletion(material, { email: req.email });
  
  console.log('🗑️ Material deleted successfully');
  respondSuccess(req, res, 200, { mensaje: "Material eliminado exitosamente" });
});
