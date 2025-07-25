"use strict";
import Testimonio from "../models/testimonio.entity.js";

// Obtener todos los testimonios
export const getAllTestimonios = async () => {
  try {
    const testimonios = await Testimonio.find().sort({ orden: 1, createdAt: -1 });
    return {
      success: true,
      data: testimonios,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al obtener testimonios",
      error: error.message,
    };
  }
};

// Obtener testimonios activos para el frontend
export const getActiveTestimonios = async () => {
  try {
    const testimonios = await Testimonio.find({ activo: true }).sort({ orden: 1, createdAt: -1 });
    return {
      success: true,
      data: testimonios,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al obtener testimonios activos",
      error: error.message,
    };
  }
};

// Obtener un testimonio por ID
export const getTestimonioById = async (id) => {
  try {
    const testimonio = await Testimonio.findById(id);
    if (!testimonio) {
      return {
        success: false,
        message: "Testimonio no encontrado",
      };
    }
    return {
      success: true,
      data: testimonio,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al obtener testimonio",
      error: error.message,
    };
  }
};

// Crear un nuevo testimonio
export const createTestimonio = async (testimonioData) => {
  try {
    // Obtener el máximo orden actual
    const maxOrden = await Testimonio.findOne().sort({ orden: -1 });
    const nuevoOrden = maxOrden ? maxOrden.orden + 1 : 0;
    
    const testimonio = new Testimonio({
      ...testimonioData,
      orden: nuevoOrden,
    });
    
    const savedTestimonio = await testimonio.save();
    return {
      success: true,
      data: savedTestimonio,
      message: "Testimonio creado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al crear testimonio",
      error: error.message,
    };
  }
};

// Actualizar un testimonio
export const updateTestimonio = async (id, updateData) => {
  try {
    const testimonio = await Testimonio.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );
    
    if (!testimonio) {
      return {
        success: false,
        message: "Testimonio no encontrado",
      };
    }
    
    return {
      success: true,
      data: testimonio,
      message: "Testimonio actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al actualizar testimonio",
      error: error.message,
    };
  }
};

// Eliminar un testimonio
export const deleteTestimonio = async (id) => {
  try {
    const testimonio = await Testimonio.findByIdAndDelete(id);
    
    if (!testimonio) {
      return {
        success: false,
        message: "Testimonio no encontrado",
      };
    }
    
    return {
      success: true,
      message: "Testimonio eliminado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al eliminar testimonio",
      error: error.message,
    };
  }
};

// Actualizar el orden de los testimonios
export const updateTestimonioOrder = async (ordenData) => {
  try {
    const updatePromises = ordenData.map(({ id, orden }) =>
      Testimonio.findByIdAndUpdate(id, { orden }, { new: true }),
    );
    
    await Promise.all(updatePromises);
    
    return {
      success: true,
      message: "Orden de testimonios actualizado exitosamente",
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al actualizar orden de testimonios",
      error: error.message,
    };
  }
};

// Cambiar estado activo/inactivo
export const toggleTestimonioStatus = async (id) => {
  try {
    const testimonio = await Testimonio.findById(id);
    
    if (!testimonio) {
      return {
        success: false,
        message: "Testimonio no encontrado",
      };
    }
    
    testimonio.activo = !testimonio.activo;
    const updatedTestimonio = await testimonio.save();
    
    return {
      success: true,
      data: updatedTestimonio,
      message: `Testimonio ${updatedTestimonio.activo ? "activado" : "desactivado"} exitosamente`,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error al cambiar estado del testimonio",
      error: error.message,
    };
  }
}; 