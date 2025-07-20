"use strict";
import { Router } from "express";
import {
  getAllTestimoniosController,
  getActiveTestimoniosController,
  getTestimonioByIdController,
  createTestimonioController,
  updateTestimonioController,
  deleteTestimonioController,
  updateTestimonioOrderController,
  toggleTestimonioStatusController,
} from "../controllers/testimonio.controller.js";
import verifyJWT from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";

const router = Router();

const ADMIN_ROLE = "administrador";
const ASISTENTE_ROLE = "asistente";

// Rutas públicas (para el frontend)
router.get("/active", getActiveTestimoniosController);

// Rutas protegidas (requieren autenticación y autorización)
router.get("/", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  getAllTestimoniosController,
);

router.get("/:id", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  getTestimonioByIdController,
);

router.post("/", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  createTestimonioController,
);

router.put("/:id", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  updateTestimonioController,
);

router.delete("/:id", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  deleteTestimonioController,
);

router.put("/:id/toggle", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  toggleTestimonioStatusController,
);

router.put("/order/update", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  updateTestimonioOrderController,
);

export default router; 