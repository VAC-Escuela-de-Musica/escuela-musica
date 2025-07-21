"use strict";
import { Router } from "express";  
import { isAdmin } from "../middlewares/authorization.middleware.js";
import authenticationMiddleware from "../middlewares/authentication.middleware.js";
import claseController from "../controllers/clase.controller.js";

const router = Router();
router.use(authenticationMiddleware); 

router.post("/create", isAdmin, claseController.createClase);
router.get("/all", isAdmin, claseController.getAllClases);
router.get("/previous", isAdmin, claseController.getPreviousClases);
router.get("/today", isAdmin, claseController.getTodayClases);
router.get("/next", isAdmin, claseController.getNextClases);
router.get("/canceled_all", isAdmin, claseController.getAllCanceledClases);
router.get("/canceled_previous", isAdmin, claseController.getPreviousCanceledClases);
router.get("/canceled_today", isAdmin, claseController.getTodayCanceledClases);
router.get("/canceled_next", isAdmin, claseController.getNextCanceledClases);
router.get("/find/:id", isAdmin, claseController.getClaseById);
router.put("/update/:id", isAdmin, claseController.updateClase);
router.put("/cancel/:id", isAdmin, claseController.cancelClase);
router.get("/horario/dia", isAdmin, claseController.getHorarioDia);
router.get("/horario/semana", isAdmin, claseController.getHorarioSemana);
router.get("/horario/mes", isAdmin, claseController.getHorarioMes);
router.get("/profesores", isAdmin, claseController.getProfesores);
router.get("/profesor/:id", isAdmin, claseController.getProfesorById);

export default router;
