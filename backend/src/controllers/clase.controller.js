"user strict";

import claseService from "../services/clase.service.js";
import { handleError } from "../utils/errorHandler.js";
import { respondError, respondSuccess } from "../utils/resHandler.js";
import { 
    claseBodySchema, 
    claseIdSchema, 
    claseCancelSchema } from "../schema/clase.schema.js";
import User from "../models/user.model.js";

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
 * Obtiene un horario por su id
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

/**
 * Obtiene las clases del día actual
 * @param {Object} req 
 * @param {Object} res
 */
async function getTodayClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getTodayClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getTodayClases");
        respondError(req, res, 500, "No se pudieron obtener las clases del día");
    }
}

/**
 * Obtiene las clases de los días siguientes
 * @param {Object} req 
 * @param {Object} res
 */
async function getNextClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getNextClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getNextClases");
        respondError(req, res, 500, "No se pudieron obtener las clases siguientes");
    }
}

/**
 * Obtiene todas las clases canceladas
 * @param {Object} req
 * @param {Object} res
 */
async function getAllCanceledClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getCanceledClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getCanceledClases");
        respondError(req, res, 500, "No se pudieron obtener las clases canceladas");
    }
}

/**
 * Obtiene las clases de los días anteriores
 * @param {Object} req 
 * @param {Object} res
 */
async function getPreviousClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getPreviousClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getPreviousClases");
        respondError(req, res, 500, "No se pudieron obtener las clases anteriores");
    }
}

/**
 * Obtiene las clases canceladas de los días anteriores
 * @param {Object} req 
 * @param {Object} res
 */
async function getPreviousCanceledClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getPreviousCanceledClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getPreviousCanceledClases");
        respondError(req, res, 500, "No se pudieron obtener las clases canceladas anteriores");
    }
}

/**
 * Obtiene las clases canceladas del día actual
 * @param {Object} req 
 * @param {Object} res
 */
async function getTodayCanceledClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getTodayCanceledClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getTodayCanceledClases");
        respondError(req, res, 500, "No se pudieron obtener las clases canceladas de hoy");
    }
}

/**
 * Obtiene las clases canceladas de los días siguientes
 * @param {Object} req 
 * @param {Object} res
 */
async function getNextCanceledClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getNextCanceledClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getNextCanceledClases");
        respondError(req, res, 500, "No se pudieron obtener las clases canceladas próximas");
    }
}

/**
 * Obtiene el horario del día
 * @param {Object} req 
 * @param {Object} res
 */
async function getHorarioDia(req, res) {
    try {
        const { fecha, sala, horaInicio, horaFin, profesor } = req.query;

        const [clases, errorClases] = await claseService.getHorarioDia({
            fecha,
            sala,
            horaInicio,
            horaFin,
            profesor,
        });

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getHorarioDia");
        respondError(req, res, 500, "No se pudo obtener el horario del día");
    }
}

/**
 * Obtiene el horario de la semana
 * @param {Object} req 
 * @param {Object} res
 */
async function getHorarioSemana(req, res) {
    try {
        const { fecha, sala, horaInicio, horaFin, profesor } = req.query;

        const [clases, errorClases] = await claseService.getHorarioSemana({
            fecha,
            sala,
            horaInicio,
            horaFin,
            profesor,
        });

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getHorarioSemana");
        respondError(req, res, 500, "No se pudo obtener el horario de la semana");
    }
}

/**
 * Obtiene el horario del mes
 * @param {Object} req 
 * @param {Object} res
 */
async function getHorarioMes(req, res) {
    try {
        const { mes, year, sala, horaInicio, horaFin, profesor } = req.query;

        if (!mes || !year) return respondError(req, res, 400, "Mes y año son requeridos");

        const [clases, errorClases] = await claseService.getHorarioMes({
            mes,
            year,
            sala,
            horaInicio,
            horaFin,
            profesor,
        });

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getHorarioMes");
        respondError(req, res, 500, "No se pudo obtener el horario del mes");
    }
}

/**
 * Obiene los profesores
 * @param {Object} req 
 * @param {Object} res
 */
async function getProfesores(req, res) {
    try {
        const profesores = await User.find({ roles: "profesor" }).select("_id username");
        if (!profesores || profesores.length === 0) {
            return respondError(req, res, 404, "No se encontraron profesores");
        }
        respondSuccess(req, res, 200, profesores);
    } catch (error) {
        handleError(error, "clase.controller -> getProfesores");
        respondError(req, res, 500, "Error al obtener los profesores");
    }
}

/**
 * Obtiene un profesor por su id
 * @param {Object} req
 * @param {Object} res
 */
async function getProfesorById(req, res) {
    try {
        const { id } = req.params;
        const profesor = await User.findById(id).select("username");
        if (!profesor) {
            return respondError(req, res, 404, "Profesor no encontrado");
        }
        respondSuccess(req, res, 200, profesor);
    } catch (error) {
        handleError(error, "clase.controller -> getProfesorById");
        respondError(req, res, 500, "Error al obtener el profesor");
    }
}

export default { 
    createClase,
    getAllClases,
    getClaseById,
    updateClase,
    cancelClase,
    getTodayClases,
    getNextClases,
    getPreviousClases,
    getAllCanceledClases,
    getPreviousCanceledClases,
    getTodayCanceledClases,
    getNextCanceledClases,
    getHorarioDia,
    getHorarioSemana,
    getHorarioMes,
    getProfesores,
    getProfesorById,
};
