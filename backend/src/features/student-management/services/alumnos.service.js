"use strict";

import Alumno from "../../../core/models/alumnos.model.js";
import { handleError } from "../../../utils/errorHandler.util.js";

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
    console.log("[SERVICE] createAlumnos - Datos recibidos:", alumno);
    
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
    if (rutAlumno) {
      const alumnoFound = await Alumno.findOne({ rutAlumno: { $eq: rutAlumno } });
      if (alumnoFound) return [null, "El alumno ya existe"];
    }

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
    
    console.log("[SERVICE] createAlumnos - Nuevo alumno a guardar:", newAlumno);
    const savedAlumno = await newAlumno.save();
    console.log("[SERVICE] createAlumnos - Alumno guardado exitosamente:", savedAlumno);
    return [savedAlumno, null];
  } catch (error) {
    console.error("[SERVICE] createAlumnos - Error:", error);
    handleError(error, "alumnos.service -> createAlumnos");
    return [null, error.message || "Error al crear alumno"];
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

// Exportar las funciones individualmente
export {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
};

// Exportar el servicio como default también
export default {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
};
