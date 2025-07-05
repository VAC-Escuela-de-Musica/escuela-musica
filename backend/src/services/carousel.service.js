import CarouselImage from "../models/carousel.entity.js";
import minioClient, { MINIO_BUCKET_NAME } from "../config/minio.config.js";
import { handleError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Sube una imagen al carrusel
 */
export async function uploadCarouselImage(file, titulo, descripcion, userId) {
  try {
    // Generar nombre único para el archivo
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `carousel-${uuidv4()}.${fileExtension}`;

    // Subir archivo a MinIO
    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      fileName,
      file.buffer,
      file.size,
      {
        "Content-Type": file.mimetype,
      },
    );

    // Generar URL pública
    const url = `http://${process.env.MINIO_ENDPOINT || "localhost"}:${
      process.env.MINIO_PORT || 9000
    }/${MINIO_BUCKET_NAME}/${fileName}`;
    
    // Obtener el siguiente orden disponible
    const maxOrden = await CarouselImage.findOne({}, {}, { sort: { orden: -1 } });
    const orden = maxOrden ? maxOrden.orden + 1 : 1;

    // Crear registro en MongoDB
    const carouselImage = new CarouselImage({
      titulo,
      descripcion,
      nombreArchivo: fileName,
      url,
      orden,
      subidoPor: userId,
    });

    await carouselImage.save();

    return carouselImage;
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> uploadCarouselImage");
    throw err;
  }
}

/**
 * Obtiene todas las imágenes del carrusel (activas)
 */
export async function getCarouselImages() {
  try {
    const images = await CarouselImage.find({ activo: true })
      .sort({ orden: 1 })
      .populate("subidoPor", "username email");

    return images;
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> getCarouselImages");
    throw err;
  }
}

/**
 * Obtiene todas las imágenes del carrusel (incluyendo inactivas)
 */
export async function getAllCarouselImages() {
  try {
    const images = await CarouselImage.find()
      .sort({ orden: 1 })
      .populate("subidoPor", "username email");

    return images;
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> getAllCarouselImages");
    throw err;
  }
}

/**
 * Actualiza una imagen del carrusel
 */
export async function updateCarouselImage(imageId, updateData) {
  try {
    const image = await CarouselImage.findByIdAndUpdate(
      imageId,
      {
        ...updateData,
        fechaActualizacion: new Date(),
      },
      { new: true },
    ).populate("subidoPor", "username email");

    if (!image) {
      throw new Error("Imagen no encontrada");
    }

    return image;
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> updateCarouselImage");
    throw err;
  }
}

/**
 * Elimina una imagen del carrusel
 */
export async function deleteCarouselImage(imageId) {
  try {
    const image = await CarouselImage.findById(imageId);

    if (!image) {
      throw new Error("Imagen no encontrada");
    }

    // Eliminar archivo de MinIO
    try {
      await minioClient.removeObject(MINIO_BUCKET_NAME, image.nombreArchivo);
    } catch (minioErr) {
      // eslint-disable-next-line no-console
      console.warn("Error al eliminar archivo de MinIO:", minioErr.message);
    }

    // Eliminar registro de MongoDB
    await CarouselImage.findByIdAndDelete(imageId);

    return { message: "Imagen eliminada exitosamente" };
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> deleteCarouselImage");
    throw err;
  }
}

/**
 * Actualiza el orden de las imágenes del carrusel
 */
export async function updateCarouselOrder(imagesOrder) {
  try {
    const updatePromises = imagesOrder.map(({ id, orden }) =>
      CarouselImage.findByIdAndUpdate(id, { orden }),
    );

    await Promise.all(updatePromises);

    return { message: "Orden actualizado exitosamente" };
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> updateCarouselOrder");
    throw err;
  }
}

/**
 * Cambia el estado activo/inactivo de una imagen
 */
export async function toggleImageStatus(imageId) {
  try {
    const image = await CarouselImage.findById(imageId);

    if (!image) {
      throw new Error("Imagen no encontrada");
    }

    image.activo = !image.activo;
    image.fechaActualizacion = new Date();
    await image.save();

    return image;
  } catch (err) {
    handleError(err, "/services/carousel.service.js -> toggleImageStatus");
    throw err;
  }
}
