import Galeria from '../models/galeria.entity.js';

class GaleriaService {
  /**
   * Obtener todas las imágenes de galería activas
   */
  async getActiveGallery() {
    try {
      const galeria = await Galeria.getActiveGallery();
      return {
        success: true,
        data: galeria,
        message: 'Galería obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error obteniendo galería activa:', error);
      throw new Error('Error al obtener la galería');
    }
  }

  /**
   * Obtener galería por categoría
   */
  async getGalleryByCategory(categoria) {
    try {
      const galeria = await Galeria.getGalleryByCategory(categoria);
      return {
        success: true,
        data: galeria,
        message: `Galería de categoría ${categoria} obtenida exitosamente`
      };
    } catch (error) {
      console.error('Error obteniendo galería por categoría:', error);
      throw new Error('Error al obtener la galería por categoría');
    }
  }

  /**
   * Obtener todas las imágenes (para administración)
   */
  async getAllGallery() {
    try {
      const galeria = await Galeria.find()
        .sort({ orden: 1, fechaCreacion: -1 });
      
      return {
        success: true,
        data: galeria,
        message: 'Galería completa obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error obteniendo galería completa:', error);
      throw new Error('Error al obtener la galería completa');
    }
  }

  /**
   * Obtener imagen por ID
   */
  async getImageById(id) {
    try {
      const imagen = await Galeria.findById(id);
      if (!imagen) {
        throw new Error('Imagen no encontrada');
      }
      
      return {
        success: true,
        data: imagen,
        message: 'Imagen obtenida exitosamente'
      };
    } catch (error) {
      console.error('Error obteniendo imagen por ID:', error);
      throw error;
    }
  }

  /**
   * Crear nueva imagen en galería
   */
  async createImage(imageData) {
    try {
      const nuevaImagen = new Galeria(imageData);
      await nuevaImagen.save();
      
      // Auditoría (comentado hasta implementar auditService)
      // await auditService.logGalleryAction(nuevaImagen, 'create', {
      //   action: 'create_image',
      //   details: `Nueva imagen creada: ${nuevaImagen.titulo}`
      // });
      
      return {
        success: true,
        data: nuevaImagen,
        message: 'Imagen creada exitosamente'
      };
    } catch (error) {
      console.error('Error creando imagen:', error);
      throw new Error('Error al crear la imagen');
    }
  }

  /**
   * Actualizar imagen
   */
  async updateImage(id, updateData) {
    try {
      const imagen = await Galeria.findByIdAndUpdate(
        id,
        { ...updateData, fechaActualizacion: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!imagen) {
        throw new Error('Imagen no encontrada');
      }
      
      // Auditoría (comentado hasta implementar auditService)
      // await auditService.logGalleryAction(imagen, 'update', {
      //   action: 'update_image',
      //   details: `Imagen actualizada: ${imagen.titulo}`
      // });
      
      return {
        success: true,
        data: imagen,
        message: 'Imagen actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando imagen:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen
   */
  async deleteImage(id) {
    try {
      const imagen = await Galeria.findById(id);
      if (!imagen) {
        throw new Error('Imagen no encontrada');
      }
      
      // Eliminar archivo de MinIO si existe (comentado hasta implementar fileService)
      // try {
      //   await fileService.deleteFile(imagen.bucket, imagen.imagen);
      // } catch (fileError) {
      //   console.warn('No se pudo eliminar archivo de MinIO:', fileError.message);
      // }
      
      await Galeria.findByIdAndDelete(id);
      
      // Auditoría (comentado hasta implementar auditService)
      // await auditService.logGalleryAction(imagen, 'delete', {
      //   action: 'delete_image',
      //   details: `Imagen eliminada: ${imagen.titulo}`
      // });
      
      return {
        success: true,
        message: 'Imagen eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado activo/inactivo
   */
  async toggleImageStatus(id) {
    try {
      const imagen = await Galeria.findById(id);
      if (!imagen) {
        throw new Error('Imagen no encontrada');
      }
      
      imagen.activo = !imagen.activo;
      await imagen.save();
      
      // Auditoría (comentado hasta implementar auditService)
      // await auditService.logGalleryAction(imagen, 'toggle_status', {
      //   action: 'toggle_image_status',
      //   details: `Estado cambiado a: ${imagen.activo ? 'activo' : 'inactivo'}`
      // });
      
      return {
        success: true,
        data: imagen,
        message: `Imagen ${imagen.activo ? 'activada' : 'desactivada'} exitosamente`
      };
    } catch (error) {
      console.error('Error cambiando estado de imagen:', error);
      throw error;
    }
  }

  /**
   * Actualizar orden de imágenes
   */
  async updateImageOrder(ordenData) {
    try {
      const updates = ordenData.map(item => ({
        updateOne: {
          filter: { _id: item.id },
          update: { orden: item.orden }
        }
      }));
      
      await Galeria.bulkWrite(updates);
      
      // Auditoría (comentado hasta implementar auditService)
      // await auditService.logGalleryAction(null, 'reorder', {
      //   action: 'reorder_images',
      //   details: `Orden actualizado para ${ordenData.length} imágenes`
      // });
      
      return {
        success: true,
        message: 'Orden de imágenes actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando orden de imágenes:', error);
      throw new Error('Error al actualizar el orden de las imágenes');
    }
  }

  /**
   * Obtener URL de imagen con autenticación
   */
  async getImageUrl(imagen, options = {}) {
    try {
      const { action = 'view', duration = 300 } = options;
      
      // Crear objeto similar a Material para compatibilidad con fileService (comentado)
      // const materialObject = {
      //   bucket: imagen.bucket,
      //   filename: imagen.imagen,
      //   bucketTipo: imagen.bucketTipo
      // };
      
      // const downloadData = await fileService.prepareDownload(materialObject, {
      //   action,
      //   duration: parseInt(duration)
      // });
      
      // Por ahora, devolver la URL directa
      const downloadData = {
        downloadUrl: imagen.imagen,
        expiresIn: duration
      };
      
      return {
        success: true,
        data: downloadData,
        message: 'URL de imagen generada exitosamente'
      };
    } catch (error) {
      console.error('Error generando URL de imagen:', error);
      throw new Error('Error al generar URL de imagen');
    }
  }
}

export const galeriaService = new GaleriaService();
export default galeriaService; 