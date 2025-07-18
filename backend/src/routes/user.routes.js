"use strict";
// Importa el modulo 'express' para crear las rutas
import { Router } from "express";

/** Controlador de usuarios */
import usuarioController from "../controllers/user/user.controller.js";

/** Middlewares organizados */
import { 
  authenticateJWT,
  loadUserData,
  requireAdmin,
  validateMongoId,
  asyncHandler,
  sanitizeInput
} from "../middlewares/index.js";

/** Instancia del enrutador */
const router = Router();

// Aplicar middlewares base a todas las rutas
router.use(sanitizeInput);
router.use(authenticateJWT);
router.use(loadUserData);

// Define las rutas para los usuarios
router.get("/", 
  requireAdmin, 
  asyncHandler(usuarioController.getUsers)
);

router.post("/", 
  requireAdmin, 
  asyncHandler(usuarioController.createUser)
);

router.get("/:id", 
  validateMongoId('id'),
  asyncHandler(usuarioController.getUserById)
);

router.put("/:id", 
  validateMongoId('id'),
  requireAdmin, 
  asyncHandler(usuarioController.updateUser)
);

router.delete("/:id", 
  validateMongoId('id'),
  requireAdmin, 
  asyncHandler(usuarioController.deleteUser)
);

// Exporta el enrutador
export default router;
