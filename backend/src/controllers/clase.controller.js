"user strict";

import claseService from "../services/clase.service.js";
import { handleError } from "../utils/errorHandler.js";
import { respondError, respondSuccess } from "../utils/resHandler.js";
import { 
    claseBodySchema, 
    claseIdSchema, 
    claseCancelSchema } from "../schema/clase.schema.js";

/**
 * Crea un nuevo horario
 * @param {Object} req 
 * @param {Object} res 
 */
async function createClase(req, res) {
    try {
        const { body } = req;
        const { error: bodyError } = claseBodySchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);
        
        const [newClase, error] = await claseService.createClase(body);
        
        if (error) return respondError(req, res, 400, error);
        if (!newClase) {
            return respondError(req, res, 400, "No se pudo crear la clase");
        }   

        respondSuccess(req, res, 201, newClase);
    } catch (error) {
        handleError(error, "clase.controller -> createClase");
        respondError(req, res, 500, "No se pudo crear la clase");
    }
}

/**
 * Obtiene todos los horarios
 * @param {Object} req 
 * @param {Object} res 
 */
async function getAllClases(req, res) {
    try {
        const [clases, errorClases ] = await claseService.getAllClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        clases.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clases.controller -> getAllClases");
        respondError(req, res, 400, error.message);
    }
}   

/**
 * Actualiza un horario por su id
 * @param {Object} req 
 * @param {Object} res 
 */
async function getClaseById(req, res) {
    try {
        const { params } = req;
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        const [clase, errorClase] = await claseService.getClaseById(params.id);

        if (errorClase) return respondError(req, res, 404, errorClase);

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> getClaseById");
        respondError(req, res, 500, "No se pudo obtener la clase");
    }
}

/**
 * Actualiza un horario por su id
 * @param {Object} req 
 * @param {Object} res 
 */
async function updateClase(req, res) {
    try {
        const { params, body } = req;
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        const { error: bodyError } = claseBodySchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);

        const [clase, errorClase] = await claseService.updateClase(params.id, body);

        if (errorClase) return respondError(req, res, 404, errorClase);

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> updateClase");
        respondError(req, res, 500, "No se pudo modificar la clase");
    }
}

/**
 * Cancela un horario por su id
 * @param {Object} req 
 * @param {Object} res 
 */
async function cancelClase(req, res) {
    try {
        const { params, body } = req;
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        const { error: bodyError } = claseCancelSchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);

        const [clase, errorClase] = await claseService.cancelClase(params.id, body);

        if (errorClase) return respondError(req, res, 404, errorClase);

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> cancelClase");
        respondError(req, res, 500, "No se pudo cancelar la clase");
    }
}

export default { 
    createClase,
    getAllClases,
    getClaseById,
    updateClase,
    cancelClase,
};
