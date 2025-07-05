import {
  uploadCarouselImage,
  getCarouselImages,
  getAllCarouselImages,
  updateCarouselImage,
  deleteCarouselImage,
  updateCarouselOrder,
  toggleImageStatus,
} from "../services/carousel.service.js";
import { handleError } from "../utils/errorHandler.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";

/**
 * Sube una nueva imagen al carrusel
 */
export async function uploadImage(req, res) {
  try {
    const { titulo, descripcion } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file) {
      return respondError(req, res, 400, "No se proporcionó ningún archivo");
    }

    if (!titulo) {
      return respondError(req, res, 400, "El título es obligatorio");
    }

    const image = await uploadCarouselImage(file, titulo, descripcion, userId);
    respondSuccess(req, res, 201, { message: "Imagen subida exitosamente", image });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> uploadImage");
    respondError(req, res, 500, "Error al subir la imagen");
  }
}

/**
 * Obtiene todas las imágenes del carrusel (activas)
 */
export async function getImages(req, res) {
  try {
    const images = await getCarouselImages();
    respondSuccess(req, res, 200, { message: "Imágenes obtenidas exitosamente", images });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> getImages");
    respondError(req, res, 500, "Error al obtener las imágenes");
  }
}

/**
 * Obtiene todas las imágenes del carrusel (incluyendo inactivas) - Solo admin
 */
export async function getAllImages(req, res) {
  try {
    const images = await getAllCarouselImages();
    respondSuccess(req, res, 200, { message: "Imágenes obtenidas exitosamente", images });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> getAllImages");
    respondError(req, res, 500, "Error al obtener las imágenes");
  }
}

/**
 * Actualiza una imagen del carrusel
 */
export async function updateImage(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const image = await updateCarouselImage(id, updateData);
    respondSuccess(req, res, 200, { message: "Imagen actualizada exitosamente", image });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> updateImage");
    if (err.message === "Imagen no encontrada") {
      respondError(req, res, 404, "Imagen no encontrada");
    } else {
      respondError(req, res, 500, "Error al actualizar la imagen");
    }
  }
}

/**
 * Elimina una imagen del carrusel
 */
export async function deleteImage(req, res) {
  try {
    const { id } = req.params;
    const result = await deleteCarouselImage(id);
    respondSuccess(req, res, 200, { message: result.message });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> deleteImage");
    if (err.message === "Imagen no encontrada") {
      respondError(req, res, 404, "Imagen no encontrada");
    } else {
      respondError(req, res, 500, "Error al eliminar la imagen");
    }
  }
}

/**
 * Actualiza el orden de las imágenes del carrusel
 */
export async function updateOrder(req, res) {
  try {
    const { imagesOrder } = req.body;

    if (!Array.isArray(imagesOrder)) {
      return respondError(req, res, 400, "El orden debe ser un array");
    }

    const result = await updateCarouselOrder(imagesOrder);
    respondSuccess(req, res, 200, { message: result.message });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> updateOrder");
    respondError(req, res, 500, "Error al actualizar el orden");
  }
}

/**
 * Cambia el estado activo/inactivo de una imagen
 */
export async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const image = await toggleImageStatus(id);
    respondSuccess(req, res, 200, { message: "Estado actualizado exitosamente", image });
  } catch (err) {
    handleError(err, "/controllers/carousel.controller.js -> toggleStatus");
    if (err.message === "Imagen no encontrada") {
      respondError(req, res, 404, "Imagen no encontrada");
    } else {
      respondError(req, res, 500, "Error al cambiar el estado");
    }
  }
}
