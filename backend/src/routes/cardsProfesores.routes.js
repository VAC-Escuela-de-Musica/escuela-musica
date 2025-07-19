"use strict";
import express from "express";
import cardsProfesoresController from "../controllers/cardsProfesores.controller.js";
import verifyJWT from "../middlewares/authentication.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
const ADMIN_ROLE = "administrador";
const ASISTENTE_ROLE = "asistente";

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get("/", cardsProfesoresController.getAllCards);
router.get("/active", cardsProfesoresController.getActiveCards);
router.get("/:id", cardsProfesoresController.getCardById);

// Rutas protegidas (requieren autenticación y autorización)
router.post("/", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  cardsProfesoresController.createCard,
);

router.put("/order", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  cardsProfesoresController.updateOrder,
);

router.put("/:id", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  cardsProfesoresController.updateCard,
);

router.delete("/:id", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  cardsProfesoresController.deleteCard,
);

router.patch("/:id/restore", 
  verifyJWT, 
  authorizeRoles([ADMIN_ROLE, ASISTENTE_ROLE]), 
  cardsProfesoresController.restoreCard,
);

export default router; 