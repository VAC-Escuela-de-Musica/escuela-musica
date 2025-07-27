"use strict";

import { Router } from "express";
import testimonioController from "../controllers/testimonio.controller.js";
import { authenticateJWT } from "../../authentication/middlewares/index.js";
import { authorizeRoles } from "../../authentication/middlewares/authorization.middleware.js";

const router = Router();

// ============= RUTAS PÚBLICAS =============
// Estas rutas no requieren autenticación
router.get("/active", testimonioController.getActiveTestimonios);
// Ruta principal de testimonios - pública para mostrar en frontend  
router.get("/", testimonioController.getAllTestimonios);

// ============= RUTAS PROTEGIDAS =============
// Aplicar middleware de autenticación
router.use(authenticateJWT);

// Rutas de administración (requieren autenticación y roles específicos)
router.get("/:id", 
  authorizeRoles(["administrador", "asistente", "profesor"]), 
  testimonioController.getTestimonioById,
);
router.post("/", 
  authorizeRoles(["administrador", "asistente", "profesor"]), 
  testimonioController.createTestimonio,
);
router.put("/:id", 
  authorizeRoles(["administrador", "asistente", "profesor"]), 
  testimonioController.updateTestimonio,
);
router.delete("/:id", 
  authorizeRoles(["administrador", "asistente", "profesor"]), 
  testimonioController.deleteTestimonio,
);

export default router;
