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

import { validateSchema } from "../middlewares/validation/schema.middleware.js";
import { userBodySchema, userIdSchema } from "../schema/user.schema.js";

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
  validateSchema(userBodySchema, 'body'),
  asyncHandler(usuarioController.createUser)
);

router.get("/:id", 
  validateMongoId('id'),
  validateSchema(userIdSchema, 'params'),
  asyncHandler(usuarioController.getUserById)
);

router.put("/:id", 
  validateMongoId('id'),
  validateSchema(userIdSchema, 'params'),
  validateSchema(userBodySchema, 'body'),
  requireAdmin, 
  asyncHandler(usuarioController.updateUser)
);

router.delete("/:id", 
  validateMongoId('id'),
  validateSchema(userIdSchema, 'params'),
  requireAdmin, 
  asyncHandler(usuarioController.deleteUser)
);

// Exporta el enrutador
export default router;
