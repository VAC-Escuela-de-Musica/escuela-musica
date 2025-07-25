import minioClient, { MINIO_PUBLIC_BUCKET } from "../config/minio.config.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generar URL pre-firmada para subir imagen
 */
export const generateUploadUrl = async (fileName, contentType) => {
  try {
    // Generar nombre único si no se proporciona
    if (!fileName) {
      const fileExtension = contentType.split('/')[1];
      fileName = `galeria/${uuidv4()}.${fileExtension}`;
    }

    // Generar URL pre-firmada para subida (PUT)
    const uploadUrl = await minioClient.presignedPutObject(
      MINIO_PUBLIC_BUCKET,
      fileName,
      24 * 60 * 60 // 24 horas de validez
    );

    // Generar URL pública para acceso
    const publicUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${MINIO_PUBLIC_BUCKET}/${fileName}`;

    return {
      success: true,
      uploadUrl,
      publicUrl,
      fileName,
      bucket: MINIO_PUBLIC_BUCKET
    };
  } catch (error) {
    console.error("Error al generar URL de subida:", error);
    throw new Error("Error al generar URL de subida");
  }
};

/**
 * Generar URL pre-firmada para descargar imagen
 */
export const generateDownloadUrl = async (fileName, duration = 3600) => {
  try {
    const downloadUrl = await minioClient.presignedGetObject(
      MINIO_PUBLIC_BUCKET,
      fileName,
      duration
    );

    return {
      success: true,
      downloadUrl,
      fileName
    };
  } catch (error) {
    console.error("Error al generar URL de descarga:", error);
    throw new Error("Error al generar URL de descarga");
  }
};

/**
 * Eliminar imagen de MinIO
 */
export const deleteImageFromMinIO = async (fileName) => {
  try {
    await minioClient.removeObject(MINIO_PUBLIC_BUCKET, fileName);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar imagen de MinIO:", error);
    throw new Error("Error al eliminar la imagen del servidor");
  }
};

/**
 * Verificar si una imagen existe en MinIO
 */
export const checkImageExists = async (fileName) => {
  try {
    await minioClient.statObject(MINIO_PUBLIC_BUCKET, fileName);
    return { exists: true };
  } catch (error) {
    return { exists: false };
  }
}; 