import { minioService } from './minio.service.js';
import { v4 as uuidv4 } from 'uuid';

class FileService {
  constructor() {
    this.allowedExtensions = {
      document: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
      video: ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'],
      audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
      presentation: ['.ppt', '.pptx'],
      spreadsheet: ['.xls', '.xlsx'],
      archive: ['.zip', '.rar', '.7z']
    };
    
    this.maxFileSizes = {
      document: 50 * 1024 * 1024,        // 50MB
      image: 10 * 1024 * 1024,           // 10MB
      video: 500 * 1024 * 1024,          // 500MB
      audio: 50 * 1024 * 1024,           // 50MB
      presentation: 100 * 1024 * 1024,   // 100MB
      spreadsheet: 25 * 1024 * 1024,     // 25MB
      archive: 100 * 1024 * 1024         // 100MB
    };
  }
  
  /**
   * Prepara la subida de un archivo
   */
  async prepareUpload(material, uploadOptions) {
    const { extension, contentType, user } = uploadOptions;
    
    // Determinar tipo de archivo basado en extensión
    const fileType = this.getFileTypeFromExtension(extension);
    
    // Validar extensión
    if (!this.isValidExtension(extension, fileType)) {
      throw new Error(`Extensión ${extension} no permitida para tipo ${fileType}`);
    }
    
    // Usar filename existente o generar uno nuevo
    const filename = material.filename || this.generateUniqueFilename(extension);
    
    // Determinar bucket
    const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
    
    // Preparar headers para MinIO
    const headers = {
      'Content-Type': contentType,
      'X-Amz-Meta-Original-Name': material.nombre,
      'X-Amz-Meta-User': user.email
    };
    
    // Solo agregar Material-Id si existe
    if (material._id) {
      headers['X-Amz-Meta-Material-Id'] = material._id.toString();
    }
    
    // Solo agregar tipo de archivo si se determinó
    if (fileType) {
      headers['X-Amz-Meta-File-Type'] = fileType;
    }
    
    // Generar URL de subida
    const uploadData = await minioService.generateUploadUrl(
      bucketType, 
      filename, 
      300, // 5 minutos
      headers
    );
    
    return {
      ...uploadData,
      filename,
      bucketType,
      fileType,
      maxSize: this.maxFileSizes[fileType] || this.maxFileSizes.document
    };
  }
  
  /**
   * Verifica que un archivo fue subido correctamente
   */
  async verifyUpload(filename, bucketTipo) {
    const bucketType = bucketTipo === 'publico' ? 'public' : 'private';
    const fileInfo = await minioService.fileExists(bucketType, filename);
    
    if (!fileInfo.exists) {
      throw new Error('El archivo no fue subido correctamente');
    }
    
    return fileInfo;
  }
  
  /**
   * Prepara la descarga de un archivo
   */
  async prepareDownload(material, downloadOptions = {}) {
    const { action = 'download', duration = 300 } = downloadOptions;
    
    // Verificar que el archivo existe
    const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
    
    try {
      const fileInfo = await minioService.fileExists(bucketType, material.filename);
      if (!fileInfo.exists) {
        throw new Error('Archivo no encontrado en MinIO');
      }
      
      // Preparar headers de respuesta
      const responseHeaders = {};
      if (action === 'download') {
        responseHeaders['response-content-disposition'] = 
          `attachment; filename="${material.nombre}"`;
      } else if (action === 'view') {
        responseHeaders['response-content-type'] = material.tipoContenido;
        responseHeaders['response-cache-control'] = 'public, max-age=300';
      }
      
      // Generar URL de descarga
      const downloadData = await minioService.generateDownloadUrl(
        bucketType,
        material.filename,
        duration,
        responseHeaders
      );
      
      return {
        ...downloadData,
        action,
        fileSize: fileInfo.size,
        contentType: material.tipoContenido
      };
    } catch (error) {
      console.error('Error preparando descarga:', error);
      throw new Error(`Error preparando descarga: ${error.message}`);
    }
  }
  
  /**
   * Elimina un archivo
   */
  async deleteFile(material) {
    try {
      const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
      await minioService.deleteFile(bucketType, material.filename);
      return true;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }
  }
  
  /**
   * Validaciones
   */
  isValidExtension(extension, materialType) {
    // Determinar el tipo de material basado en la extensión si no se proporciona
    if (!materialType || materialType === 'document') {
      materialType = this.getFileTypeFromExtension(extension);
    }
    
    const allowed = this.allowedExtensions[materialType] || this.allowedExtensions.document;
    const ext = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : '.' + extension.toLowerCase();
    return allowed.includes(ext);
  }
  
  /**
   * Determina el tipo de archivo basado en la extensión
   */
  getFileTypeFromExtension(extension) {
    const ext = extension.toLowerCase().startsWith('.') ? extension.toLowerCase() : '.' + extension.toLowerCase();
    
    for (const [type, extensions] of Object.entries(this.allowedExtensions)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }
    
    return 'document'; // Por defecto
  }
  
  /**
   * Genera un nombre único para archivo
   */
  generateUniqueFilename(extension) {
    const ext = extension.startsWith('.') ? extension : '.' + extension;
    return `${uuidv4()}${ext}`;
  }
  
  /**
   * Obtiene stream para fallback
   */
  async getFileStreamForFallback(material) {
    const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
    return await minioService.getFileStream(bucketType, material.filename);
  }
  
  /**
   * Obtiene información de archivo sin descargarlo
   */
  async getFileInfo(material) {
    const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
    return await minioService.fileExists(bucketType, material.filename);
  }

  /**
   * Genera URLs presignadas para vista previa y descarga
   */
  async generatePresignedUrls(material, expiryInSeconds = 3600) {
    try {
      const bucketType = material.bucketTipo === 'publico' ? 'public' : 'private';
      const filename = material.filename;
      
      console.log(`🔗 Generando URLs presignadas para: ${filename} en bucket ${bucketType}`);
      
      // Generar URL de vista (GET)
      const viewUrl = await minioService.getPresignedUrl('GET', bucketType, filename, expiryInSeconds);
      
      // Generar URL de descarga (GET con headers de descarga)
      const downloadUrl = await minioService.getPresignedUrl('GET', bucketType, filename, expiryInSeconds, {
        'response-content-disposition': `attachment; filename="${material.nombre || filename}"`
      });
      
      console.log(`✅ URLs generadas exitosamente para ${filename}`);
      
      return {
        viewUrl,
        downloadUrl,
        expiresAt: new Date(Date.now() + expiryInSeconds * 1000)
      };
    } catch (error) {
      console.error('❌ Error generando URLs presignadas:', error);
      throw new Error(`Error generando URLs presignadas: ${error.message}`);
    }
  }
}

export const fileService = new FileService();
