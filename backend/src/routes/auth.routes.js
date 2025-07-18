"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Controlador de autenticación */
import authController from "../controllers/auth/auth.controller.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para la autenticación
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
router.get("/verify", authController.verify);

// Exporta el enrutador
export default router;
