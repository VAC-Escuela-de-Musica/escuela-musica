'use strict'

import Alumno from '../../../core/models/alumnos.model.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

// Función para obtener todos los alumnos

async function getAllAlumnos () {
  try {
    const alumnos = await Alumno.find().exec()
    if (!alumnos) {
      return [null, 'No se encontraron alumnos']
    }
    return [alumnos, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> getAllAlumnos')
  }
}

// Función para crear un nuevo alumno

async function createAlumnos (alumno) {
  try {
    console.log('[SERVICE] createAlumnos - Datos recibidos:', alumno)

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
      emailApoderado,
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
      clase
    } = alumno

    // Verificar si ya existe un alumno con el mismo RUT
    if (rutAlumno) {
      const alumnoFound = await Alumno.findOne({ rutAlumno: { $eq: rutAlumno } })
      if (alumnoFound) return [null, 'El alumno ya existe']
    }
    // Verificar si ya existe un alumno con el mismo email
    if (email) {
      const alumnoEmailFound = await Alumno.findOne({ email: { $eq: email } })
      if (alumnoEmailFound) return [null, 'Ya existe un alumno con ese email']
    }
    // Hashear la contraseña
    if (!alumno.password) return [null, 'La contraseña es obligatoria']
    const hashedPassword = await Alumno.encryptPassword(alumno.password)

    const nuevoAlumno = new Alumno({
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
      emailApoderado,
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
      password: hashedPassword,
      roles: ['student']
    })

    console.log('[SERVICE] createAlumnos - Nuevo alumno a guardar:', nuevoAlumno)
    const savedAlumno = await nuevoAlumno.save()
    console.log('[SERVICE] createAlumnos - Alumno guardado exitosamente:', savedAlumno)
    return [savedAlumno, null]
  } catch (error) {
    console.error('[SERVICE] createAlumnos - Error:', error)
    handleError(error, 'alumnos.service -> createAlumnos')
    return [null, error.message || 'Error al crear alumno']
  }
}

// Función para obtener un alumno por su ID

async function getAlumnosById (id) {
  try {
    const alumno = await Alumno.findById(id).exec()
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }
    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> getAlumnosById')
  }
}

// Funcion para actualizar un alumno por su ID
async function updateAlumnos (id, alumnoData) {
  try {
    const alumno = await Alumno.findByIdAndUpdate(id, alumnoData, {
      new: true
    })
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }
    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> updateAlumno')
    return [null, 'Error al actualizar el alumno']
  }
}

// Función para eliminar un alumno por su ID
async function deleteAlumnos (id) {
  try {
    const alumno = await Alumno.findByIdAndDelete(id)
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }
    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> deleteAlumno')
    return [null, 'Error al eliminar el alumno']
  }
}

// Buscar alumno por email
async function getAlumnoByEmail (email) {
  try {
    const alumno = await Alumno.findOne({ email }).select('+password').exec()
    if (!alumno) return [null, 'Alumno no encontrado']
    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> getAlumnoByEmail')
    return [null, error.message || 'Error al buscar alumno por email']
  }
}

// Buscar alumno por userId (que es el mismo que el _id del documento)
async function getAlumnoByUserId (userId) {
  try {
    const alumno = await Alumno.findById(userId).exec()
    if (!alumno) return [null, 'Alumno no encontrado']
    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> getAlumnoByUserId')
    return [null, error.message]
  }
}

/**
 * Obtiene las clases asignadas a un estudiante
 * @param {string} alumnoId - ID del alumno
 * @returns {Promise} Promesa con las clases del estudiante
 */
async function getClasesDeAlumno(alumnoId) {
  try {
    const alumno = await Alumno.findById(alumnoId)
      .populate('clases.clase', 'titulo descripcion sala horarios')
      .exec()

    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }

    return [alumno.clases, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> getClasesDeAlumno')
    return [null, error.message]
  }
}

/**
 * Asigna una clase a un estudiante
 * @param {string} alumnoId - ID del alumno
 * @param {Object} claseData - Datos de la clase a asignar
 * @returns {Promise} Promesa con el resultado de la asignación
 */
async function asignarClaseAAlumno(alumnoId, claseData) {
  try {
    const { claseId, estado = 'activo', notas = '' } = claseData

    const alumno = await Alumno.findById(alumnoId)
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }

    // Verificar que la clase no esté ya asignada
    const claseYaAsignada = alumno.clases.find(
      c => c.clase.toString() === claseId
    )

    if (claseYaAsignada) {
      return [null, 'El alumno ya tiene asignada esta clase']
    }

    // Agregar la clase al alumno
    alumno.clases.push({
      clase: claseId,
      estado,
      notas,
      fechaAsignacion: new Date()
    })

    await alumno.save()

    // Populate para devolver datos completos
    const alumnoActualizado = await Alumno.findById(alumnoId)
      .populate('clases.clase', 'titulo descripcion sala horarios')
      .exec()

    return [alumnoActualizado, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> asignarClaseAAlumno')
    return [null, error.message]
  }
}

/**
 * Desasigna una clase de un estudiante
 * @param {string} alumnoId - ID del alumno
 * @param {string} claseId - ID de la clase
 * @returns {Promise} Promesa con el resultado de la desasignación
 */
async function desasignarClaseDeAlumno(alumnoId, claseId) {
  try {
    const alumno = await Alumno.findById(alumnoId)
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }

    // Encontrar y remover la clase
    const index = alumno.clases.findIndex(
      c => c.clase.toString() === claseId
    )

    if (index === -1) {
      return [null, 'El alumno no tiene asignada esta clase']
    }

    alumno.clases.splice(index, 1)
    await alumno.save()

    return [alumno, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> desasignarClaseDeAlumno')
    return [null, error.message]
  }
}

/**
 * Actualiza el estado de una clase para un estudiante
 * @param {string} alumnoId - ID del alumno
 * @param {string} claseId - ID de la clase
 * @param {Object} datosActualizacion - Datos a actualizar
 * @returns {Promise} Promesa con el resultado de la actualización
 */
async function actualizarEstadoClase(alumnoId, claseId, datosActualizacion) {
  try {
    const { estado, notas } = datosActualizacion

    const alumno = await Alumno.findById(alumnoId)
    if (!alumno) {
      return [null, 'Alumno no encontrado']
    }

    const clase = alumno.clases.find(
      c => c.clase.toString() === claseId
    )

    if (!clase) {
      return [null, 'El alumno no tiene asignada esta clase']
    }

    // Actualizar datos
    if (estado) clase.estado = estado
    if (notas !== undefined) clase.notas = notas

    await alumno.save()

    // Populate para devolver datos completos
    const alumnoActualizado = await Alumno.findById(alumnoId)
      .populate('clases.clase', 'titulo descripcion sala horarios')
      .exec()

    return [alumnoActualizado, null]
  } catch (error) {
    handleError(error, 'alumnos.service -> actualizarEstadoClase')
    return [null, error.message]
  }
}

// Exportar las funciones individualmente
export {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
  getAlumnoByEmail,
  getAlumnoByUserId
}

// Exportar el servicio como default también
export default {
  getAllAlumnos,
  createAlumnos,
  getAlumnosById,
  updateAlumnos,
  deleteAlumnos,
  getAlumnoByEmail,
  getAlumnoByUserId,
  getClasesDeAlumno,
  asignarClaseAAlumno,
  desasignarClaseDeAlumno,
  actualizarEstadoClase
}
