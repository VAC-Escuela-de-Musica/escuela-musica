"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Enrutador de usuarios  */
import userRoutes from "./user.routes.js";

/** Enrutador de autenticación */
import authRoutes from "./auth.routes.js";

/** Enrutador del carrusel */
import carouselRoutes from "./carousel.routes.js";

/** Enrutador de roles */
import roleRoutes from "./role.routes.js";

/** Enrutador de mensajería */
import messagingRoutes from "./messaging.routes.js";

/** Middleware de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);
// Define las rutas para el carrusel /api/carousel
router.use("/carousel", carouselRoutes);
// Define las rutas para los roles /api/roles
router.use("/roles", roleRoutes);
// Define las rutas para la mensajería /api/messaging
router.use("/messaging", messagingRoutes);

router.get("/saludo", (req, res) => {
  res.send("¡Hola desde el backend!");
});

// Ruta para /api
router.get("/", (req, res) => {
  res.send("API Escuela de Música funcionando");
});

// Exporta el enrutador
export default router;
