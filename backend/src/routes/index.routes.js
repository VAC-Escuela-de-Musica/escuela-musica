"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Enrutador de usuarios  */
import userRoutes from "./user.routes.js";

/** Enrutador de autenticación */
import authRoutes from "./auth.routes.js";

/** 
 * Enrutador de materiales con el sistema de URLs prefirmadas 
 * Este es el sistema activo que se debe utilizar
 */
import materialRoutes from "./presignedOnly.routes.js"; // Nombre de archivo histórico, contiene las rutas de materiales

/** Middleware de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);

// Sistema de URLs prefirmadas - La ruta principal para todos los materiales
router.use("/materials", materialRoutes);

// Redireccionamiento de la ruta antigua a la nueva para mantener compatibilidad
router.use("/materiales", (req, res) => {
  console.log(`⚠️ Acceso a ruta obsoleta: ${req.method} ${req.originalUrl}`);
  res.redirect(307, req.originalUrl.replace('/materiales', '/materials'));
});

// Exporta el enrutador
export default router;
