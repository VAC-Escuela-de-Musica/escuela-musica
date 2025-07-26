'use strict'

import Testimonio from '../../../core/models/testimonio.entity.js'
import { handleError } from '../../../core/utils/errorHandler.util.js'

/**
 * Obtiene todos los testimonios activos para el frontend
 */
async function getActiveTestimonios () {
  try {
    const testimonios = await Testimonio.find({ activo: true })
      .sort({ orden: 1, createdAt: -1 })
      .lean()

    if (!testimonios) return [null, 'No hay testimonios activos']

    return [testimonios, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> getActiveTestimonios')
    return [null, 'Error al obtener testimonios activos']
  }
}

/**
 * Obtiene todos los testimonios (para administración)
 */
async function getAllTestimonios () {
  try {
    const testimonios = await Testimonio.find()
      .sort({ orden: 1, createdAt: -1 })
      .lean()

    if (!testimonios) return [null, 'No hay testimonios registrados']

    return [testimonios, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> getAllTestimonios')
    return [null, 'Error al obtener testimonios']
  }
}

/**
 * Obtiene un testimonio por ID
 */
async function getTestimonioById (id) {
  try {
    const testimonio = await Testimonio.findById(id).lean()

    if (!testimonio) return [null, 'Testimonio no encontrado']

    return [testimonio, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> getTestimonioById')
    return [null, 'Error al obtener testimonio']
  }
}

/**
 * Crea un nuevo testimonio
 */
async function createTestimonio (testimonioData) {
  try {
    const maxOrden = await Testimonio.findOne().sort({ orden: -1 })

    const testimonio = new Testimonio({
      ...testimonioData,
      orden: maxOrden ? maxOrden.orden + 1 : 1
    })

    const savedTestimonio = await testimonio.save()
    return [savedTestimonio, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> createTestimonio')
    return [null, 'Error al crear testimonio']
  }
}

/**
 * Actualiza un testimonio existente
 */
async function updateTestimonio (id, testimonioData) {
  try {
    const updatedTestimonio = await Testimonio.findByIdAndUpdate(
      id,
      testimonioData,
      { new: true, runValidators: true }
    ).lean()

    if (!updatedTestimonio) return [null, 'Testimonio no encontrado']

    return [updatedTestimonio, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> updateTestimonio')
    return [null, 'Error al actualizar testimonio']
  }
}

/**
 * Elimina un testimonio
 */
async function deleteTestimonio (id) {
  try {
    const deletedTestimonio = await Testimonio.findByIdAndDelete(id).lean()

    if (!deletedTestimonio) return [null, 'Testimonio no encontrado']

    return [deletedTestimonio, null]
  } catch (error) {
    handleError(error, 'testimonio.service -> deleteTestimonio')
    return [null, 'Error al eliminar testimonio']
  }
}

export default {
  getActiveTestimonios,
  getAllTestimonios,
  getTestimonioById,
  createTestimonio,
  updateTestimonio,
  deleteTestimonio
}
