import express from "express";
import {
  getUploadUrl,
  getDownloadUrl,
  deleteImage,
} from "../controllers/presignedUrl.controller.js";
import {
  authenticationMiddleware as verifyJWT,
  authorizeRoles,
} from "../../authentication/index.js";

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.use(verifyJWT);

// Rutas de administración (solo administrador y asistente)
router.post("/upload", authorizeRoles(["administrador", "asistente"]), getUploadUrl);
router.get("/download/:fileName", authorizeRoles(["administrador", "asistente"]), getDownloadUrl);
router.delete("/:fileName", authorizeRoles(["administrador", "asistente"]), deleteImage);

export default router; 