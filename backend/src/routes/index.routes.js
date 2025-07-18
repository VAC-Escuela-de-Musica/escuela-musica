"use strict";

import { Router } from "express";

// Importación de rutas
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import materialRoutes from "./material.routes.js";
import fileRoutes from "./file.routes.js";

// Middleware de autenticación
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

// Instancia del enrutador
const router = Router();

// Rutas para usuarios - requieren autenticación
router.use("/users", authenticationMiddleware, userRoutes);

// Rutas para autenticación - públicas
router.use("/auth", authRoutes);

// Rutas para materiales - algunas requieren autenticación (definido en material.routes.js)
router.use("/materials", materialRoutes);

// Rutas para archivos - operaciones de archivos optimizadas
router.use("/files", fileRoutes);

// Redireccionamiento de rutas obsoletas para mantener compatibilidad
router.use("/materiales", (req, res) => {
  console.log(`⚠️ Acceso a ruta obsoleta: ${req.method} ${req.originalUrl}`);
  res.redirect(307, req.originalUrl.replace('/materiales', '/materials'));
});

export default router;
