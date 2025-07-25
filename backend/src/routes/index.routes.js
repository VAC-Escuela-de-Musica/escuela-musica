"use strict";

import { Router } from "express";

// Authentication Feature
import { authRoutes, authenticationMiddleware } from "../features/authentication/index.js";

// User Management Feature
import { userRoutes } from "../features/user-management/index.js";

// Student Management Feature
import { alumnoRoutes } from "../features/student-management/index.js";

// Content Management Feature
import { galeriaRoutes } from "../features/content-management/index.js";

// Website Content Feature
import { cardsProfesoresRoutes, testimonioRoutes } from "../features/website-content/index.js";

// File System Feature
import { archivoRoutes } from "../features/file-system/index.js";

// Communication Feature
import { mensajeRoutes } from "../features/communication/index.js";

// Monitoring Feature
import { metricaRoutes, eventoRoutes } from "../features/monitoring/index.js";

const router = Router();

// Authentication routes
router.use("/auth", authRoutes);

// User Management routes
router.use("/users", authenticationMiddleware, userRoutes);

// Student Management routes
router.use("/alumnos", authenticationMiddleware, alumnoRoutes);

// Content Management routes
router.use("/galeria", galeriaRoutes);

// Website Content routes
router.use("/cards-profesores", cardsProfesoresRoutes);
router.use("/testimonios", testimonioRoutes);

// File System routes
router.use("/archivos", archivoRoutes);

// Communication routes
router.use("/mensajes", mensajeRoutes);

// Monitoring routes
router.use("/metricas", metricaRoutes);
router.use("/eventos", eventoRoutes);

export default router;
