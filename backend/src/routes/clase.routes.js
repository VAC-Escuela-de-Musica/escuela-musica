"use strict";
import claseController from "../controllers/clase.controller.js";  
import { Router } from "express"; 

const router = Router();

router.post("/create", claseController.createClase);
router.get("/all", claseController.getAllClases);
router.get("/previous", claseController.getPreviousClases);
router.get("/today", claseController.getTodayClases);
router.get("/next", claseController.getNextClases);
router.get("/canceled_all", claseController.getAllCanceledClases);
router.get("/canceled_previous", claseController.getPreviousCanceledClases);
router.get("/canceled_today", claseController.getTodayCanceledClases); 
router.get("/canceled_next", claseController.getNextCanceledClases);
router.get("/find/:id", claseController.getClaseById);
router.put("/update/:id", claseController.updateClase);
router.put("/cancel/:id", claseController.cancelClase);
router.get("/horario/dia", claseController.getHorarioDia);
router.get("/horario/semana", claseController.getHorarioSemana);
router.get("/horario/mes", claseController.getHorarioMes);

export default router;
