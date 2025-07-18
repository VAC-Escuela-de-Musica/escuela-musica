import { Router } from "express";
import { 
  authenticateJWT,
  loadUserData,
  requireAdmin,
  requireAdminOrProfesor,
  validateMongoId,
  asyncHandler,
  sanitizeInput,
  rateLimiter
} from "../middlewares/index.js";
import {
  getUploadUrl,
  confirmUpload,
  listMaterialsWithUrls,
  deleteMaterial,
  testMinioConnection
} from "../controllers/material/index.js";
import {
  getDownloadUrl,
  healthCheck
} from "../controllers/file/index.js";

const router = Router();

// ============= MIDDLEWARES BASE =============
router.use(sanitizeInput);
router.use(rateLimiter(1000, 15 * 60 * 1000)); // 1000 requests por 15 minutos (aumentado para desarrollo)

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticateJWT);
router.use(loadUserData);

// Health checks del sistema
router.get("/test-minio", 
  requireAdmin, 
  asyncHandler(testMinioConnection)
);

router.get("/health", 
  asyncHandler(healthCheck)
);

// Flujo de subida de materiales
router.post("/upload-url", 
  requireAdminOrProfesor,
  asyncHandler(getUploadUrl)
);

router.post("/confirm-upload", 
  requireAdminOrProfesor,
  asyncHandler(confirmUpload)
);

// URLs prefirmadas para descarga (nuevas)
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

// Listar materiales
router.get("/", 
  asyncHandler(listMaterialsWithUrls)
);

// Eliminar material
router.delete("/:materialId", 
  validateMongoId('materialId'),
  requireAdminOrProfesor,
  asyncHandler(deleteMaterial)
);

export default router;
