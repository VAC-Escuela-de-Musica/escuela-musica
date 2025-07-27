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
        estado: { $ne: "cancelada" }, // Excluir clases canceladas
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
async function updateClase(id, clase, actualizadoPor = null) {
  try {
    const claseFound = await Clase.findById(id);
    if (!claseFound) return [null, "Clase no encontrada"];

    if (claseFound.estado === "cancelada") {
      return [null, "No se puede modificar una clase cancelada"];
    }

    const { titulo, descripcion, profesor, sala, horarios = [] } = clase;

    // Detectar cambio de horario (solo primer horario)
    let cambioHorario = false;
    let horaAnterior = null;
    let horaNueva = null;
    if (
      Array.isArray(horarios) && horarios.length > 0 &&
      Array.isArray(claseFound.horarios) && claseFound.horarios.length > 0
    ) {
      const hOld = claseFound.horarios[0];
      const hNew = horarios[0];
      if (
        hOld.dia === hNew.dia &&
        (hOld.horaInicio !== hNew.horaInicio || hOld.horaFin !== hNew.horaFin)
      ) {
        cambioHorario = true;
        horaAnterior = `${hOld.horaInicio} - ${hOld.horaFin}`;
        horaNueva = `${hNew.horaInicio} - ${hNew.horaFin}`;
      }
    }

    for (const horario of horarios) {
      const { dia, horaInicio, horaFin } = horario;
      const claseExistente = await Clase.findOne({
        _id: { $ne: id },
        estado: "programada",
        sala,
        horarios: {
          $elemMatch: {
            dia,
            $or: [
              { horaInicio: { $lt: horaFin, $gte: horaInicio } },
              { horaFin: { $gt: horaInicio, $lte: horaFin } },
              { horaInicio: { $lte: horaInicio }, horaFin: { $gte: horaFin } },
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

    // Notificar si hubo cambio de horario
    if (cambioHorario && claseFound.estudiantes && claseFound.estudiantes.length > 0) {
      try {
        const notificationService = (await import('../../communication/services/notification.service.js')).default;
        notificationService.notifyClassTimeChange(claseUpdated, horaAnterior, horaNueva, actualizadoPor)
          .then(result => {
            if (result.success) {
              console.log('✅ Notificaciones de cambio de horario enviadas correctamente');
            } else {
              console.error('❌ Error enviando notificaciones de cambio de horario:', result.error);
            }
          })
          .catch(error => {
            console.error('❌ Error en notificaciones de cambio de horario:', error);
          });
      } catch (notificationError) {
        console.error('❌ Error inicializando servicio de notificaciones:', notificationError);
      }
    }

    return [claseUpdated, null];
  } catch (error) {
    handleError(error, "clase.service -> updateClase");
  }
}

/**
 * Cancela una clase por su id
 * @param {string} id 
 * @param {Object} clase - Datos de la cancelación
 * @param {string} canceladoPor - ID del usuario que cancela la clase
 * @returns {Promise} Promesa con el objeto de la clase cancelada
 */
async function cancelClase(id, clase, canceladoPor = null) {
  try {
    const claseFound = await Clase.findById(id);
    if (!claseFound) return [null, "Clase no encontrada"];

    const { estado, motivo } = clase;

    const claseUpdated = await Clase.findByIdAndUpdate(
      id,
      { estado: estado },
      { new: true },
    );

    // Si la clase se está cancelando y tiene estudiantes, enviar notificaciones
    if (estado === "cancelada" && claseFound.estudiantes && claseFound.estudiantes.length > 0) {
      try {
        // Importar el servicio de notificaciones dinámicamente para evitar dependencias circulares
        const notificationService = (await import('../../communication/services/notification.service.js')).default;
        
        // Enviar notificaciones de forma asíncrona (no bloquear la respuesta)
        notificationService.notifyClassCancellation(claseUpdated, motivo, canceladoPor)
          .then(result => {
            if (result.success) {
              console.log('✅ Notificaciones de cancelación enviadas correctamente');
            } else {
              console.error('❌ Error enviando notificaciones:', result.error);
            }
          })
          .catch(error => {
            console.error('❌ Error en notificaciones de cancelación:', error);
          });
      } catch (notificationError) {
        console.error('❌ Error inicializando servicio de notificaciones:', notificationError);
      }
    }

    return [claseUpdated, null];
  } catch (error) {
    handleError(error, "clase.service -> cancelClase");        
  }
}


/**
 * Obtiene todas las clases programadas
 * @returns {Promise} Promesa con todas las clases programadas
 */
async function getAllProgrammedClases() {
  try {
    const clases = await Clase.find({ estado: "programada" });
    if (!clases) return [null, "No hay clases programadas"];

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getAllProgrammedClases");
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
      estado: "programada",
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
      estado: "programada",
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
      estado: "programada",
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

/**
 * Asigna un estudiante a una clase
 * @param {string} claseId - ID de la clase
 * @param {Object} estudianteData - Datos del estudiante a asignar
 * @returns {Promise} Promesa con el resultado de la asignación
 */
async function asignarEstudianteAClase(claseId, estudianteData) {
  try {
    const { alumnoId, estado = "activo", notas = "" } = estudianteData;

    // Verificar que la clase existe
    const clase = await Clase.findById(claseId);
    if (!clase) {
      return [null, "Clase no encontrada"];
    }

    // Verificar que el estudiante no esté ya asignado
    const estudianteYaAsignado = clase.estudiantes.find(
      est => est.alumno.toString() === alumnoId
    );

    if (estudianteYaAsignado) {
      return [null, "El estudiante ya está asignado a esta clase"];
    }

    // Agregar el estudiante a la clase
    clase.estudiantes.push({
      alumno: alumnoId,
      estado,
      notas,
      fechaAsignacion: new Date()
    });

    await clase.save();

    // Populate para devolver datos completos
    const claseActualizada = await Clase.findById(claseId)
      .populate('estudiantes.alumno', 'nombreAlumno rutAlumno email')
      .populate('profesor', 'nombreCompleto email');

    return [claseActualizada, null];
  } catch (error) {
    handleError(error, "clase.service -> asignarEstudianteAClase");
    return [null, "Error al asignar estudiante a la clase"];
  }
}

/**
 * Desasigna un estudiante de una clase
 * @param {string} claseId - ID de la clase
 * @param {string} alumnoId - ID del alumno
 * @returns {Promise} Promesa con el resultado de la desasignación
 */
async function desasignarEstudianteDeClase(claseId, alumnoId) {
  try {
    const clase = await Clase.findById(claseId);
    if (!clase) {
      return [null, "Clase no encontrada"];
    }

    // Encontrar y remover el estudiante
    const index = clase.estudiantes.findIndex(
      est => est.alumno.toString() === alumnoId
    );

    if (index === -1) {
      return [null, "El estudiante no está asignado a esta clase"];
    }

    clase.estudiantes.splice(index, 1);
    await clase.save();

    return [clase, null];
  } catch (error) {
    handleError(error, "clase.service -> desasignarEstudianteDeClase");
    return [null, "Error al desasignar estudiante de la clase"];
  }
}

/**
 * Actualiza el estado de un estudiante en una clase
 * @param {string} claseId - ID de la clase
 * @param {string} alumnoId - ID del alumno
 * @param {Object} datosActualizacion - Datos a actualizar
 * @returns {Promise} Promesa con el resultado de la actualización
 */
async function actualizarEstadoEstudiante(claseId, alumnoId, datosActualizacion) {
  try {
    const { estado, notas } = datosActualizacion;

    const clase = await Clase.findById(claseId);
    if (!clase) {
      return [null, "Clase no encontrada"];
    }

    const estudiante = clase.estudiantes.find(
      est => est.alumno.toString() === alumnoId
    );

    if (!estudiante) {
      return [null, "El estudiante no está asignado a esta clase"];
    }

    // Actualizar datos
    if (estado) estudiante.estado = estado;
    if (notas !== undefined) estudiante.notas = notas;

    await clase.save();

    // Populate para devolver datos completos
    const claseActualizada = await Clase.findById(claseId)
      .populate('estudiantes.alumno', 'nombreAlumno rutAlumno email')
      .populate('profesor', 'nombreCompleto email');

    return [claseActualizada, null];
  } catch (error) {
    handleError(error, "clase.service -> actualizarEstadoEstudiante");
    return [null, "Error al actualizar estado del estudiante"];
  }
}

/**
 * Registra la asistencia de un estudiante
 * @param {string} claseId - ID de la clase
 * @param {string} alumnoId - ID del alumno
 * @param {Object} datosAsistencia - Datos de asistencia
 * @returns {Promise} Promesa con el resultado del registro
 */
async function registrarAsistencia(claseId, alumnoId, datosAsistencia) {
  try {
    const { fecha, presente, observaciones = "" } = datosAsistencia;

    const clase = await Clase.findById(claseId);
    if (!clase) {
      return [null, "Clase no encontrada"];
    }

    const estudiante = clase.estudiantes.find(
      est => est.alumno.toString() === alumnoId
    );

    if (!estudiante) {
      return [null, "El estudiante no está asignado a esta clase"];
    }

    // Verificar si ya existe un registro para esa fecha
    const asistenciaExistente = estudiante.asistencia.find(
      a => a.fecha.toDateString() === new Date(fecha).toDateString()
    );

    if (asistenciaExistente) {
      // Actualizar registro existente
      asistenciaExistente.presente = presente;
      asistenciaExistente.observaciones = observaciones;
    } else {
      // Crear nuevo registro
      estudiante.asistencia.push({
        fecha: new Date(fecha),
        presente,
        observaciones
      });
    }

    await clase.save();

    return [clase, null];
  } catch (error) {
    handleError(error, "clase.service -> registrarAsistencia");
    return [null, "Error al registrar asistencia"];
  }
}

/**
 * Obtiene las clases de un estudiante específico
 * @param {string} alumnoId - ID del alumno
 * @returns {Promise} Promesa con las clases del estudiante
 */
async function getClasesDeEstudiante(alumnoId) {
  try {
    const clases = await Clase.find({
      'estudiantes.alumno': alumnoId
    })
    .populate('estudiantes.alumno', 'nombreAlumno rutAlumno email')
    .populate('profesor', 'nombreCompleto email')
    .sort({ 'horarios.dia': 1, 'horarios.horaInicio': 1 });

    return [clases, null];
  } catch (error) {
    handleError(error, "clase.service -> getClasesDeEstudiante");
    return [null, "Error al obtener clases del estudiante"];
  }
}

/**
 * Obtiene los estudiantes de una clase específica
 * @param {string} claseId - ID de la clase
 * @returns {Promise} Promesa con los estudiantes de la clase
 */
async function getEstudiantesDeClase(claseId) {
  try {
    const clase = await Clase.findById(claseId)
      .populate('estudiantes.alumno', 'nombreAlumno rutAlumno email edadAlumno telefonoAlumno')
      .populate('profesor', 'nombreCompleto email');

    if (!clase) {
      return [null, "Clase no encontrada"];
    }

    return [clase.estudiantes, null];
  } catch (error) {
    handleError(error, "clase.service -> getEstudiantesDeClase");
    return [null, "Error al obtener estudiantes de la clase"];
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
  asignarEstudianteAClase,
  desasignarEstudianteDeClase,
  actualizarEstadoEstudiante,
  registrarAsistencia,
  getClasesDeEstudiante,
  getEstudiantesDeClase
};
