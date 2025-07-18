"use strict";

import Class from "../../models/class.model.js";
import BaseService from "../base.service.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Servicio para manejo de clases
 * Extiende BaseService para operaciones CRUD estándar
 */
class ClassService extends BaseService {
  constructor() {
    super(Class);
  }

  /**
   * Obtiene clases por profesor
   * @param {string} profesorId - ID del profesor
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByProfesor(profesorId, options = {}) {
    try {
      return await this.findAll({ profesor: profesorId }, 'profesor estudiantes', options);
    } catch (error) {
      handleError(error, "ClassService -> findByProfesor");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene clases por estudiante
   * @param {string} estudianteId - ID del estudiante
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByEstudiante(estudianteId, options = {}) {
    try {
      return await this.findAll({ estudiantes: estudianteId }, 'profesor estudiantes', options);
    } catch (error) {
      handleError(error, "ClassService -> findByEstudiante");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene clases por instrumento
   * @param {string} instrumento - Nombre del instrumento
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByInstrumento(instrumento, options = {}) {
    try {
      return await this.findAll({ instrumento }, 'profesor estudiantes', options);
    } catch (error) {
      handleError(error, "ClassService -> findByInstrumento");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene clases activas
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findActiveClasses(options = {}) {
    try {
      return await this.findAll({ activa: true }, 'profesor estudiantes', options);
    } catch (error) {
      handleError(error, "ClassService -> findActiveClasses");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Agrega un estudiante a una clase
   * @param {string} classId - ID de la clase
   * @param {string} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async addEstudiante(classId, estudianteId) {
    try {
      const clase = await this.model.findByIdAndUpdate(
        classId,
        { $addToSet: { estudiantes: estudianteId } },
        { new: true }
      ).populate('profesor estudiantes');

      if (!clase) {
        return {
          success: false,
          error: "Clase no encontrada",
          data: null
        };
      }

      return {
        success: true,
        data: clase,
        error: null
      };
    } catch (error) {
      handleError(error, "ClassService -> addEstudiante");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Remueve un estudiante de una clase
   * @param {string} classId - ID de la clase
   * @param {string} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async removeEstudiante(classId, estudianteId) {
    try {
      const clase = await this.model.findByIdAndUpdate(
        classId,
        { $pull: { estudiantes: estudianteId } },
        { new: true }
      ).populate('profesor estudiantes');

      if (!clase) {
        return {
          success: false,
          error: "Clase no encontrada",
          data: null
        };
      }

      return {
        success: true,
        data: clase,
        error: null
      };
    } catch (error) {
      handleError(error, "ClassService -> removeEstudiante");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Actualiza el estado de una clase
   * @param {string} classId - ID de la clase
   * @param {boolean} activa - Estado de la clase
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async updateEstado(classId, activa) {
    try {
      const clase = await this.model.findByIdAndUpdate(
        classId,
        { activa },
        { new: true }
      ).populate('profesor estudiantes');

      if (!clase) {
        return {
          success: false,
          error: "Clase no encontrada",
          data: null
        };
      }

      return {
        success: true,
        data: clase,
        error: null
      };
    } catch (error) {
      handleError(error, "ClassService -> updateEstado");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene estadísticas de clases
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async getEstadisticas() {
    try {
      const [total, activas, inactivas, porInstrumento] = await Promise.all([
        this.model.countDocuments(),
        this.model.countDocuments({ activa: true }),
        this.model.countDocuments({ activa: false }),
        this.model.aggregate([
          { $group: { _id: '$instrumento', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return {
        success: true,
        data: {
          total,
          activas,
          inactivas,
          porInstrumento
        },
        error: null
      };
    } catch (error) {
      handleError(error, "ClassService -> getEstadisticas");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Exportar instancia del servicio usando named export
const classService = new ClassService();
export { classService as ClassService };
