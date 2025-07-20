"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Enrutador de usuarios  */
import userRoutes from "./user.routes.js";

/** Enrutador de autenticación */
import authRoutes from "./auth.routes.js";

/** Enrutador de roles */
import roleRoutes from "./role.routes.js";

/** Enrutador de tarjetas de profesores */
import cardsProfesoresRoutes from "./cardsProfesores.routes.js";

/** Enrutador de testimonios */
import testimonioRoutes from "./testimonio.routes.js";

/** Enrutador de galería */
import galeriaRoutes from "./galeria.routes.js";

/** Enrutador de URLs pre-firmadas */
import presignedUrlRoutes from "./presignedUrl.routes.js";

/** Middleware de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);
// Define las rutas para los roles /api/roles
router.use("/roles", roleRoutes);
// Define las rutas para las tarjetas de profesores /api/cards-profesores
router.use("/cards-profesores", cardsProfesoresRoutes);
// Define las rutas para los testimonios /api/testimonios
router.use("/testimonios", testimonioRoutes);
// Define las rutas para la galería /api/galeria
router.use("/galeria", galeriaRoutes);

// Define las rutas para URLs pre-firmadas /api/presigned
router.use("/presigned", presignedUrlRoutes);

router.get("/saludo", (req, res) => {
  res.send("¡Hola desde el backend!");
});

// Exporta el enrutador
export default router;
