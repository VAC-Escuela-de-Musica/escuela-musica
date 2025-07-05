import express from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import AlumnosController from "../controllers/alumnos.controller.js";

const router = express.Router();
router.use(authenticationMiddleware);

router.get("/", isAdmin, AlumnosController.getAllAlumnos);
router.post("/", isAdmin, AlumnosController.createAlumnos);
router.put("/:id", isAdmin, AlumnosController.updateAlumnos);
router.delete("/:id", isAdmin, AlumnosController.deleteAlumnos);
router.get("/:id", isAdmin, AlumnosController.getAlumnosById);

export default router;
