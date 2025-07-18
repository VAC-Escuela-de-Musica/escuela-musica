import { Router } from "express";
import { 
  authenticateJWT,
  loadUserData,
  optionalAuth,
  validateMongoId,
  asyncHandler,
  fileAccessMiddleware,
  fileStreamMiddleware,
  fileCacheMiddleware,
  rateLimiter
} from "../middlewares/index.js";
import {
  getDownloadUrl,
  serveFile as serveFileWithFallback,
  downloadFile as downloadFileWithFallback,
  healthCheck
} from "../controllers/file/index.js";

const router = Router();

// ============= RUTAS PÚBLICAS (con autenticación opcional) =============

// Aplicar middleware de archivos y rate limiting
router.use(fileAccessMiddleware);
router.use(rateLimiter(200, 15 * 60 * 1000)); // 200 requests por 15 minutos para archivos

// Nuevas rutas optimizadas con fallback automático y autenticación opcional
router.get("/serve/:id", 
  validateMongoId('id'),
  optionalAuth, // Autenticación opcional para materiales públicos/privados
  fileStreamMiddleware, 
  fileCacheMiddleware(3600), // Cache por 1 hora
  asyncHandler(serveFileWithFallback)
);

router.get("/download/:id", 
  validateMongoId('id'),
  optionalAuth, // Autenticación opcional para materiales públicos/privados
  fileStreamMiddleware, 
  fileCacheMiddleware(3600),
  asyncHandler(downloadFileWithFallback)
);

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticateJWT);
router.use(loadUserData);

// Health check del sistema de archivos
router.get("/health", 
  asyncHandler(healthCheck)
);

// URLs prefirmadas para diferentes acciones
router.get("/:id/download-url", 
  validateMongoId('id'),
  asyncHandler(getDownloadUrl)
);

router.get("/:id/view-url", 
  validateMongoId('id'),
  asyncHandler((req, res, next) => {
    req.query.action = 'view';
    getDownloadUrl(req, res, next);
  })
);

export default router;
