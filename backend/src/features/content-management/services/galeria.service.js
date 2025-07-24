import Galeria from '../../../core/models/galeria.model.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Obtener todas las imágenes de la galería (para administración)
 */
async function getAllGallery () {
  try {
    const imagenes = await Galeria.find().sort({ orden: 1, createdAt: -1 }).exec()
    return {
      success: true,
      data: imagenes,
      message: 'Galería obtenida exitosamente'
    }
  } catch (error) {
    handleError(error, 'galeria.service -> getAllGallery')
    throw new Error('Error al obtener la galería')
  }
}

/**
 * Obtener galería activa (pública)
 */
async function getActiveGallery () {
  try {
    const imagenes = await Galeria.find({ activo: true })
      .sort({ orden: 1, createdAt: -1 })
      .exec()
    return {
      success: true,
      data: imagenes,
      message: 'Galería activa obtenida exitosamente'
    }
  } catch (error) {
    handleError(error, 'galeria.service -> getActiveGallery')
    throw new Error('Error al obtener la galería activa')
  }
}

/**
 * Obtener galería por categoría
 */
async function getGalleryByCategory (categoria) {
  try {
    const imagenes = await Galeria.find({
      categoria,
      activo: true
    })
      .sort({ orden: 1, createdAt: -1 })
      .exec()
    return {
      success: true,
      data: imagenes,
      message: `Galería de categoría ${categoria} obtenida exitosamente`
    }
  } catch (error) {
    handleError(error, 'galeria.service -> getGalleryByCategory')
    throw new Error(`Error al obtener la galería de la categoría ${categoria}`)
  }
}

/**
 * Obtener imagen por ID
 */
async function getImageById (id) {
  try {
    const imagen = await Galeria.findById(id).exec()
    if (!imagen) {
      throw new Error('Imagen no encontrada')
    }
    return {
      success: true,
      data: imagen,
      message: 'Imagen obtenida exitosamente'
    }
  } catch (error) {
    if (error.message === 'Imagen no encontrada') {
      throw error
    }
    handleError(error, 'galeria.service -> getImageById')
    throw new Error('Error al obtener la imagen')
  }
}

/**
 * Crear nueva imagen
 */
async function createImage (imageData) {
  try {
    // Obtener el siguiente número de orden
    const lastImage = await Galeria.findOne().sort({ orden: -1 }).exec()
    const nextOrder = lastImage ? lastImage.orden + 1 : 0

    const nuevaImagen = new Galeria({
      ...imageData,
      orden: nextOrder
    })

    const imagenGuardada = await nuevaImagen.save()
    return {
      success: true,
      data: imagenGuardada,
      message: 'Imagen creada exitosamente'
    }
  } catch (error) {
    handleError(error, 'galeria.service -> createImage')
    throw new Error('Error al crear la imagen')
  }
}

/**
 * Actualizar imagen
 */
async function updateImage (id, imageData) {
  try {
    // Validar y sanitizar imageData
    const allowedFields = ['titulo', 'descripcion', 'categoria', 'activo', 'imagen', 'orden']; // Ajusta según tu modelo
    const sanitizedData = {};
    for (const key in imageData) {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = imageData[key];
      }
    }

    const imagenActualizada = await Galeria.findByIdAndUpdate(
      id,
      { $set: sanitizedData }, // Usar $set para evitar inyección
      {
        new: true,
        runValidators: true
      }
    ).exec();

    if (!imagenActualizada) {
      throw new Error('Imagen no encontrada');
    }

    return {
      success: true,
      data: imagenActualizada,
      message: 'Imagen actualizada exitosamente'
    };
  } catch (error) {
    if (error.message === 'Imagen no encontrada') {
      throw error;
    }
    handleError(error, 'galeria.service -> updateImage');
    throw new Error('Error al actualizar la imagen');
  }
}

/**
 * Eliminar imagen
 */
async function deleteImage (id) {
  try {
    const imagenEliminada = await Galeria.findByIdAndDelete(id).exec()
    if (!imagenEliminada) {
      throw new Error('Imagen no encontrada')
    }

    return {
      success: true,
      message: 'Imagen eliminada exitosamente'
    }
  } catch (error) {
    if (error.message === 'Imagen no encontrada') {
      throw error
    }
    handleError(error, 'galeria.service -> deleteImage')
    throw new Error('Error al eliminar la imagen')
  }
}

/**
 * Cambiar estado activo/inactivo
 */
async function toggleImageStatus (id) {
  try {
    const imagen = await Galeria.findById(id).exec()
    if (!imagen) {
      throw new Error('Imagen no encontrada')
    }

    imagen.activo = !imagen.activo
    const imagenActualizada = await imagen.save()

    return {
      success: true,
      data: imagenActualizada,
      message: `Imagen ${imagenActualizada.activo ? 'activada' : 'desactivada'} exitosamente`
    }
  } catch (error) {
    if (error.message === 'Imagen no encontrada') {
      throw error
    }
    handleError(error, 'galeria.service -> toggleImageStatus')
    throw new Error('Error al cambiar el estado de la imagen')
  }
}

/**
 * Actualizar orden de imágenes
 */
async function updateImageOrder (ordenData) {
  try {
    const updatePromises = ordenData.map(async (item) => {
      return await Galeria.findByIdAndUpdate(
        item.id,
        { orden: item.orden },
        { new: true }
      )
    })

    await Promise.all(updatePromises)

    return {
      success: true,
      message: 'Orden de imágenes actualizado exitosamente'
    }
  } catch (error) {
    handleError(error, 'galeria.service -> updateImageOrder')
    throw new Error('Error al actualizar el orden de las imágenes')
  }
}

/**
 * Generar URL presignada de imagen para evitar problemas de CORS
 */
async function getImageUrl (imagen, options = {}) {
  try {
    const { minioService } = await import('../../../services/index.js')
    let finalUrl = imagen.imagen
    
    // Extraer el nombre del archivo y determinar el bucket
    let filename = ''
    let bucketType = 'galery'
    
    if (finalUrl && finalUrl.includes('imagenes-publicas')) {
      // Imagen del bucket legacy
      console.log('🔄 Generando URL presignada para imagen legacy:', finalUrl)
      filename = finalUrl.split('/imagenes-publicas/')[1]
      bucketType = 'public'
    } else if (finalUrl && finalUrl.includes('galeria-imagenes')) {
      // Imagen del bucket correcto
      console.log('✅ Generando URL presignada para imagen de galería:', finalUrl)
      filename = finalUrl.split('/galeria-imagenes/')[1]
      bucketType = 'galery'
    }
    
    // Si tenemos un filename válido, generar URL presignada
    if (filename) {
      try {
        const presignedData = await minioService.generateDownloadUrl(
          bucketType, 
          filename, 
          options.duration || 3600
        )
        
        return {
          success: true,
          data: {
            url: presignedData.url,
            action: options.action || 'view',
            expiresIn: options.duration || 3600
          },
          message: 'URL presignada generada exitosamente'
        }
      } catch (presignedError) {
        console.log('⚠️ Error generando URL presignada, usando URL original:', presignedError.message)
      }
    }
    
    // Fallback: devolver la URL original
    return {
      success: true,
      data: {
        url: finalUrl,
        action: options.action || 'view',
        expiresIn: options.duration || 3600
      },
      message: 'URL de imagen obtenida (fallback)'
    }
  } catch (error) {
    handleError(error, 'galeria.service -> getImageUrl')
    throw new Error('Error al generar URL de imagen')
  }
}

export const galeriaService = {
  getAllGallery,
  getActiveGallery,
  getGalleryByCategory,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  toggleImageStatus,
  updateImageOrder,
  getImageUrl
}
