"user strict";

import claseService from "../services/clase.service.js";
import { handleError } from "../../../core/utils/errorHandler.util.js";
import { respondError, respondSuccess } from "../../../core/utils/responseHandler.util.js";
import { 
    claseBodySchema, 
    claseIdSchema, 
    claseCancelSchema,
    asignarEstudianteSchema,
    asistenciaSchema } from "../../../core/schemas/clase.schema.js";
import User from "../../../core/models/user.model.js";
import Profesor from "../../../core/models/profesores.model.js";

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
 * Obtiene todas las clases programadas
 * @param {Object} req
 * @param {Object} res
 */
async function getAllProgrammedClases(req, res) {
    try {
        const [clases, errorClases] = await claseService.getAllProgrammedClases();

        if (errorClases) return respondError(req, res, 404, errorClases);

        respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getAllProgrammedClases");
        respondError(req, res, 500, "No se pudieron obtener las clases programadas");
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
        const profesores = await Profesor.find().select("id nombre apellidos").exec();
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
        const profesor = await Profesor.findById(id).select("nombre apellidos");
        if (!profesor) {
            return respondError(req, res, 404, "Profesor no encontrado");
        }
        respondSuccess(req, res, 200, profesor);
    } catch (error) {
        handleError(error, "clase.controller -> getProfesorById");
        respondError(req, res, 500, "Error al obtener el profesor");
    }
}


/**
 * Crea múltiples clases en un solo request
 * @param {Object} req 
 * @param {Object} res 
 */
async function createClases(req, res) {
    try {
        const { body } = req;
        if (!Array.isArray(body)) {
            return respondError(req, res, 400, "El cuerpo de la solicitud debe ser un arreglo de clases");
        }

        const clasesCreadas = [];
        for (const clase of body) {
            const { error: bodyError } = claseBodySchema.validate(clase);
            if (bodyError) return respondError(req, res, 400, bodyError.message);

            const [nuevaClase, error] = await claseService.createClase(clase);
            if (error) return respondError(req, res, 400, error);
            if (!nuevaClase) return respondError(req, res, 400, "No se pudo crear una de las clases");

            clasesCreadas.push(nuevaClase);
        }

        respondSuccess(req, res, 201, clasesCreadas);
    } catch (error) {
        handleError(error, "clase.controller -> createClases");
        respondError(req, res, 500, "No se pudieron crear las clases");
    }
}

/**
 * Asigna un estudiante a una clase
 * @param {Object} req 
 * @param {Object} res 
 */
async function asignarEstudianteAClase(req, res) {
    try {
        const { params, body } = req;
        
        // Validar ID de la clase
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        // Validar datos del estudiante
        const { error: bodyError } = asignarEstudianteSchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);

        const [clase, error] = await claseService.asignarEstudianteAClase(params.id, body);
        
        if (error) return respondError(req, res, 400, error);
        if (!clase) {
            return respondError(req, res, 400, "No se pudo asignar el estudiante a la clase");
        }   

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> asignarEstudianteAClase");
        respondError(req, res, 500, "No se pudo asignar el estudiante a la clase");
    }
}

/**
 * Desasigna un estudiante de una clase
 * @param {Object} req 
 * @param {Object} res 
 */
async function desasignarEstudianteDeClase(req, res) {
    try {
        const { params } = req;
        const { alumnoId } = params;
        
        // Validar ID de la clase
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        if (!alumnoId) {
            return respondError(req, res, 400, "El ID del alumno es requerido");
        }

        const [clase, error] = await claseService.desasignarEstudianteDeClase(params.id, alumnoId);
        
        if (error) return respondError(req, res, 400, error);
        if (!clase) {
            return respondError(req, res, 400, "No se pudo desasignar el estudiante de la clase");
        }   

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> desasignarEstudianteDeClase");
        respondError(req, res, 500, "No se pudo desasignar el estudiante de la clase");
    }
}

/**
 * Actualiza el estado de un estudiante en una clase
 * @param {Object} req 
 * @param {Object} res 
 */
async function actualizarEstadoEstudiante(req, res) {
    try {
        const { params, body } = req;
        const { alumnoId } = params;
        
        // Validar ID de la clase
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        if (!alumnoId) {
            return respondError(req, res, 400, "El ID del alumno es requerido");
        }

        const [clase, error] = await claseService.actualizarEstadoEstudiante(params.id, alumnoId, body);
        
        if (error) return respondError(req, res, 400, error);
        if (!clase) {
            return respondError(req, res, 400, "No se pudo actualizar el estado del estudiante");
        }   

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> actualizarEstadoEstudiante");
        respondError(req, res, 500, "No se pudo actualizar el estado del estudiante");
    }
}

/**
 * Registra la asistencia de un estudiante
 * @param {Object} req 
 * @param {Object} res 
 */
async function registrarAsistencia(req, res) {
    try {
        const { params, body } = req;
        const { alumnoId } = params;
        
        // Validar ID de la clase
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        if (!alumnoId) {
            return respondError(req, res, 400, "El ID del alumno es requerido");
        }

        // Validar datos de asistencia
        const { error: bodyError } = asistenciaSchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);

        const [clase, error] = await claseService.registrarAsistencia(params.id, alumnoId, body);
        
        if (error) return respondError(req, res, 400, error);
        if (!clase) {
            return respondError(req, res, 400, "No se pudo registrar la asistencia");
        }   

        respondSuccess(req, res, 200, clase);
    } catch (error) {
        handleError(error, "clase.controller -> registrarAsistencia");
        respondError(req, res, 500, "No se pudo registrar la asistencia");
    }
}

/**
 * Obtiene las clases de un estudiante específico
 * @param {Object} req 
 * @param {Object} res 
 */
async function getClasesDeEstudiante(req, res) {
    try {
        const { params } = req;
        const { alumnoId } = params;

        if (!alumnoId) {
            return respondError(req, res, 400, "El ID del alumno es requerido");
        }

        const [clases, error] = await claseService.getClasesDeEstudiante(alumnoId);
        
        if (error) return respondError(req, res, 400, error);

        clases.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, clases);
    } catch (error) {
        handleError(error, "clase.controller -> getClasesDeEstudiante");
        respondError(req, res, 500, "No se pudieron obtener las clases del estudiante");
    }
}

/**
 * Obtiene los estudiantes de una clase específica
 * @param {Object} req 
 * @param {Object} res 
 */
async function getEstudiantesDeClase(req, res) {
    try {
        const { params } = req;
        
        // Validar ID de la clase
        const { error: paramsError } = claseIdSchema.validate(params);
        if (paramsError) return respondError(req, res, 400, paramsError.message);

        const [estudiantes, error] = await claseService.getEstudiantesDeClase(params.id);
        
        if (error) return respondError(req, res, 400, error);

        estudiantes.length === 0
            ? respondSuccess(req, res, 204)
            : respondSuccess(req, res, 200, estudiantes);
    } catch (error) {
        handleError(error, "clase.controller -> getEstudiantesDeClase");
        respondError(req, res, 500, "No se pudieron obtener los estudiantes de la clase");
    }
}

export {
    createClases,
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
    getAllProgrammedClases,
    asignarEstudianteAClase,
    desasignarEstudianteDeClase,
    actualizarEstadoEstudiante,
    registrarAsistencia,
    getClasesDeEstudiante,
    getEstudiantesDeClase
};
