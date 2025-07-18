import { Router } from "express";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../middlewares/authorization.middleware.js";
import {
  getUploadUrl,
  confirmUpload,
  listMaterialsWithUrls,
  deleteMaterial,
  testMinioConnection
} from "../controllers/material.controller.js";
import {
  getDownloadUrl,
  healthCheck
} from "../controllers/file.controller.js";

const router = Router();

// ============= RUTAS QUE REQUIEREN AUTENTICACIÓN =============
router.use(authenticationMiddleware);

// Health checks del sistema
router.get("/test-minio", authorizationMiddleware(["admin"]), testMinioConnection);
router.get("/health", healthCheck);

// Flujo de subida de materiales
router.post("/upload-url", getUploadUrl);
router.post("/confirm-upload", confirmUpload);

// URLs prefirmadas para descarga (nuevas)
router.get("/:id/download-url", getDownloadUrl);
router.get("/:id/view-url", (req, res, next) => {
  req.query.action = 'view';
  getDownloadUrl(req, res, next);
});

// Listar materiales
router.get("/", listMaterialsWithUrls);

// Eliminar material
router.delete("/:materialId", deleteMaterial);

export default router;
