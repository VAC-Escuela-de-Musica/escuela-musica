"use strict";
import {
  respondSuccess,
  respondError,
  respondInternalError,
} from "../utils/resHandler.js";
import AlumnoService from "../services/alumnos.service.js";
import { handleError } from "../utils/errorHandler.js";
import Alumno from "../models/alumnos.model.js";

// Controlador para obtener todos los alumnos
async function getAllAlumnos(req, res) {
  try {
    const [alumnos, errorAlumnos] = await AlumnoService.getAllAlumnos();
    if (errorAlumnos) return respondError(req, res, 404, errorAlumnos);
    alumnos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, alumnos);
  } catch (error) {
    handleError(error, "alumnos.controller -> getAllAlumnos");
    respondError(req, res, 400, error.message);
  }
}

// Controlador para crear un nuevo alumno
async function createAlumnos(req, res) {
  try {
    const { body } = req;
    const [alumno, errorAlumno] = await AlumnoService.createAlumnos(body);

    if (errorAlumno) {
      return respondError(req, res, 400, errorAlumno);
    }
    if (!alumno) {
      return respondError(req, res, 404, "No se pudo crear el alumno");
    }
    respondSuccess(req, res, 201, alumno);
  } catch (error) {
    handleError(error, "alumnos.controller -> createAlumnos");
    respondError(req, res, 500, "error al crear el alumno");
  }
}

// Controlador para obtener un alumno por su ID
async function getAlumnosById(req, res) {
  try {
    const { params } = req;
    const [alumno, errorAlumno] = await AlumnoService.getAlumnosById(params.id);

    if (errorAlumno) return respondError(req, res, 404, errorAlumno);
    respondSuccess(req, res, 200, alumno);
  } catch (error) {
    handleError(error, "alumnos.controller -> getAlumnosById");
    respondError(req, res, 500, "error al obtener el alumno");
  }
}

// Controlador para actualizar un alumno por su ID
async function updateAlumnos(req, res) {
  try {
    const { id } = req.params;
    const allowedFields = ["name", "age", "grade"]; // Whitelist of allowed fields
    const updateData = Object.keys(req.body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    const [alumno, error] = await AlumnoService.updateAlumnos(id, updateData);

    if (error) {
      return res.status(404).json({ message: error });
    }
    return res.status(200).json(alumno);
  } catch (error) {
    handleError(error, "alumnos.controller -> updateAlumnos");
    return res.status(500).json({ message: "Error al actualizar el alumno" });
  }
}

// Controlador para eliminar un alumno por su ID
async function deleteAlumnos(req, res) {
  try {
    const { id } = req.params; // id del alumno a eliminar
    const alumno = await AlumnoService.deleteAlumnos(id);

    if (!Alumno) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }
    return res.status(200).json({ message: "Alumno eliminado correctamente" });
  } catch (error) {
    handleError(error, "alumnos.controller -> deleteAlumnos");
    return res.status(500).json({ message: "Error al eliminar el alumno" });
  }
}

// Exportar los controladores
export default {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
};
