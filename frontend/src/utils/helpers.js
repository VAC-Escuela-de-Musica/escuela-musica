/**
 * Utilidades auxiliares para el frontend
 */

/**
 * Formatea una fecha a formato legible en español
 * @param {string|Date} dateString - La fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

/**
 * Formatea el tamaño de archivo a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return 'N/A';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return bytes + ' ' + sizes[i];
  
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

/**
 * Obtiene el tipo de archivo basado en la extensión
 * @param {string} filename - Nombre del archivo
 * @returns {string} Tipo de archivo
 */
export const getFileTypeFromExtension = (filename) => {
  if (!filename) return 'Desconocido';
  
  const extension = filename.toLowerCase().split('.').pop();
  
  const typeMap = {
    // Imágenes
    'jpg': 'Imagen',
    'jpeg': 'Imagen',
    'png': 'Imagen',
    'gif': 'Imagen',
    'webp': 'Imagen',
    'svg': 'Imagen',
    'bmp': 'Imagen',
    
    // Documentos
    'pdf': 'PDF',
    'doc': 'Documento',
    'docx': 'Documento',
    'txt': 'Texto',
    'rtf': 'Documento',
    
    // Hojas de cálculo
    'xls': 'Hoja de Cálculo',
    'xlsx': 'Hoja de Cálculo',
    'csv': 'CSV',
    
    // Presentaciones
    'ppt': 'Presentación',
    'pptx': 'Presentación',
    
    // Audio
    'mp3': 'Audio',
    'wav': 'Audio',
    'flac': 'Audio',
    'aac': 'Audio',
    'm4a': 'Audio',
    'ogg': 'Audio',
    
    // Video
    'mp4': 'Video',
    'avi': 'Video',
    'mov': 'Video',
    'wmv': 'Video',
    'flv': 'Video',
    'webm': 'Video',
    'mkv': 'Video',
    
    // Código
    'js': 'JavaScript',
    'jsx': 'React',
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'xml': 'XML',
    
    // Archivos comprimidos
    'zip': 'ZIP',
    'rar': 'RAR',
    '7z': '7-Zip',
    'tar': 'TAR',
    'gz': 'GZIP'
  };
  
  return typeMap[extension] || 'Archivo';
};

/**
 * Obtiene el icono apropiado para un tipo de contenido
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {string} Emoji del icono
 */
export const getFileTypeIcon = (mimeType) => {
  if (!mimeType) return '📎';
  
  const type = mimeType.toLowerCase();
  
  // Imágenes
  if (type.startsWith('image/')) return '🖼️';
  
  // Audio
  if (type.startsWith('audio/')) return '🎵';
  
  // Video
  if (type.startsWith('video/')) return '🎬';
  
  // Documentos específicos
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📺';
  
  // Texto
  if (type.startsWith('text/')) return '📄';
  
  // Archivos comprimidos
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️';
  
  // Por defecto
  return '📎';
};

/**
 * Verifica si un archivo es una imagen
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {boolean} True si es imagen
 */
export const isImageFile = (mimeType) => {
  return mimeType && mimeType.startsWith('image/');
};

/**
 * Verifica si un archivo es un PDF
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {boolean} True si es PDF
 */
export const isPDFFile = (mimeType) => {
  return mimeType === 'application/pdf';
};

/**
 * Verifica si un archivo es de audio
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {boolean} True si es audio
 */
export const isAudioFile = (mimeType) => {
  return mimeType && mimeType.startsWith('audio/');
};

/**
 * Verifica si un archivo es de video
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {boolean} True si es video
 */
export const isVideoFile = (mimeType) => {
  return mimeType && mimeType.startsWith('video/');
};

/**
 * Obtiene una descripción legible del tipo MIME
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {string} Descripción legible
 */
export const getMimeTypeDescription = (mimeType) => {
  if (!mimeType) return 'Tipo desconocido';
  
  if (isImageFile(mimeType)) return 'Imagen';
  if (isAudioFile(mimeType)) return 'Audio';
  if (isVideoFile(mimeType)) return 'Video';
  if (isPDFFile(mimeType)) return 'Documento PDF';
  
  if (mimeType.includes('word') || mimeType.includes('document')) return 'Documento de Word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Hoja de Excel';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentación';
  if (mimeType.startsWith('text/')) return 'Archivo de texto';
  
  return 'Archivo';
};

/**
 * Valida si una URL es válida
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válida
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
