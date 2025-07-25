"use strict";

import { Router } from "express";
import eventoController from "../controllers/evento.controller.js";
import { authenticationMiddleware, authorizeRoles } from "../../authentication/index.js";

const router = Router();

router.use(authenticationMiddleware);

router.get("/", authorizeRoles(["administrador"]), eventoController.getEventos);
router.post("/", authorizeRoles(["administrador"]), eventoController.createEvento);

export default router; 