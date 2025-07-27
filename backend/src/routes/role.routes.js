import { Router } from "express";
import roleController from "../controllers/role.controller.js";
// import authenticationMiddleware from "../middlewares/authentication.middleware.js";

const router = Router();

// Todas las rutas requieren autenticación
// router.use(authenticationMiddleware);

router.get("/", roleController.getRoles);

export default router;
