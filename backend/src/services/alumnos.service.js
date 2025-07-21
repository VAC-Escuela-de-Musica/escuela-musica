"use strict";

import Alumno from "../models/alumnos.model.js";
import { handleError } from "../utils/errorHandler.js";

// Función para obtener todos los alumnos

async function getAllAlumnos() {
  try {
    const alumnos = await Alumno.find().exec();
    if (!alumnos) {
      return [null, "No se encontraron alumnos"];
    }
    return [alumnos, null];
  } catch (error) {
    handleError(error, "alumnos.service -> getAllAlumnos");
  }
}

// Función para crear un nuevo alumno

async function createAlumnos(alumno) {
  try {
    console.log("Datos recibidos en backend:", alumno);
    const {
      nombreAlumno,
      rutAlumno,
      edadAlumno,
      direccion,
      telefonoAlumno,
      email,
      fechaIngreso,
      nombreApoderado,
      rutApoderado,
      telefonoApoderado,
      rrss,
      conocimientosPrevios,
      instrumentos,
      estilosMusicales,
      otroEstilo,
      referenteMusical,
      condicionAprendizaje,
      detalleCondicionAprendizaje,
      condicionMedica,
      detalleCondicionMedica,
      observaciones,
      curso,
      tipoCurso,
      modalidadClase,
      clase,
    } = alumno;

    // Verificar si ya existe un alumno con el mismo RUT
    const alumnoFound = await Alumno.findOne({ rutAlumno: { $eq: rutAlumno } });
    if (alumnoFound) return [null, "El alumno ya existe"];

    const newAlumno = new Alumno({
      nombreAlumno,
      rutAlumno,
      edadAlumno,
      direccion,
      telefonoAlumno,
      email,
      fechaIngreso,
      nombreApoderado,
      rutApoderado,
      telefonoApoderado,
      rrss,
      conocimientosPrevios,
      instrumentos,
      estilosMusicales,
      otroEstilo,
      referenteMusical,
      condicionAprendizaje,
      detalleCondicionAprendizaje,
      condicionMedica,
      detalleCondicionMedica,
      observaciones,
      curso,
      tipoCurso,
      modalidadClase,
      clase,
    });
    const savedAlumno = await newAlumno.save();
    return [savedAlumno, null];
  } catch (error) {
    handleError(error, "alumnos.service -> createAlumnos");
  }
}

// Función para obtener un alumno por su ID

async function getAlumnosById(id) {
  try {
    const alumno = await Alumno.findById(id).exec();
    if (!alumno) {
      return [null, "Alumno no encontrado"];
    }
    return [alumno, null];
  } catch (error) {
    handleError(error, "alumnos.service -> getAlumnosById");
  }
}

// Funcion para actualizar un alumno por su ID
async function updateAlumnos(id, alumnoData) {
  try {
    const alumno = await Alumno.findByIdAndUpdate(id, alumnoData, {
      new: true,
    });
    if (!alumno) {
      return [null, "Alumno no encontrado"];
    }
    return [alumno, null];
  } catch (error) {
    handleError(error, "alumnos.service -> updateAlumno");
    return [null, "Error al actualizar el alumno"];
  }
}

// Función para eliminar un alumno por su ID
async function deleteAlumnos(id) {
  try {
    const alumno = await Alumno.findByIdAndDelete(id);
    if (!alumno) {
      return [null, "Alumno no encontrado"];
    }
    return [alumno, null];
  } catch (error) {
    handleError(error, "alumnos.service -> deleteAlumno");
    return [null, "Error al eliminar el alumno"];
  }
}

export default {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
};
