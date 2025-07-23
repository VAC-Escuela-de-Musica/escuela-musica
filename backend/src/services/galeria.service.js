import Galeria from "../core/models/galeria.model.js";
import { handleError } from "../utils/errorHandler.util.js";

/**
 * Obtener todas las imágenes de la galería (para administración)
 */
async function getAllGallery() {
  try {
    const imagenes = await Galeria.find().sort({ orden: 1, createdAt: -1 }).exec();
    return {
      success: true,
      data: imagenes,
      message: "Galería obtenida exitosamente",
    };
  } catch (error) {
    handleError(error, "galeria.service -> getAllGallery");
    throw new Error("Error al obtener la galería");
  }
}

/**
 * Obtener galería activa (pública)
 */
async function getActiveGallery() {
  try {
    const imagenes = await Galeria.find({ activo: true })
      .sort({ orden: 1, createdAt: -1 })
      .exec();
    return {
      success: true,
      data: imagenes,
      message: "Galería activa obtenida exitosamente",
    };
  } catch (error) {
    handleError(error, "galeria.service -> getActiveGallery");
    throw new Error("Error al obtener la galería activa");
  }
}

/**
 * Obtener galería por categoría
 */
async function getGalleryByCategory(categoria) {
  try {
    const imagenes = await Galeria.find({ 
      categoria: categoria, 
      activo: true 
    })
      .sort({ orden: 1, createdAt: -1 })
      .exec();
    return {
      success: true,
      data: imagenes,
      message: `Galería de categoría ${categoria} obtenida exitosamente`,
    };
  } catch (error) {
    handleError(error, "galeria.service -> getGalleryByCategory");
    throw new Error(`Error al obtener la galería de la categoría ${categoria}`);
  }
}

/**
 * Obtener imagen por ID
 */
async function getImageById(id) {
  try {
    const imagen = await Galeria.findById(id).exec();
    if (!imagen) {
      throw new Error("Imagen no encontrada");
    }
    return {
      success: true,
      data: imagen,
      message: "Imagen obtenida exitosamente",
    };
  } catch (error) {
    if (error.message === "Imagen no encontrada") {
      throw error;
    }
    handleError(error, "galeria.service -> getImageById");
    throw new Error("Error al obtener la imagen");
  }
}

/**
 * Crear nueva imagen
 */
async function createImage(imageData) {
  try {
    // Obtener el siguiente número de orden
    const lastImage = await Galeria.findOne().sort({ orden: -1 }).exec();
    const nextOrder = lastImage ? lastImage.orden + 1 : 0;

    const nuevaImagen = new Galeria({
      ...imageData,
      orden: nextOrder,
    });

    const imagenGuardada = await nuevaImagen.save();
    return {
      success: true,
      data: imagenGuardada,
      message: "Imagen creada exitosamente",
    };
  } catch (error) {
    handleError(error, "galeria.service -> createImage");
    throw new Error("Error al crear la imagen");
  }
}

/**
 * Actualizar imagen
 */
async function updateImage(id, imageData) {
  try {
    const imagenActualizada = await Galeria.findByIdAndUpdate(
      id, 
      imageData, 
      { 
        new: true, 
        runValidators: true 
      }
    ).exec();

    if (!imagenActualizada) {
      throw new Error("Imagen no encontrada");
    }

    return {
      success: true,
      data: imagenActualizada,
      message: "Imagen actualizada exitosamente",
    };
  } catch (error) {
    if (error.message === "Imagen no encontrada") {
      throw error;
    }
    handleError(error, "galeria.service -> updateImage");
    throw new Error("Error al actualizar la imagen");
  }
}

/**
 * Eliminar imagen
 */
async function deleteImage(id) {
  try {
    const imagenEliminada = await Galeria.findByIdAndDelete(id).exec();
    if (!imagenEliminada) {
      throw new Error("Imagen no encontrada");
    }

    return {
      success: true,
      message: "Imagen eliminada exitosamente",
    };
  } catch (error) {
    if (error.message === "Imagen no encontrada") {
      throw error;
    }
    handleError(error, "galeria.service -> deleteImage");
    throw new Error("Error al eliminar la imagen");
  }
}

/**
 * Cambiar estado activo/inactivo
 */
async function toggleImageStatus(id) {
  try {
    const imagen = await Galeria.findById(id).exec();
    if (!imagen) {
      throw new Error("Imagen no encontrada");
    }

    imagen.activo = !imagen.activo;
    const imagenActualizada = await imagen.save();

    return {
      success: true,
      data: imagenActualizada,
      message: `Imagen ${imagenActualizada.activo ? 'activada' : 'desactivada'} exitosamente`,
    };
  } catch (error) {
    if (error.message === "Imagen no encontrada") {
      throw error;
    }
    handleError(error, "galeria.service -> toggleImageStatus");
    throw new Error("Error al cambiar el estado de la imagen");
  }
}

/**
 * Actualizar orden de imágenes
 */
async function updateImageOrder(ordenData) {
  try {
    const updatePromises = ordenData.map(async (item) => {
      return await Galeria.findByIdAndUpdate(
        item.id,
        { orden: item.orden },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    return {
      success: true,
      message: "Orden de imágenes actualizado exitosamente",
    };
  } catch (error) {
    handleError(error, "galeria.service -> updateImageOrder");
    throw new Error("Error al actualizar el orden de las imágenes");
  }
}

/**
 * Generar URL de imagen (placeholder para URLs prefirmadas si es necesario)
 */
async function getImageUrl(imagen, options = {}) {
  try {
    // En este caso, las imágenes ya tienen URL pública directa
    // Pero se puede extender para URLs prefirmadas si es necesario
    return {
      success: true,
      data: {
        url: imagen.imagen,
        action: options.action || 'view',
        expiresIn: options.duration || 3600,
      },
      message: "URL de imagen generada exitosamente",
    };
  } catch (error) {
    handleError(error, "galeria.service -> getImageUrl");
    throw new Error("Error al generar URL de imagen");
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
  getImageUrl,
};