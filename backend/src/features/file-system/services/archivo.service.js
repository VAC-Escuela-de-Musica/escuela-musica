"use strict";

import Archivo from "../../../core/models/archivo.entity.js";
import { handleError } from "../../../core/utils/errorHandler.js";

/**
 * Obtiene todos los archivos
 * @returns {Promise} Promesa con el objeto de archivos
 */
async function getArchivos() {
  try {
    const archivos = await Archivo.find()
      .populate("clase")
      .lean();

    if (!archivos) return [null, "No hay archivos registrados"];

    return [archivos, null];
  } catch (error) {
    handleError(error, "archivo.service -> getArchivos");
    return [null, "Error al obtener los archivos"];
  }
}

/**
 * Crea un nuevo archivo
 * @param {Object} archivo Objeto de archivo
 * @returns {Promise} Promesa con el objeto de archivo creado
 */
async function createArchivo(archivo) {
  try {
    const newArchivo = new Archivo(archivo);
    await newArchivo.save();

    return [newArchivo, null];
  } catch (error) {
    handleError(error, "archivo.service -> createArchivo");
    return [null, "Error al crear el archivo"];
  }
}

/**
 * Obtiene un archivo por su id
 * @param {string} id Id del archivo
 * @returns {Promise} Promesa con el objeto de archivo
 */
async function getArchivoById(id) {
  try {
    const archivo = await Archivo.findById(id)
      .populate("clase")
      .lean();

    if (!archivo) return [null, "El archivo no existe"];

    return [archivo, null];
  } catch (error) {
    handleError(error, "archivo.service -> getArchivoById");
    return [null, "Error al obtener el archivo"];
  }
}

/**
 * Actualiza un archivo por su id
 * @param {string} id Id del archivo
 * @param {Object} archivo Objeto de archivo
 * @returns {Promise} Promesa con el objeto de archivo actualizado
 */
async function updateArchivo(id, archivo) {
  try {
    const archivoFound = await Archivo.findById(id);
    if (!archivoFound) return [null, "El archivo no existe"];

    const archivoUpdated = await Archivo.findByIdAndUpdate(
      id,
      archivo,
      { new: true },
    ).populate("clase");

    return [archivoUpdated, null];
  } catch (error) {
    handleError(error, "archivo.service -> updateArchivo");
    return [null, "Error al actualizar el archivo"];
  }
}

/**
 * Elimina un archivo por su id
 * @param {string} id Id del archivo
 * @returns {Promise} Promesa con el objeto de archivo eliminado
 */
async function deleteArchivo(id) {
  try {
    const archivoFound = await Archivo.findById(id);
    if (!archivoFound) return [null, "El archivo no existe"];

    const archivoDeleted = await Archivo.findByIdAndDelete(id);
    return [archivoDeleted, null];
  } catch (error) {
    handleError(error, "archivo.service -> deleteArchivo");
    return [null, "Error al eliminar el archivo"];
  }
}

export default {
  getArchivos,
  createArchivo,
  getArchivoById,
  updateArchivo,
  deleteArchivo,
}; 