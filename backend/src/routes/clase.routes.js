"use strict";
import claseController from "../controllers/clase.controller.js";  
import { Router } from "express"; 

const router = Router();

router.post("/create", claseController.createClase);
router.get("/all", claseController.getAllClases);
router.get("/find/:id", claseController.getClaseById);
router.put("/update/:id", claseController.updateClase);
router.put("/cancel/:id", claseController.cancelClase);

export default router;
