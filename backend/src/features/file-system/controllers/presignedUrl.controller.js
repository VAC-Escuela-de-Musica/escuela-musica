import { 
  generateUploadUrl, 
  generateDownloadUrl, 
  deleteImageFromMinIO 
} from "../services/presignedUrl.service.js";
import { respondSuccess, respondError } from "../../../utils/resHandler.js";

/**
 * Generar URL pre-firmada para subir imagen
 */
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!contentType) {
      return respondError(req, res, 400, "contentType es requerido");
    }

    const result = await generateUploadUrl(fileName, contentType);
    respondSuccess(req, res, 200, result, "URL de subida generada exitosamente");
  } catch (error) {
    console.error("Error en getUploadUrl:", error);
    respondError(req, res, 500, "Error al generar URL de subida");
  }
};

/**
 * Generar URL pre-firmada para descargar imagen
 */
export const getDownloadUrl = async (req, res) => {
  try {
    const { fileName } = req.params;
    const { duration } = req.query;
    
    if (!fileName) {
      return respondError(req, res, 400, "fileName es requerido");
    }

    const result = await generateDownloadUrl(fileName, duration);
    respondSuccess(req, res, 200, result, "URL de descarga generada exitosamente");
  } catch (error) {
    console.error("Error en getDownloadUrl:", error);
    respondError(req, res, 500, "Error al generar URL de descarga");
  }
};

/**
 * Eliminar imagen de MinIO
 */
export const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName) {
      return respondError(req, res, 400, "fileName es requerido");
    }

    const result = await deleteImageFromMinIO(fileName);
    respondSuccess(req, res, 200, result, "Imagen eliminada exitosamente");
  } catch (error) {
    console.error("Error en deleteImage:", error);
    respondError(req, res, 500, "Error al eliminar imagen");
  }
}; 