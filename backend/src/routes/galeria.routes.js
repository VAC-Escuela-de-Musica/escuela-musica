import express from "express";
import {
  getActiveGallery,
  getGalleryByCategory,
  getAllGallery,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  toggleImageStatus,
  updateImageOrder,
  getImageUrl,
  getUploadUrl,
} from "../controllers/galeria.controller.js";
import { 
  authenticateJWT,
  loadUserData,
  requireAdmin,
  validateMongoId,
  asyncHandler,
  sanitizeInput
} from "../middlewares/index.js";

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get("/active", getActiveGallery);
router.get("/category/:categoria", getGalleryByCategory);
router.get("/image/:id/url", getImageUrl);

// Aplicar middlewares de autenticación para rutas protegidas
router.use(sanitizeInput);
router.use(authenticateJWT);
router.use(loadUserData);

// Middleware de debug
router.use((req, res, next) => {
  console.log(`[GALERIA] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`);
  next();
});

// Rutas de administración (requieren rol admin)
router.get("/", requireAdmin, getAllGallery);
router.get("/:id", validateMongoId('id'), requireAdmin, getImageById);
router.post("/", requireAdmin, createImage);
router.put("/:id", validateMongoId('id'), requireAdmin, updateImage);
router.delete("/:id", validateMongoId('id'), requireAdmin, deleteImage);
router.put("/:id/toggle", validateMongoId('id'), requireAdmin, toggleImageStatus);
router.put("/order/update", requireAdmin, updateImageOrder);

// Endpoint para URLs prefirmadas
router.post('/upload-url', requireAdmin, getUploadUrl);

export default router;