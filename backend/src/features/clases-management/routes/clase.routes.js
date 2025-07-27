"use strict";
import { Router } from "express";  
import { authenticateJWT } from "../../authentication/middlewares/index.js";
import { authorizeRoles } from "../../authentication/middlewares/authorization.middleware.js";
import {
    createClase,
    getAllClases,
    getPreviousClases,
    getTodayClases,
    getNextClases,
    getAllCanceledClases,
    getPreviousCanceledClases,
    getTodayCanceledClases,
    getNextCanceledClases,
    getClaseById,
    updateClase,
    cancelClase,
    getHorarioDia,
    getHorarioSemana,
    getHorarioMes,
    getProfesores,
    getProfesorById,
    getAllProgrammedClases,
    createClases,
    asignarEstudianteAClase,
    desasignarEstudianteDeClase,
    actualizarEstadoEstudiante,
    registrarAsistencia,
    getClasesDeEstudiante,
    getEstudiantesDeClase
} from "../controllers/clase.controller.js";

const router = Router();
router.use(authenticateJWT);

router.post("/create", authorizeRoles(["administrador", "asistente"]), createClase);
router.get("/all", authorizeRoles(["administrador", "asistente"]), getAllClases);
router.get("/previous", authorizeRoles(["administrador", "asistente"]), getPreviousClases);
router.get("/today", authorizeRoles(["administrador", "asistente"]), getTodayClases);
router.get("/next", authorizeRoles(["administrador", "asistente"]), getNextClases);
router.get("/canceled_all", authorizeRoles(["administrador", "asistente"]), getAllCanceledClases);
router.get("/canceled_previous", authorizeRoles(["administrador", "asistente"]), getPreviousCanceledClases);
router.get("/canceled_today", authorizeRoles(["administrador", "asistente"]), getTodayCanceledClases);
router.get("/canceled_next", authorizeRoles(["administrador", "asistente"]), getNextCanceledClases);
router.get("/find/:id", authorizeRoles(["administrador", "asistente"]), getClaseById);
router.put("/update/:id", authorizeRoles(["administrador", "asistente"]), updateClase);
router.put("/cancel/:id", authorizeRoles(["administrador", "asistente"]), cancelClase);
router.get("/horario/dia", authorizeRoles(["administrador", "asistente"]), getHorarioDia);
router.get("/horario/semana", authorizeRoles(["administrador", "asistente"]), getHorarioSemana);
router.get("/horario/mes", authorizeRoles(["administrador", "asistente"]), getHorarioMes);
router.get("/profesores", authorizeRoles(["administrador", "asistente"]), getProfesores);
router.get("/profesor/:id", authorizeRoles(["administrador", "asistente"]), getProfesorById);
router.get("/programadas", authorizeRoles(["administrador", "asistente"]), getAllProgrammedClases);
router.post("/batch", authorizeRoles(["administrador", "asistente"]), createClases);

// Rutas para gestión de estudiantes en clases
router.post("/:id/estudiantes", authorizeRoles(["administrador", "asistente"]), asignarEstudianteAClase);
router.delete("/:id/estudiantes/:alumnoId", authorizeRoles(["administrador", "asistente"]), desasignarEstudianteDeClase);
router.put("/:id/estudiantes/:alumnoId", authorizeRoles(["administrador", "asistente"]), actualizarEstadoEstudiante);
router.post("/:id/estudiantes/:alumnoId/asistencia", authorizeRoles(["administrador", "asistente"]), registrarAsistencia);
router.get("/estudiante/:alumnoId", authorizeRoles(["administrador", "asistente", "estudiante"]), getClasesDeEstudiante);
router.get("/:id/estudiantes", authorizeRoles(["administrador", "asistente"]), getEstudiantesDeClase);

export default router;
