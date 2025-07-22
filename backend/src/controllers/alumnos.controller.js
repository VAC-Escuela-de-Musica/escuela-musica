"use strict";
import {
  respondSuccess,
  respondError,
  respondInternalError,
} from "../utils/responseHandler.util.js";
import AlumnoService from "../services/alumnos.service.js";
import { handleError } from "../utils/errorHandler.util.js";
import Alumno from "../models/alumnos.model.js";

// Controlador para obtener todos los alumnos
async function getAllAlumnos(req, res) {
  console.log("[GET] /api/alumnos - Obtener todos los alumnos");
  try {
    const [alumnos, errorAlumnos] = await AlumnoService.getAllAlumnos();
    console.log(`[GET] /api/alumnos - Resultado consulta:`, alumnos);
    if (alumnos) {
      console.log(`[GET] /api/alumnos - Cantidad de alumnos recuperados: ${alumnos.length}`);
    }
    if (errorAlumnos) return respondError(req, res, 404, errorAlumnos);
    alumnos.length === 0
      ? respondSuccess(req, res, 204)
      : respondSuccess(req, res, 200, alumnos);
  } catch (error) {
    console.error("[GET] /api/alumnos - Error:", error);
    handleError(error, "alumnos.controller -> getAllAlumnos");
    respondError(req, res, 400, error.message);
  }
}

// Controlador para crear un nuevo alumno
async function createAlumnos(req, res) {
  console.log("[POST] /api/alumnos - Crear alumno", req.body);
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
  console.log(`[GET] /api/alumnos/${req.params.id} - Obtener alumno por ID`);
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
  console.log("[PUT] /api/alumnos/%s - Actualizar alumno", req.params.id, req.body);
  try {
    const { id } = req.params;
    // Lista de campos permitidos según el esquema real (completa)
    const allowedFields = [
      "nombreAlumno",
      "rutAlumno",
      "edadAlumno",
      "direccion",
      "telefonoAlumno",
      "email",
      "fechaIngreso",
      "nombreApoderado",
      "rutApoderado",
      "telefonoApoderado",
      "emailApoderado",
      "rrss",
      "conocimientosPrevios",
      "instrumentos",
      "estilosMusicales",
      "otroEstilo",
      "referenteMusical",
      "condicionAprendizaje",
      "detalleCondicionAprendizaje",
      "condicionMedica",
      "detalleCondicionMedica",
      "observaciones",
      "curso",
      "tipoCurso",
      "modalidadClase",
      "clase"
    ];
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
  console.log(`[DELETE] /api/alumnos/${req.params.id} - Eliminar alumno`);
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
