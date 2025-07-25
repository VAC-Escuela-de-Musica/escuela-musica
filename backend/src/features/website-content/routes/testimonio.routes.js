"use strict";

import { Router } from "express";
import testimonioController from "../controllers/testimonio.controller.js";
import { authenticationMiddleware, authorizeRoles } from "../../authentication/index.js";

const router = Router();

// Rutas públicas (sin autenticación)
router.get("/active", testimonioController.getActiveTestimonios);

// Rutas protegidas (requieren autenticación)
router.use(authenticationMiddleware);

// Rutas de administración (solo administrador y asistente)
router.get("/", authorizeRoles(["administrador", "asistente"]), testimonioController.getAllTestimonios);
router.get("/:id", authorizeRoles(["administrador", "asistente"]), testimonioController.getTestimonioById);
router.post("/", authorizeRoles(["administrador", "asistente"]), testimonioController.createTestimonio);

export default router; 