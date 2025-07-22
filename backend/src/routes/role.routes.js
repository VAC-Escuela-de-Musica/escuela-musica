import { Router } from "express";
import roleController from "../controllers/role.controller.js";
// import authenticationMiddleware from "../middlewares/authentication.middleware.js";

const router = Router();

// Middleware de debug para todas las rutas de este router
router.use((req, res, next) => {
  console.log(`[ROLE] ${req.method} ${req.originalUrl} | user: ${req.user?.username || 'anonimo'}`);
  next();
});

// Todas las rutas requieren autenticación
// router.use(authenticationMiddleware);

router.get("/", roleController.getRoles);

export default router;
