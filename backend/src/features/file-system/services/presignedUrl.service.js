import minioClient, { MINIO_PUBLIC_BUCKET } from "../../../core/config/minio.config.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Genera una URL pre-firmada para subir un archivo
 */
export const generateUploadUrl = async (bucketName, fileName, expiryTime = 3600) => {
  try {
    const presignedUrl = await minioClient.presignedPutObject(bucketName, fileName, expiryTime);
    return presignedUrl;
  } catch (error) {
    throw new Error(`Error generating upload URL: ${error.message}`);
  }
};

/**
 * Genera una URL pre-firmada para descargar un archivo
 */
export const generateDownloadUrl = async (bucketName, fileName, expiryTime = 3600) => {
  try {
    const presignedUrl = await minioClient.presignedGetObject(bucketName, fileName, expiryTime);
    return presignedUrl;
  } catch (error) {
    throw new Error(`Error generating download URL: ${error.message}`);
  }
};

/**
 * Elimina una imagen del bucket de MinIO
 */
export const deleteImageFromMinio = async (bucketName, fileName) => {
  try {
    await minioClient.removeObject(bucketName, fileName);
    return true;
  } catch (error) {
    throw new Error(`Error deleting image: ${error.message}`);
  }
}; 