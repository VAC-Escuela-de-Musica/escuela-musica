"use strict";

import Clase from "../models/clase.entity.js";
import { handleError } from "../../../core/utils/errorHandler.util.js";

/**
 * Crea una nueva clase en la base de datos
 * @param {Object} clase
 * @returns {Promise} Promesa con el objeto clase creado
 */
async function createClase(clase) {
  try {
    const { titulo, descripcion, profesor, sala, horarios = [] } = clase;
        
    for (const horario of horarios) {
      const { dia, horaInicio, horaFin } = horario;

      const claseExistente = await Clase.findOne({
        sala,
        horarios: {
          $elemMatch: {
            dia,
            $or: [
              {
                horaInicio: { $lt: horaFin, $gte: horaInicio },
              },
              {
                horaFin: { $gt: horaInicio, $lte: horaFin },
              },
              {
                horaInicio: { $lte: horaInicio },
                horaFin: { $gte: horaFin },
              },
            ],
          },
        },
      });

      if (claseExistente) {
        return [null, "Ya existe una clase programada en la sala y horario seleccionado"];
      }
    }

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
    const clase = await Clase.findById(id).exec();

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

    for (const horario of horarios) {
      const { dia, horaInicio, horaFin } = horario;

      const claseExistente = await Clase.findOne({
        _id: { $ne: id },
        sala,
        horarios: {
          $elemMatch: {
            dia,
            $or: [
              {
                horaInicio: { $lt: horaFin, $gte: horaInicio },
              },
              {
                horaFin: { $gt: horaInicio, $lte: horaFin },
              },
              {
                horaInicio: { $lte: horaInicio },
                horaFin: { $gte: horaFin },
              },
            ],
          },
        },
      });

      if (claseExistente) {
        return [null, "Ya existe una clase programada en la sala y horario seleccionado"];
      }
    }

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

/**
 * Obtiene las clases del día actual
 * @returns {Promise} Promesa con las clases del día
 */
async function getTodayClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const clases = await Clase.find({
      horarios: {
        $elemMatch: {
          dia: formattedDate,
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getTodayClases");
  }
}

/**
 * Obtiene las clases de los días siguientes
 * @returns {Promise} Promesa con las clases de los días siguientes
 */
async function getNextClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const clases = await Clase.find({
      horarios: {
        $elemMatch: {
          dia: { $gt: formattedDate },
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getNextClases");
  }
}

/**
 * Obtiene todas las clases canceladas
 * @returns {Promise} Promesa con las clases canceladas
 */
async function getCanceledClases() {
  try {
    const clases = await Clase.find({ estado: "cancelada" });
    if (!clases) return [null, "No hay clases canceladas"];

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getCanceledClases");
  }
}

/**
 * Obtiene las clases de los días anteriores
 * @returns {Promise} Promesa con las clases de los días anteriores
 */
async function getPreviousClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    const clases = await Clase.find({
      horarios: {
        $elemMatch: {
          dia: { $lt: formattedDate },
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getPreviousClases");
  }
}

/**
 * Obtiene las clases canceladas de los días anteriores
 * @returns {Promise} Promesa con las clases canceladas anteriores
 */
async function getPreviousCanceledClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const clases = await Clase.find({
      estado: "cancelada",
      horarios: {
        $elemMatch: {
          dia: { $lt: formattedDate },
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getPreviousCanceledClases");
  }
}

/**
 * Obtiene las clases canceladas del día actual
 * @returns {Promise} Promesa con las clases canceladas del día
 */
async function getTodayCanceledClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const clases = await Clase.find({
      estado: "cancelada",
      horarios: {
        $elemMatch: {
          dia: formattedDate,
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getTodayCanceledClases");
  }
}

/**
 * Obtiene las clases canceladas de los días siguientes
 * @returns {Promise} Promesa con las clases canceladas de los días siguientes
 */
async function getNextCanceledClases() {
  try {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const clases = await Clase.find({
      estado: "cancelada",
      horarios: {
        $elemMatch: {
          dia: { $gt: formattedDate },
        },
      },
    });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getNextCanceledClases");
  }
}

/**
 * Obtiene las clases de un día específico con filtros opcionales (sala, horaInicio, horaFin)
 * @param {Object} filtros
 * @param {string} filtros.fecha - Formato dd-mm-yyyy
 * @param {string} [filtros.sala]
 * @param {string} [filtros.horaInicio] - Formato HH:mm
 * @param {string} [filtros.horaFin] - Formato HH:mm
 * @returns {Promise} Promesa con las clases del día filtradas
 */
async function getHorarioDia({ fecha, sala, horaInicio, horaFin, profesor }) {
  try {
    if (!fecha) return [null, "La fecha es requerida"];

    const query = {
      estado: "programada",
      horarios: {
        $elemMatch: {
          dia: fecha,
        },
      },
    };

    if (sala && sala !== "0") {
      query.sala = sala;
    }

    if (profesor && profesor !== "0") {
      query.profesor = profesor;
    }

    if (horaInicio && horaFin) {
      query.horarios.$elemMatch.horaInicio = { $lte: horaFin };
      query.horarios.$elemMatch.horaFin = { $gte: horaInicio };
    } else if (horaInicio) {
      query.horarios.$elemMatch.horaFin = { $gte: horaInicio };
    } else if (horaFin) {
      query.horarios.$elemMatch.horaInicio = { $lte: horaFin };
    }

    const clases = await Clase.find(query);

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getHorarioDia");
  }
}

/**
 * Obtiene las clases de una semana específica con filtros opcionales (sala, horaInicio, horaFin)
 * @param {Object} filtros
 * @param {string} filtros.fecha - Formato dd-mm-yyyy
 * @param {string} [filtros.sala]
 * @param {string} [filtros.horaInicio] - Formato HH:mm
 * @param {string} [filtros.horaFin] - Formato HH:mm
 * @returns {Promise} Promesa con las clases de la semana filtradas
 */
async function getHorarioSemana({ fecha, sala, horaInicio, horaFin, profesor }) {
  try {
    if (!fecha) return [null, "La fecha es requerida"];

    const [dd, mm, yyyy] = fecha.split("-").map(Number);
    const startDate = new Date(yyyy, mm - 1, dd);

    
    const dayOfWeek = startDate.getDay(); 
    const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() + offset);

    const diasSemana = [];
    for (let i = 0; i < 5; i++) { 
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const diaStr = `${d.getDate().toString().padStart(2, "0")}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${d.getFullYear()}`;
      diasSemana.push(diaStr);
    }

    const query = {
      estado: "programada",
      horarios: {
        $elemMatch: {
          dia: { $in: diasSemana },
        },
      },
    };

    if (sala && sala !== "0") {
      query.sala = sala;
    }

    if (profesor && profesor !== "0") {
      query.profesor = profesor;
    }

    if (horaInicio && horaFin) {
      query.horarios.$elemMatch.horaInicio = { $lte: horaFin };
      query.horarios.$elemMatch.horaFin = { $gte: horaInicio };
    } else if (horaInicio) {
      query.horarios.$elemMatch.horaFin = { $gte: horaInicio };
    } else if (horaFin) {
      query.horarios.$elemMatch.horaInicio = { $lte: horaFin };
    }

    const clases = await Clase.find(query);

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getHorarioSemana");
  }
}

/**
 * Obtiene las clases de un mes específico con filtros opcionales (sala, horaInicio, horaFin)
 * @param {Object} filtros
 * @param {string} filtros.fecha - Formato dd-mm-yyyy
 * @param {string} [filtros.sala]
 * @param {string} [filtros.horaInicio] - Formato HH:mm
 * @param {string} [filtros.horaFin] - Formato HH:mm
 * @returns {Promise} Promesa con las clases del mes filtradas
 */
async function getHorarioMes({ mes, year, sala, horaInicio, horaFin, profesor }) {
  try {
    if (mes == null || year == null) return [null, "Mes y año son requeridos"];

    const primerDia = new Date(year, mes - 1, 1);
    const ultimoDia = new Date(year, mes, 0);

    const formatDate = (d) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

    const diasMes = [];
    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      diasMes.push(formatDate(d));
    }

    const query = {
      estado: "programada",
      "horarios.dia": { $in: diasMes },
    };

    if (sala && sala !== "0") {
      query.sala = sala;
    }

    if (profesor && profesor !== "0") {
      query.profesor = profesor;
    }

    if (horaInicio && horaFin) {
      query["horarios.horaInicio"] = { $lte: horaFin };
      query["horarios.horaFin"] = { $gte: horaInicio };
    } else if (horaInicio) {
      query["horarios.horaFin"] = { $gte: horaInicio };
    } else if (horaFin) {
      query["horarios.horaInicio"] = { $lte: horaFin };
    }

    const clases = await Clase.find(query);

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getHorarioMes");
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
  getCanceledClases,
  getPreviousClases,
  getPreviousCanceledClases,
  getTodayCanceledClases,
  getNextCanceledClases,
  getHorarioDia,
  getHorarioSemana,
  getHorarioMes,
};
