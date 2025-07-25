"use strict";

import Testimonio from "../models/testimonio.model.js";
import { handleError } from "../../../utils/errorHandler.js";

/**
 * Obtiene todos los testimonios activos para el frontend
 */
async function getActiveTestimonios() {
  try {
    const testimonios = await Testimonio.find({ activo: true })
      .sort({ orden: 1, createdAt: -1 })
      .lean();

    if (!testimonios) return [null, "No hay testimonios activos"];

    return [testimonios, null];
  } catch (error) {
    handleError(error, "testimonio.service -> getActiveTestimonios");
    return [null, "Error al obtener testimonios activos"];
  }
}

/**
 * Obtiene todos los testimonios (para administración)
 */
async function getAllTestimonios() {
  try {
    const testimonios = await Testimonio.find()
      .sort({ orden: 1, createdAt: -1 })
      .lean();

    if (!testimonios) return [null, "No hay testimonios registrados"];

    return [testimonios, null];
  } catch (error) {
    handleError(error, "testimonio.service -> getAllTestimonios");
    return [null, "Error al obtener testimonios"];
  }
}

/**
 * Obtiene un testimonio por ID
 */
async function getTestimonioById(id) {
  try {
    const testimonio = await Testimonio.findById(id).lean();

    if (!testimonio) return [null, "Testimonio no encontrado"];

    return [testimonio, null];
  } catch (error) {
    handleError(error, "testimonio.service -> getTestimonioById");
    return [null, "Error al obtener testimonio"];
  }
}

/**
 * Crea un nuevo testimonio
 */
async function createTestimonio(testimonioData) {
  try {
    const maxOrden = await Testimonio.findOne().sort({ orden: -1 });
    
    const testimonio = new Testimonio({
      ...testimonioData,
      orden: maxOrden ? maxOrden.orden + 1 : 1,
    });

    const savedTestimonio = await testimonio.save();
    return [savedTestimonio, null];
  } catch (error) {
    handleError(error, "testimonio.service -> createTestimonio");
    return [null, "Error al crear testimonio"];
  }
}

export default {
  getActiveTestimonios,
  getAllTestimonios,
  getTestimonioById,
  createTestimonio,
}; 