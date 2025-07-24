import { galeriaService } from "../services/galeria.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";

/**
 * Obtener galería activa (pública)
 */
export const getActiveGallery = async (req, res) => {
  try {
    const result = await galeriaService.getActiveGallery();
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en getActiveGallery:", error);
    respondError(req, res, 500, "Error al obtener la galería");
  }
};

/**
 * Obtener galería por categoría (pública)
 */
export const getGalleryByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;
    const result = await galeriaService.getGalleryByCategory(categoria);
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en getGalleryByCategory:", error);
    respondError(req, res, 500, "Error al obtener la galería por categoría");
  }
};

/**
 * Obtener todas las imágenes (administración)
 */
export const getAllGallery = async (req, res) => {
  try {
    const result = await galeriaService.getAllGallery();
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en getAllGallery:", error);
    respondError(req, res, 500, "Error al obtener la galería completa");
  }
};

/**
 * Obtener imagen por ID
 */
export const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await galeriaService.getImageById(id);
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en getImageById:", error);
    if (error.message === "Imagen no encontrada") {
      respondError(req, res, 404, error.message);
    } else {
      respondError(req, res, 500, "Error al obtener la imagen");
    }
  }
};

/**
 * Crear nueva imagen
 */
export const createImage = async (req, res) => {
  try {
    const imageData = {
      ...req.body,
      usuario: req.email || req.user?.email
    };
    
    const result = await galeriaService.createImage(imageData);
    respondSuccess(req, res, 201, result.data, result.message);
  } catch (error) {
    console.error("Error en createImage:", error);
    respondError(req, res, 500, "Error al crear la imagen");
  }
};

/**
 * Actualizar imagen
 */
export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await galeriaService.updateImage(id, req.body);
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en updateImage:", error);
    if (error.message === "Imagen no encontrada") {
      respondError(req, res, 404, error.message);
    } else {
      respondError(req, res, 500, "Error al actualizar la imagen");
    }
  }
};

/**
 * Eliminar imagen
 */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await galeriaService.deleteImage(id);
    respondSuccess(req, res, 200, null, result.message);
  } catch (error) {
    console.error("Error en deleteImage:", error);
    if (error.message === "Imagen no encontrada") {
      respondError(req, res, 404, error.message);
    } else {
      respondError(req, res, 500, "Error al eliminar la imagen");
    }
  }
};

/**
 * Cambiar estado activo/inactivo
 */
export const toggleImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await galeriaService.toggleImageStatus(id);
    respondSuccess(req, res, 200, result.data, result.message);
  } catch (error) {
    console.error("Error en toggleImageStatus:", error);
    if (error.message === "Imagen no encontrada") {
      respondError(req, res, 404, error.message);
    } else {
      respondError(req, res, 500, "Error al cambiar el estado de la imagen");
    }
  }
};

/**
 * Actualizar orden de imágenes
 */
export const updateImageOrder = async (req, res) => {
  try {
    const { ordenData } = req.body;
    
    if (!Array.isArray(ordenData)) {
      return respondError(req, res, 400, "ordenData debe ser un array");
    }
    
    const result = await galeriaService.updateImageOrder(ordenData);
    respondSuccess(req, res, 200, null, result.message);
  } catch (error) {
    console.error("Error en updateImageOrder:", error);
    respondError(req, res, 500, "Error al actualizar el orden de las imágenes");
  }
};

/**
 * Obtener URL de imagen con autenticación
 */
export const getImageUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = "view", duration = 300 } = req.query;
    
    const imageResult = await galeriaService.getImageById(id);
    const urlResult = await galeriaService.getImageUrl(imageResult.data, {
      action,
      duration: parseInt(duration)
    });
    
    respondSuccess(req, res, 200, urlResult.data, urlResult.message);
  } catch (error) {
    console.error("Error en getImageUrl:", error);
    if (error.message === "Imagen no encontrada") {
      respondError(req, res, 404, error.message);
    } else {
      respondError(req, res, 500, "Error al generar URL de imagen");
    }
  }
};

 