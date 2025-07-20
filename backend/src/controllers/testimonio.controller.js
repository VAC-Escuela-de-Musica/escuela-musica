"use strict";
import {
  getAllTestimonios,
  getActiveTestimonios,
  getTestimonioById,
  createTestimonio,
  updateTestimonio,
  deleteTestimonio,
  updateTestimonioOrder,
  toggleTestimonioStatus,
} from "../services/testimonio.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";

// Obtener todos los testimonios (para administración)
export const getAllTestimoniosController = async (req, res) => {
  try {
    const result = await getAllTestimonios();
    
    if (result.success) {
      return respondSuccess(req, res, 200, result.data);
    } else {
      return respondError(req, res, 400, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Obtener testimonios activos (para el frontend)
export const getActiveTestimoniosController = async (req, res) => {
  try {
    const result = await getActiveTestimonios();
    
    if (result.success) {
      return respondSuccess(req, res, 200, result.data);
    } else {
      return respondError(req, res, 400, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Obtener un testimonio por ID
export const getTestimonioByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getTestimonioById(id);
    
    if (result.success) {
      return respondSuccess(req, res, 200, result.data);
    } else {
      return respondError(req, res, 404, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Crear un nuevo testimonio
export const createTestimonioController = async (req, res) => {
  try {
    const testimonioData = req.body;
    const result = await createTestimonio(testimonioData);
    
    if (result.success) {
      return respondSuccess(req, res, 201, result.data);
    } else {
      return respondError(req, res, 400, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Actualizar un testimonio
export const updateTestimonioController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await updateTestimonio(id, updateData);
    
    if (result.success) {
      return respondSuccess(req, res, 200, result.data);
    } else {
      return respondError(req, res, 404, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Eliminar un testimonio
export const deleteTestimonioController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteTestimonio(id);
    
    if (result.success) {
      return respondSuccess(req, res, 200, { message: result.message });
    } else {
      return respondError(req, res, 404, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Actualizar el orden de los testimonios
export const updateTestimonioOrderController = async (req, res) => {
  try {
    const { ordenData } = req.body;
    const result = await updateTestimonioOrder(ordenData);
    
    if (result.success) {
      return respondSuccess(req, res, 200, { message: result.message });
    } else {
      return respondError(req, res, 400, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
};

// Cambiar estado activo/inactivo
export const toggleTestimonioStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await toggleTestimonioStatus(id);
    
    if (result.success) {
      return respondSuccess(req, res, 200, result.data);
    } else {
      return respondError(req, res, 404, result.message);
    }
  } catch (error) {
    return respondError(req, res, 500, "Error interno del servidor");
  }
}; 