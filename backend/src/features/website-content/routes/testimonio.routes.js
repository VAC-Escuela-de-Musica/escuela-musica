"use strict";

import { Router } from "express";
import testimonioController from "../controllers/testimonio.controller.js";
import { authenticationMiddleware, authorizeRoles } from "../../authentication/index.js";

const router = Router();

// ============= RUTAS PÚBLICAS =============
// Estas rutas no requieren autenticación
router.get("/active", testimonioController.getActiveTestimonios);
// Ruta principal de testimonios - pública para mostrar en frontend  
router.get("/", testimonioController.getAllTestimonios);

// ============= RUTAS PROTEGIDAS =============
// Aplicar middleware de autenticación
router.use(authenticationMiddleware);

// Rutas de administración (requieren autenticación y roles específicos)
router.get("/:id", authorizeRoles(["administrador", "asistente"]), testimonioController.getTestimonioById);
router.post("/", authorizeRoles(["administrador", "asistente"]), testimonioController.createTestimonio);

export default router;
