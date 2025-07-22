import { Router } from "express";
import { getUploadUrl } from "../controllers/galeria.controller.js";
import { jwtAuthMiddleware } from "../middlewares/index.js";

const router = Router();

// Aplicar middleware de autenticación JWT a todas las rutas
router.use(jwtAuthMiddleware);

/**
 * @route POST /api/galeria/upload-url
 * @desc Genera URL prefirmada para subir imágenes a la galería
 * @access Private (Admin y Asistente)
 */
router.post('/upload-url', getUploadUrl);

export default router;