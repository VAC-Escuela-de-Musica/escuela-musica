import { Router } from "express";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import { fileAccessMiddleware, fileStreamMiddleware } from "../middlewares/file.middleware.js";
import {
  getDownloadUrl,
  serveFileWithFallback,
  downloadFileWithFallback,
  healthCheck
} from "../controllers/file.controller.js";

const router = Router();

// ============= RUTAS PÚBLICAS (con autenticación por token en URL) =============

// Aplicar middleware de archivos a todas las rutas
router.use(fileAccessMiddleware);

// Nuevas rutas optimizadas con fallback automático
router.get("/serve/:id", fileStreamMiddleware, serveFileWithFallback);
router.get("/download/:id", fileStreamMiddleware, downloadFileWithFallback);

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticationMiddleware);

// Health check del sistema de archivos
router.get("/health", healthCheck);

// URLs prefirmadas para diferentes acciones
router.get("/:id/download-url", getDownloadUrl);
router.get("/:id/view-url", (req, res, next) => {
  req.query.action = 'view';
  getDownloadUrl(req, res, next);
});

export default router;
