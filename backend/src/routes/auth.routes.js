"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Controlador de autenticación */
import authController from "../controllers/auth/auth.controller.js";

/** Instancia del enrutador */
const router = Router();

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[AUTH] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`);
  next();
});

// Define las rutas para la autenticación
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refresh);
import { authenticateJWT, loadUserData } from "../middlewares/index.js";

router.get("/verify",
  authenticateJWT,
  loadUserData,
  (req, res, next) => {
    console.log(`[AUTH] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`);
    next();
  },
  authController.verify
);

// Exporta el enrutador
export default router;
