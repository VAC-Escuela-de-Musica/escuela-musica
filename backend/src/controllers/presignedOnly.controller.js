// Controlador SOLO con URLs prefirmadas
import Material from "../models/material.entity.js";
import { respondError, respondSuccess } from "../utils/resHandler.js";
import { minioClient, BUCKET } from "../config/minio.config.js";
import { ACCESS_JWT_SECRET } from "../config/configEnv.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// Cache en memoria para URLs prefirmadas (en producción usar Redis)
const urlCache = new Map();

// ============= FUNCIONES CORE PARA URLs PREFIRMADAS =============

/**
 * Genera URL prefirmada para subida con validación de permisos52908
 */
export async function getUploadUrl(req, res) {
  try {
    console.log("🔍 === getUploadUrl INICIO ===");
    console.log("📊 req.body:", JSON.stringify(req.body, null, 2));
    console.log("👤 req.email:", req.email);
    console.log("🔑 req.roles:", JSON.stringify(req.roles, null, 2));
    console.log("🌐 Headers:", JSON.stringify(req.headers, null, 2));
    
    // Verificar que tenemos email (requisito de autenticación)
    if (!req.email) {
      console.error("❌ No hay req.email - problema de autenticación");
      return respondError(req, res, 401, "Usuario no autenticado");
    }
    
    // Debug roles adicional
    const isAdmin = isUserAdmin(req);
    const isProfesor = isUserProfesor(req);
    console.log("🔍 Role detection:", { isAdmin, isProfesor, hasRoles: !!req.roles, rolesLength: req.roles?.length });
    
    const { extension, contentType, nombre, descripcion } = req.body;
    
    // Validar extensión permitida
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'mp3', 'mp4'];
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      return respondError(req, res, 400, "Tipo de archivo no permitido");
    }
    
    const filename = `${uuidv4()}.${extension}`;
    const bucket = req.body.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    // Verificar permisos según tipo de bucket
    if (req.body.bucketTipo === 'publico' && !isAdmin) {
      return respondError(req, res, 403, "Solo admins pueden subir contenido público");
    }
    
    // Generar URL prefirmada para subida (5 minutos) con headers adecuados para CORS
    const presignedUrlOptions = {
      expiresIn: 300, // 5 minutos en segundos
      headers: {
        'Content-Type': contentType
      }
    };
    
    // Generar URL prefirmada con las opciones específicas
    const uploadUrl = await minioClient.presignedPutObject(bucket, filename, presignedUrlOptions.expiresIn);
    
    // Pre-registrar el material en BD (estado pendiente)
    const materialPendiente = new Material({
      nombre: nombre || 'Material pendiente',
      descripcion: descripcion || '',
      filename,
      usuario: req.email,
      bucketTipo: req.body.bucketTipo || 'privado',
      tipoContenido: contentType
    });
    
    await materialPendiente.save();
    
    const responseData = {
      uploadUrl,
      materialId: materialPendiente._id,
      filename,
      expiresIn: 300,
      expiresAt: new Date(Date.now() + 300000).toISOString()
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
    
    // Verificar que el archivo realmente existe en MinIO
    const bucket = material.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    try {
      const stat = await minioClient.statObject(bucket, material.filename);
      
      // Actualizar material con datos finales
      material.nombre = nombre || material.nombre;
      material.descripcion = descripcion || material.descripcion;
      material.tamaño = stat.size;
      material.nombreArchivo = material.filename;
      
      await material.save();
      
      respondSuccess(req, res, 200, material);
    } catch (minioError) {
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
 * Obtiene URL prefirmada para descarga con control de acceso
 */
export async function getDownloadUrl(req, res) {
  try {
    const { materialId } = req.params;
    const { expiryMinutes = 60 } = req.query;
    
    const material = await Material.findById(materialId);
    if (!material) {
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    // Control de acceso
    if (!canUserAccessMaterial(req, material)) {
      return respondError(req, res, 403, "Sin permisos para acceder a este material");
    }
    
    // Verificar cache
    const cacheKey = `${materialId}_${req.email}`;
    const cached = urlCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return respondSuccess(req, res, 200, {
        url: cached.url,
        cached: true,
        expiresAt: new Date(cached.expiresAt).toISOString()
      });
    }
    
    const bucket = material.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    // Generar nueva URL prefirmada
    const expiry = Math.min(parseInt(expiryMinutes) * 60, 3600); // Máximo 1 hora
    const url = await minioClient.presignedGetObject(bucket, material.filename, expiry);
    
    // Guardar en cache
    urlCache.set(cacheKey, {
      url,
      expiresAt: Date.now() + (expiry * 1000)
    });
    
    // Registrar acceso para auditoria
    material.accesos.push({
      usuario: req.email,
      fecha: new Date(),
      ip: req.ip
    });
    await material.save();
    
    respondSuccess(req, res, 200, {
      url,
      filename: material.filename,
      expiresIn: expiry,
      expiresAt: new Date(Date.now() + expiry * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error generando URL de descarga:', error);
    respondError(req, res, 500, "Error generando URL de descarga");
  }
}

/**
 * Lista materiales con URLs prefirmadas incluidas
 */
export async function listMaterialsWithUrls(req, res) {
  try {
    console.log('📋 listMaterialsWithUrls - Iniciando');
    console.log('👤 Usuario:', req.email);
    console.log('🔑 Roles:', req.roles);
    
    // Debug roles adicional
    const isAdmin = isUserAdmin(req);
    const isProfesor = isUserProfesor(req);
    console.log("🔍 Role detection:", { isAdmin, isProfesor });
    
    let query = {};
    
    // Filtrar por permisos
    if (isAdmin) {
      // Admin ve todo
      console.log('👑 Usuario admin: mostrando todos los materiales');
    } else if (isProfesor) {
      // Profesor ve sus materiales + materiales públicos
      console.log('👨‍🏫 Usuario profesor: mostrando materiales propios y públicos');
      query = {
        $or: [
          { usuario: req.email },
          { bucketTipo: 'publico' }
        ]
      };
    } else {
      // Usuario normal ve públicos + sus privados
      console.log('👤 Usuario normal: materiales públicos + privados propios');
      query = {
        $or: [
          { bucketTipo: 'publico' },
          { usuario: req.email }
        ]
      };
    }
    
    console.log('🔍 Query aplicada:', JSON.stringify(query, null, 2));
    
    const materials = await Material.find(query).select('-accesos').sort({ fechaSubida: -1 });
    console.log(`📊 Materiales encontrados en BD: ${materials.length}`);
    
    // Para materiales públicos, generar URLs directas
    // Para materiales privados, generar URLs prefirmadas cortas (15 min)
    const materialsWithUrls = await Promise.all(
      materials.map(async (material) => {
        // Usar URLs que apuntan a nuestro backend en lugar de MinIO directamente
        let viewUrl, downloadUrl;
        
        try {
          if (material.bucketTipo === 'publico' || canUserAccessMaterial(req, material)) {
            // URL para visualizar en navegador (streaming)
            viewUrl = `/api/materials/serve/${material._id}`;
            
            // URL para descargar como archivo adjunto
            downloadUrl = `/api/materials/download/${material._id}`;
            
            console.log(`🔒 URLs de backend generadas para: ${material.filename}`);
          } else {
            console.log(`❌ Sin acceso a: ${material.filename}`);
            viewUrl = null;
            downloadUrl = null;
          }
        } catch (error) {
          console.error(`❌ Error generando URLs para ${material.filename}:`, error.message);
          viewUrl = null;
          downloadUrl = null;
        }
        
        return {
          ...material.toObject(),
          viewUrl,
          downloadUrl,
          urlType: 'backend', // Ahora todas las URLs son servidas por el backend
          urlExpiresAt: null  // No expira porque se verifica el acceso en cada solicitud
        };
      })
    );
    
    console.log(`✅ Enviando ${materialsWithUrls.length} materiales con URLs al frontend`);
    
    // Estadísticas para debugging
    const publicos = materialsWithUrls.filter(m => m.bucketTipo === 'publico');
    const privados = materialsWithUrls.filter(m => m.bucketTipo === 'privado');
    const conUrl = materialsWithUrls.filter(m => m.downloadUrl);
    
    console.log('📊 Estadísticas:');
    console.log(`  - Públicos: ${publicos.length}`);
    console.log(`  - Privados: ${privados.length}`);
    console.log(`  - Con URL válida: ${conUrl.length}`);
    
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
    
    const bucket = material.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    // Eliminar archivo de MinIO
    try {
      await minioClient.removeObject(bucket, material.filename);
    } catch (minioError) {
      console.warn('Archivo no encontrado en MinIO:', minioError.message);
    }
    
    // Eliminar registro de BD
    await Material.findByIdAndDelete(materialId);
    
    // Limpiar cache
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
 * Esta función se ejecuta al iniciar la aplicación
 */
export async function initializeBucket() {
  try {
    const bucketExists = await minioClient.bucketExists(BUCKET);
    if (!bucketExists) {
      await minioClient.makeBucket(BUCKET);
      console.log(`✅ Bucket '${BUCKET}' creado exitosamente`);
    } else {
      console.log(`✅ Bucket '${BUCKET}' ya existe`);
    }
    
    // Crear bucket para imágenes públicas si no existe
    const publicBucket = process.env.MINIO_PUBLIC_BUCKET || 'imagenes-publicas';
    const publicBucketExists = await minioClient.bucketExists(publicBucket);
    if (!publicBucketExists) {
      await minioClient.makeBucket(publicBucket);
      console.log(`✅ Bucket público '${publicBucket}' creado exitosamente`);
      
      // Configurar política para hacer público el bucket de imágenes
      const publicPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${publicBucket}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(publicBucket, JSON.stringify(publicPolicy));
      console.log(`✅ Política pública aplicada a '${publicBucket}'`);
    } else {
      console.log(`✅ Bucket público '${publicBucket}' ya existe`);
    }
    
    // Ya no necesitamos configurar CORS ya que ahora servimos los archivos a través del backend
    console.log("✅ Políticas de acceso configuradas correctamente");
  } catch (error) {
    console.error("❌ Error inicializando buckets:", error);
    throw error;
  }
}

/**
 * Ruta de prueba para verificar conexión a MinIO
 * Endpoint: GET /api/materials/test-minio
 */
export async function testMinioConnection(req, res) {
  try {
    // Verificar que MinIO esté operativo
    const bucketExists = await minioClient.bucketExists(BUCKET);
    
    // Generar una URL de prueba para verificar que las URLs prefirmadas funcionen
    const objectName = `test-${Date.now()}.txt`;
    const uploadUrl = await minioClient.presignedPutObject(
      BUCKET, 
      objectName, 
      60 * 5 // 5 minutos
    );
    
    // Intentar listar algunos objetos
    const objects = await minioClient.listObjects(BUCKET, '', true, { maxKeys: 5 })
    
    // Obtener información del bucket
    let bucketInfo = "No disponible";
    try {
      const policy = await minioClient.getBucketPolicy(BUCKET);
      bucketInfo = { policy };
    } catch (e) {
      bucketInfo = { error: e.message };
    }
    
    // Probar obteniendo política (que puede incluir CORS)
    let corsInfo = "No disponible";
    try {
      const policy = await minioClient.getBucketPolicy(BUCKET);
      corsInfo = { policy };
    } catch (e) {
      corsInfo = { error: e.message };
    }
    
    // Devolver toda la información de diagnóstico
    return respondSuccess(req, res, 200, {
      minioConnection: "OK",
      bucketExists,
      testUploadUrl: uploadUrl,
      bucketInfo,
      corsInfo,
      objects: Array.isArray(objects) ? objects.slice(0, 5) : "No objects found"
    });
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

/**
 * Sirve el archivo directamente a través del backend
 * Endpoint: GET /api/materials/serve/:id
 * Soporta autenticación por token en la URL (para imágenes en tags <img>)
 */
export async function serveFile(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    console.log(`🔍 Solicitando archivo con ID: ${id}`);
    
    // Si se proporciona token en la URL o no hay usuario autenticado, verificamos el token
    if (token && !req.email) {
      try {
        console.log(`🔑 Verificando token de URL: ${token.substring(0, 15)}...`);
        
        // Usar la misma clave secreta que en el middleware de autenticación
        
        // Verificar el token
        const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
        
        console.log(`✅ Token verificado para usuario: ${decoded.email}`);
        
        // Asignar datos de usuario al request para que funcione canUserAccessMaterial
        req.email = decoded.email;
        req.roles = decoded.roles || [];
        
        console.log(`🔑 Token URL validado para: ${decoded.email}, roles: ${JSON.stringify(req.roles)}`);
      } catch (tokenError) {
        console.error(`❌ Error validando token URL: ${tokenError.message}`);
        console.error(`❌ Stack: ${tokenError.stack}`);
        // No establecemos req.email, lo que hará que fallen las verificaciones de permisos normales,
        // pero comprobaremos si el material es público más adelante
      }
    } else {
      console.log(`👤 Usuario ya autenticado: ${req.email || 'No hay usuario autenticado'}`);
    }
    
    // Verificar permisos
    const material = await Material.findById(id);
    if (!material) {
      console.log(`❌ Material no encontrado: ${id}`);
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    // Verificar permisos de acceso (usando el usuario del token o del middleware de autenticación)
    if (!canUserAccessMaterial(req, material)) {
      console.log(`❌ Sin permisos para acceder al material: ${id}, usuario: ${req.email || 'anónimo'}`);
      return respondError(req, res, 403, "Sin permisos para acceder a este material");
    }
    
    // Determinar bucket correcto
    const bucket = material.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    console.log(`📦 Sirviendo archivo desde bucket ${bucket}, archivo: ${material.filename}`);
    
    try {
      // Obtener stream del archivo
      const fileStream = await minioClient.getObject(bucket, material.filename);
      
      // Configurar cabeceras de la respuesta
      res.setHeader('Content-Type', material.tipoContenido || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${material.nombre}"`);
      
      // Registrar acceso
      console.log(`✅ Archivo servido correctamente: ${material.filename} a ${req.email}`);
      
      // Transmitir el archivo al cliente
      fileStream.pipe(res);
    } catch (minioError) {
      console.error(`❌ Error obteniendo archivo de MinIO: ${minioError.message}`);
      return respondError(req, res, 500, "Error obteniendo archivo");
    }
  } catch (error) {
    console.error(`❌ Error general sirviendo archivo: ${error.message}`);
    return respondError(req, res, 500, "Error al procesar la solicitud");
  }
}

/**
 * Descarga de archivo como adjunto
 * Endpoint: GET /api/materials/download/:id
 * Soporta autenticación por token en la URL
 */
export async function downloadFile(req, res) {
  try {
    const { id } = req.params;
    const { token } = req.query;
    
    console.log(`🔍 Solicitando descarga con ID: ${id}`);
    
    // Si se proporciona token en la URL o no hay usuario autenticado, verificamos el token
    if (token && !req.email) {
      try {
        console.log(`🔑 Verificando token de URL: ${token.substring(0, 15)}...`);
        
        // Usar la misma clave secreta que en el middleware de autenticación
        
        // Verificar el token
        const decoded = jwt.verify(token, ACCESS_JWT_SECRET);
        
        console.log(`✅ Token verificado para usuario: ${decoded.email}`);
        
        // Asignar datos de usuario al request para que funcione canUserAccessMaterial
        req.email = decoded.email;
        req.roles = decoded.roles || [];
        
        console.log(`🔑 Token URL validado para: ${decoded.email}, roles: ${JSON.stringify(req.roles)}`);
      } catch (tokenError) {
        console.error(`❌ Error validando token URL: ${tokenError.message}`);
        console.error(`❌ Stack: ${tokenError.stack}`);
        // No establecemos req.email, lo que hará que fallen las verificaciones de permisos normales,
        // pero comprobaremos si el material es público más adelante
      }
    } else {
      console.log(`👤 Usuario ya autenticado: ${req.email || 'No hay usuario autenticado'}`);
    }
    
    // Verificar permisos
    const material = await Material.findById(id);
    if (!material) {
      console.log(`❌ Material no encontrado: ${id}`);
      return respondError(req, res, 404, "Material no encontrado");
    }
    
    // Verificar permisos de acceso - permitir archivos públicos sin autenticación
    if (material.bucketTipo === 'publico') {
      console.log(`🌐 Material público, permitido sin autenticación: ${id}`);
    } else if (!canUserAccessMaterial(req, material)) {
      console.log(`❌ Sin permisos para acceder al material: ${id}, usuario: ${req.email || 'anónimo'}`);
      return respondError(req, res, 403, "Sin permisos para acceder a este material");
    }
    
    // Determinar bucket correcto
    const bucket = material.bucketTipo === 'publico' ? 
      process.env.MINIO_PUBLIC_BUCKET : BUCKET;
    
    console.log(`📦 Descargando archivo desde bucket ${bucket}, archivo: ${material.filename}`);
    
    try {
      // Obtener stream del archivo
      const fileStream = await minioClient.getObject(bucket, material.filename);
      
      // Configurar cabeceras para descarga como adjunto
      res.setHeader('Content-Type', material.tipoContenido || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${material.nombre}"`);
      
      // Registrar acceso
      console.log(`✅ Archivo descargado correctamente: ${material.filename} por ${req.email}`);
      
      // Transmitir el archivo al cliente
      fileStream.pipe(res);
    } catch (minioError) {
      console.error(`❌ Error obteniendo archivo de MinIO: ${minioError.message}`);
      return respondError(req, res, 500, "Error obteniendo archivo");
    }
  } catch (error) {
    console.error(`❌ Error general descargando archivo: ${error.message}`);
    return respondError(req, res, 500, "Error al procesar la solicitud");
  }
}
