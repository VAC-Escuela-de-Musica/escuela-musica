import { Router } from "express";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import {
  getUploadUrl,
  confirmUpload,
  getDownloadUrl,
  listMaterialsWithUrls,
  deleteMaterial,
  testMinioConnection,
  serveFile,
  downloadFile
} from "../controllers/presignedOnly.controller.js";

const router = Router();

// ============= RUTA DE DIAGNÓSTICO =============
router.get("/debug-auth", authenticationMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Autenticación exitosa",
    data: {
      email: req.email,
      roles: req.roles,
      rolesType: typeof req.roles,
      rolesLength: req.roles?.length,
      timestamp: new Date().toISOString()
    }
  });
});

// ============= SISTEMA SOLO CON URLs PREFIRMADAS =============

// RUTAS QUE NO REQUIEREN MIDDLEWARE DE AUTENTICACIÓN 
// (usarán autenticación por token en la URL)

// Visualizar archivo en línea (streaming)
router.get("/serve/:id", serveFile);

// Descargar archivo como adjunto
router.get("/download/:id", downloadFile);

// RESTO DE RUTAS QUE REQUIEREN AUTENTICACIÓN NORMAL
router.use(authenticationMiddleware);

// Ruta de diagnóstico para verificar MinIO (solo admin)
router.get("/test-minio", authorizationMiddleware(["admin"]), testMinioConnection);

// 1. Obtener URL prefirmada para subir archivo (todos los usuarios autenticados)
router.post("/upload-url", getUploadUrl);

// 2. Confirmar que la subida se completó exitosamente (todos los usuarios autenticados)
router.post("/confirm-upload", confirmUpload);

// 3. Obtener URL prefirmada para descargar archivo específico (uso opcional/avanzado)
router.get("/download-url/:materialId", getDownloadUrl);

// 4. Listar todos los materiales con URLs prefirmadas incluidas
router.get("/", listMaterialsWithUrls);

// 5. Eliminar material (admin o dueño)
router.delete("/:materialId", deleteMaterial);

export default router;
