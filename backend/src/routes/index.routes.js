"use strict";

import { Router } from "express";

// Importación de rutas
import userRoutes from "./user.routes.js";
import authRoutes from "./auth.routes.js";
import materialRoutes from "./material.routes.js";
import fileRoutes from "./file.routes.js";
import adminRoutes from "./admin.routes.js";
import alumnosRoutes from "./alumnos.routes.js";
import galeriaRoutes from "./galeria.routes.js";
import messagingRoutes from "./messaging.routes.js";
import roleRoutes from "./role.routes.js";
import cardsProfesoresRoutes from "./cardsProfesores.routes.js";

// Middlewares centralizados
import { 
  requestLogger,
  performanceMonitor,
  securityHeaders,
  requestInfo,
  globalErrorHandler,
  notFoundHandler
} from "../middlewares/index.js";

// Instancia del enrutador
const router = Router();

// ============= MIDDLEWARES GLOBALES =============
router.use(requestInfo);
router.use(requestLogger);
router.use(performanceMonitor);
router.use(securityHeaders);

// ============= DEFINICIÓN DE RUTAS =============

// Health check global del sistema
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas para usuarios - autenticación manejada en user.routes.js
router.use("/users", userRoutes);

// Rutas para autenticación - públicas
router.use("/auth", authRoutes);

// Rutas para materiales - autenticación manejada en material.routes.js
router.use("/materials", materialRoutes);

// Rutas para archivos - operaciones de archivos optimizadas
router.use("/files", fileRoutes);

// Rutas de administración - solo para desarrollo
router.use("/admin", adminRoutes);

// Rutas para alumnos - autenticación manejada en alumnos.routes.js
router.use("/alumnos", alumnosRoutes);

// Rutas para galería - autenticación manejada en galeria.routes.js
router.use("/galeria", galeriaRoutes);

// Rutas para mensajería - autenticación manejada en messaging.routes.js
router.use("/messaging", messagingRoutes);

// Rutas para roles - autenticación manejada en role.routes.js
router.use("/roles", roleRoutes);

// Rutas para tarjetas de profesores
router.use("/cards-profesores", cardsProfesoresRoutes);

// ============= COMPATIBILIDAD CON RUTAS OBSOLETAS =============
router.use("/materiales", (req, res) => {
  console.log(`⚠️ Acceso a ruta obsoleta: ${req.method} ${req.originalUrl}`);
  res.redirect(307, req.originalUrl.replace('/materiales', '/materials'));
});

// ============= MANEJO DE ERRORES =============
router.use(notFoundHandler);
router.use(globalErrorHandler);

export default router;
