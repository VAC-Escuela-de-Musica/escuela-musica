'use strict'

import Profesor from '../../../core/models/profesores.model.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

// Función para obtener todos los profesores
async function getAllProfesores () {
  try {
    const profesores = await Profesor.find().exec()
    if (!profesores) {
      return [null, 'No se encontraron profesores']
    }
    return [profesores, null]
  } catch (error) {
    handleError(error, 'profesores.service -> getAllProfesores')
    return [null, 'Error al obtener profesores']
  }
}

// Función para crear un nuevo profesor
async function createProfesores (profesorData) {
  try {
    console.log('[SERVICE] createProfesores - Datos recibidos:', profesorData)

    const {
      nombre,
      apellidos,
      rut,
      email,
      numero,
      password,
      sueldo,
      fechaContrato
    } = profesorData

    // Verificar si ya existe un profesor con el mismo RUT
    if (rut) {
      const profesorFound = await Profesor.findOne({ rut: { $eq: rut } })
      if (profesorFound) return [null, 'Ya existe un profesor con ese RUT']
    }

    // Verificar si ya existe un profesor con el mismo email
    if (email) {
      const profesorEmailFound = await Profesor.findOne({ email: { $eq: email } })
      if (profesorEmailFound) return [null, 'Ya existe un profesor con ese email']
    }

    // Hashear la contraseña
    if (!password) return [null, 'La contraseña es obligatoria']
    const hashedPassword = await Profesor.encryptPassword(password)

    const nuevoProfesor = new Profesor({
      nombre,
      apellidos,
      rut,
      email,
      numero,
      password: hashedPassword,
      sueldo,
      fechaContrato: fechaContrato || new Date(),
      roles: ['profesor']
    })

    console.log('[SERVICE] createProfesores - Nuevo profesor a guardar:', nuevoProfesor)
    const savedProfesor = await nuevoProfesor.save()
    console.log('[SERVICE] createProfesores - Profesor guardado exitosamente:', savedProfesor)
    return [savedProfesor, null]
  } catch (error) {
    console.error('[SERVICE] createProfesores - Error:', error)
    handleError(error, 'profesores.service -> createProfesores')
    return [null, error.message || 'Error al crear profesor']
  }
}

// Función para obtener un profesor por su ID
async function getProfesoresById (id) {
  try {
    const profesor = await Profesor.findById(id).exec()
    if (!profesor) {
      return [null, 'Profesor no encontrado']
    }
    return [profesor, null]
  } catch (error) {
    handleError(error, 'profesores.service -> getProfesoresById')
    return [null, 'Error al obtener profesor']
  }
}

// Función para actualizar un profesor por su ID
async function updateProfesores (id, profesorData) {
  try {
    console.log('[SERVICE] updateProfesores - ID:', id, 'Datos:', profesorData)

    // Si se está actualizando la contraseña, hashearla
    if (profesorData.password) {
      profesorData.password = await Profesor.encryptPassword(profesorData.password)
    }

    // Verificar duplicados solo si se están actualizando RUT o email
    if (profesorData.rut) {
      const existingProfesor = await Profesor.findOne({ 
        rut: profesorData.rut, 
        _id: { $ne: id } 
      })
      if (existingProfesor) {
        return [null, 'Ya existe un profesor con ese RUT']
      }
    }

    if (profesorData.email) {
      const existingProfesor = await Profesor.findOne({ 
        email: profesorData.email, 
        _id: { $ne: id } 
      })
      if (existingProfesor) {
        return [null, 'Ya existe un profesor con ese email']
      }
    }

    const profesor = await Profesor.findByIdAndUpdate(id, profesorData, {
      new: true,
      runValidators: true
    })

    if (!profesor) {
      return [null, 'Profesor no encontrado']
    }
    return [profesor, null]
  } catch (error) {
    handleError(error, 'profesores.service -> updateProfesores')
    return [null, 'Error al actualizar el profesor']
  }
}

// Función para eliminar un profesor por su ID
async function deleteProfesores (id) {
  try {
    const profesor = await Profesor.findByIdAndDelete(id)
    if (!profesor) {
      return [null, 'Profesor no encontrado']
    }
    return [profesor, null]
  } catch (error) {
    handleError(error, 'profesores.service -> deleteProfesores')
    return [null, 'Error al eliminar el profesor']
  }
}

// Función para obtener un profesor por email
async function getProfesorByEmail (email) {
  try {
    const profesor = await Profesor.findOne({ email }).exec()
    if (!profesor) {
      return [null, 'Profesor no encontrado']
    }
    return [profesor, null]
  } catch (error) {
    handleError(error, 'profesores.service -> getProfesorByEmail')
    return [null, 'Error al obtener profesor por email']
  }
}

// Función para obtener profesores activos
async function getProfesoresActivos () {
  try {
    const profesores = await Profesor.find({ activo: true }).exec()
    if (!profesores) {
      return [null, 'No se encontraron profesores activos']
    }
    return [profesores, null]
  } catch (error) {
    handleError(error, 'profesores.service -> getProfesoresActivos')
    return [null, 'Error al obtener profesores activos']
  }
}

// Función para cambiar el estado activo/inactivo de un profesor
async function toggleProfesorStatus (id) {
  try {
    const profesor = await Profesor.findById(id)
    if (!profesor) {
      return [null, 'Profesor no encontrado']
    }

    profesor.activo = !profesor.activo
    const updatedProfesor = await profesor.save()
    
    return [updatedProfesor, null]
  } catch (error) {
    handleError(error, 'profesores.service -> toggleProfesorStatus')
    return [null, 'Error al cambiar el estado del profesor']
  }
}

// Exportar las funciones individualmente
export {
  getAllProfesores,
  createProfesores,
  getProfesoresById,
  updateProfesores,
  deleteProfesores,
  getProfesorByEmail,
  getProfesoresActivos,
  toggleProfesorStatus
}

// Exportar el servicio como default también
export default {
  getAllProfesores,
  createProfesores,
  getProfesoresById,
  updateProfesores,
  deleteProfesores,
  getProfesorByEmail,
  getProfesoresActivos,
  toggleProfesorStatus
} 