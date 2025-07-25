"use strict";

import { Router } from "express";
import alumnoController from "../controllers/alumno.controller.js";
import { 
  authenticationMiddleware, 
  authorizeRoles 
} from "../../authentication/index.js";

const router = Router();

// Rutas protegidas (requieren autenticación)
router.use(authenticationMiddleware);

// Rutas de administración (solo administrador y asistente)
router.get("/", 
  authorizeRoles(["administrador", "asistente"]), 
  alumnoController.getAlumnos
);
router.post("/", 
  authorizeRoles(["administrador", "asistente"]), 
  alumnoController.createAlumno
);
router.get("/:id", 
  authorizeRoles(["administrador", "asistente"]), 
  alumnoController.getAlumnoById
);
router.put("/:id", 
  authorizeRoles(["administrador", "asistente"]), 
  alumnoController.updateAlumno
);
router.delete("/:id", 
  authorizeRoles(["administrador", "asistente"]), 
  alumnoController.deleteAlumno
);

export default router; 