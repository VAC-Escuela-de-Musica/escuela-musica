"use strict";

import Alumno from "../../../core/models/alumno.entity.js";
import { handleError } from "../../../core/utils/errorHandler.js";

/**
 * Obtiene todos los alumnos
 * @returns {Promise} Promesa con el objeto de alumnos
 */
async function getAlumnos() {
  try {
    const alumnos = await Alumno.find()
      .populate("clasesInscritas.clase")
      .lean();

    if (!alumnos) return [null, "No hay alumnos registrados"];

    return [alumnos, null];
  } catch (error) {
    handleError(error, "alumno.service -> getAlumnos");
    return [null, "Error al obtener los alumnos"];
  }
}

/**
 * Crea un nuevo alumno
 * @param {Object} alumno Objeto de alumno
 * @returns {Promise} Promesa con el objeto de alumno creado
 */
async function createAlumno(alumno) {
  try {
    const { email } = alumno;

    const alumnoFound = await Alumno.findOne({ email });
    if (alumnoFound) return [null, "El alumno ya existe"];

    const newAlumno = new Alumno(alumno);
    await newAlumno.save();

    return [newAlumno, null];
  } catch (error) {
    handleError(error, "alumno.service -> createAlumno");
    return [null, "Error al crear el alumno"];
  }
}

/**
 * Obtiene un alumno por su id
 * @param {string} id Id del alumno
 * @returns {Promise} Promesa con el objeto de alumno
 */
async function getAlumnoById(id) {
  try {
    const alumno = await Alumno.findById(id)
      .populate("clasesInscritas.clase")
      .lean();

    if (!alumno) return [null, "El alumno no existe"];

    return [alumno, null];
  } catch (error) {
    handleError(error, "alumno.service -> getAlumnoById");
    return [null, "Error al obtener el alumno"];
  }
}

/**
 * Actualiza un alumno por su id
 * @param {string} id Id del alumno
 * @param {Object} alumno Objeto de alumno
 * @returns {Promise} Promesa con el objeto de alumno actualizado
 */
async function updateAlumno(id, alumno) {
  try {
    const alumnoFound = await Alumno.findById(id);
    if (!alumnoFound) return [null, "El alumno no existe"];

    const alumnoUpdated = await Alumno.findByIdAndUpdate(
      id,
      alumno,
      { new: true },
    ).populate("clasesInscritas.clase");

    return [alumnoUpdated, null];
  } catch (error) {
    handleError(error, "alumno.service -> updateAlumno");
    return [null, "Error al actualizar el alumno"];
  }
}

/**
 * Elimina un alumno por su id
 * @param {string} id Id del alumno
 * @returns {Promise} Promesa con el objeto de alumno eliminado
 */
async function deleteAlumno(id) {
  try {
    const alumnoFound = await Alumno.findById(id);
    if (!alumnoFound) return [null, "El alumno no existe"];

    const alumnoDeleted = await Alumno.findByIdAndDelete(id);
    return [alumnoDeleted, null];
  } catch (error) {
    handleError(error, "alumno.service -> deleteAlumno");
    return [null, "Error al eliminar el alumno"];
  }
}

export default {
  getAlumnos,
  createAlumno,
  getAlumnoById,
  updateAlumno,
  deleteAlumno,
}; 