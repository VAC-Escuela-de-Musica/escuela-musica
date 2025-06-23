"use strict";

import Clase from "../models/clase.entity.js";
import { handleError } from "../utils/errorHandler.js";

/**
 * Crea una nueva clase en la base de datos
 * @param {Object} clase
 * @returns {Promise} Promesa con el objeto clase creado
 */
async function createClase(clase) {
    try {
       const { titulo, descripcion, profesor, sala, horarios = [] } = clase;
        
       // implementar logica si el horario ya existe

       const newClase = new Clase({
            titulo,
            descripcion,
            profesor,
            sala,
            horarios,
        });
        await newClase.save();

        return [newClase, null];
    } catch (error) {
        handleError(error, "clase.service -> createClase");
    }
}

/**
 * Obtiene todos los horarios de la base de datos
 * @returns {Promise} Promesa con el objeto de los horarios
 */
async function getAllClases() {
    try {
        const clases = await Clase.find();
        
        if (!clases) return [null, "No hay clases registradas"];

        return [clases, null];
    } catch (error) {
        handleError(error, "clase.service -> getAllClases");
    }
}

/**
 * Obtiene un horario por su id
 * @param {string} id
 * @returns {Promise} 
 */
async function getClaseById(id) {
    try {
        const clase = await Clase.findById(id)
            .exec();

        if (!clase) return [null, "Clase no encontrada"];

        return [clase, null];
    } catch (error) {
        handleError(error, "clase.service -> getClaseById");
    }
}

/**
 * Actualiza un horario por su id
 * @param {string} id 
 * @param {Object} horario 
 * @returns {Promise} Promesa con el objeto de horario actualizado
 */
async function updateClase(id, clase) {
    try {
        const claseFound = await Clase.findById(id);
        if (!claseFound) return [null, "Clase no encontrada"];

        const { titulo, descripcion, profesor, sala, horarios = [] } = clase;

        const claseUpdated = await Clase.findByIdAndUpdate(
            id,
            {
                titulo,
                descripcion,
                profesor,
                sala,
                horarios,
            },
            { new: true },
        );

        return [claseUpdated, null];
    } catch (error) {
        handleError(error, "clase.service -> updateClase");
    }
}

/**
 * Cancela una clase por su id
 * @param {string} id 
 * @returns {Promise} Promesa con el objeto de la clase cancelada
 */
async function cancelClase(id, clase) {
    try {
        const claseFound = await Clase.findById(id);
        if (!claseFound) return [null, "Clase no encontrada"];

        const { estado } = clase;

        const claseUpdated = await Clase.findByIdAndUpdate(
            id,
            { estado: estado },
            { new: true },
        );

        return [claseUpdated, null];
    } catch (error) {
        handleError(error, "clase.service -> cancelClase");        
    }
}

export default {
    createClase,
    getAllClases,
    getClaseById,
    updateClase,
    cancelClase,
};
