"use strict";

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
} from "../controllers/galeria.controller.js";
import verifyJWT from "../../authentication/middlewares/authentication.middleware.js";
import { authorizeRoles } from "../../authentication/middlewares/authorization.middleware.js";

const router = express.Router();

// Rutas públicas
router.get("/active", getActiveGallery);
router.get("/category/:categoria", getGalleryByCategory);
router.get("/image/:id/url", getImageUrl);

// Rutas protegidas (requieren autenticación)
router.use(verifyJWT);

// Rutas de administración (administrador y asistente - acceso completo)
router.get("/", authorizeRoles(["administrador", "asistente"]), getAllGallery);
router.get("/:id", authorizeRoles(["administrador", "asistente"]), getImageById);
router.post("/", authorizeRoles(["administrador", "asistente"]), createImage);
router.put("/:id", authorizeRoles(["administrador", "asistente"]), updateImage);
router.delete("/:id", authorizeRoles(["administrador", "asistente"]), deleteImage);
router.put("/:id/toggle", authorizeRoles(["administrador", "asistente"]), toggleImageStatus);
router.put("/order/update", authorizeRoles(["administrador", "asistente"]), updateImageOrder);

export default router; 
