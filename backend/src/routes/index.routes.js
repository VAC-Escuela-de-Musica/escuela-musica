"use strict";
import { Router } from "express"; // Importa el modulo 'express' para crear las rutas
import userRoutes from "./user.routes.js"; /** Enrutador de usuarios  */
import authRoutes from "./auth.routes.js"; /** Enrutador de autenticación */
import claseRoutes from "./clase.routes.js"; /** Enrutador de horario */


/** Enrutador de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);
// Define las rutas para las clases /api/clases
router.use("/clases", claseRoutes);

// Exporta el enrutador
export default router;
