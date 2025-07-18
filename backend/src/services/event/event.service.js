"use strict";

import Event from "../../models/event.model.js";
import BaseService from "../base.service.js";
import { handleError } from "../../utils/errorHandler.util.js";

/**
 * Servicio para manejo de eventos
 * Extiende BaseService para operaciones CRUD estándar
 */
class EventService extends BaseService {
  constructor() {
    super(Event);
  }

  /**
   * Obtiene eventos por rango de fechas
   * @param {Date} fechaInicio - Fecha de inicio
   * @param {Date} fechaFin - Fecha de fin
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByDateRange(fechaInicio, fechaFin, options = {}) {
    try {
      const filter = {
        fecha: {
          $gte: fechaInicio,
          $lte: fechaFin
        }
      };

      return await this.findAll(filter, 'organizador participantes', options);
    } catch (error) {
      handleError(error, "EventService -> findByDateRange");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene eventos por organizador
   * @param {string} organizadorId - ID del organizador
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByOrganizador(organizadorId, options = {}) {
    try {
      return await this.findAll({ organizador: organizadorId }, 'organizador participantes', options);
    } catch (error) {
      handleError(error, "EventService -> findByOrganizador");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene eventos por tipo
   * @param {string} tipo - Tipo de evento
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findByTipo(tipo, options = {}) {
    try {
      return await this.findAll({ tipo }, 'organizador participantes', options);
    } catch (error) {
      handleError(error, "EventService -> findByTipo");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene eventos activos (futuros)
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findUpcomingEvents(options = {}) {
    try {
      const filter = {
        fecha: { $gte: new Date() },
        activo: true
      };

      const defaultSort = { fecha: 1 }; // Ordenar por fecha ascendente
      const sortOptions = { ...options, sort: defaultSort };

      return await this.findAll(filter, 'organizador participantes', sortOptions);
    } catch (error) {
      handleError(error, "EventService -> findUpcomingEvents");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene eventos pasados
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async findPastEvents(options = {}) {
    try {
      const filter = {
        fecha: { $lt: new Date() }
      };

      const defaultSort = { fecha: -1 }; // Ordenar por fecha descendente
      const sortOptions = { ...options, sort: defaultSort };

      return await this.findAll(filter, 'organizador participantes', sortOptions);
    } catch (error) {
      handleError(error, "EventService -> findPastEvents");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Agrega un participante a un evento
   * @param {string} eventId - ID del evento
   * @param {string} participanteId - ID del participante
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async addParticipante(eventId, participanteId) {
    try {
      const evento = await this.model.findById(eventId);
      
      if (!evento) {
        return {
          success: false,
          error: "Evento no encontrado",
          data: null
        };
      }

      // Verificar capacidad máxima
      if (evento.capacidadMaxima && evento.participantes.length >= evento.capacidadMaxima) {
        return {
          success: false,
          error: "Evento lleno - capacidad máxima alcanzada",
          data: null
        };
      }

      const eventoActualizado = await this.model.findByIdAndUpdate(
        eventId,
        { $addToSet: { participantes: participanteId } },
        { new: true }
      ).populate('organizador participantes');

      return {
        success: true,
        data: eventoActualizado,
        error: null
      };
    } catch (error) {
      handleError(error, "EventService -> addParticipante");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Remueve un participante de un evento
   * @param {string} eventId - ID del evento
   * @param {string} participanteId - ID del participante
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async removeParticipante(eventId, participanteId) {
    try {
      const evento = await this.model.findByIdAndUpdate(
        eventId,
        { $pull: { participantes: participanteId } },
        { new: true }
      ).populate('organizador participantes');

      if (!evento) {
        return {
          success: false,
          error: "Evento no encontrado",
          data: null
        };
      }

      return {
        success: true,
        data: evento,
        error: null
      };
    } catch (error) {
      handleError(error, "EventService -> removeParticipante");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Actualiza el estado de un evento
   * @param {string} eventId - ID del evento
   * @param {boolean} activo - Estado del evento
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async updateEstado(eventId, activo) {
    try {
      const evento = await this.model.findByIdAndUpdate(
        eventId,
        { activo },
        { new: true }
      ).populate('organizador participantes');

      if (!evento) {
        return {
          success: false,
          error: "Evento no encontrado",
          data: null
        };
      }

      return {
        success: true,
        data: evento,
        error: null
      };
    } catch (error) {
      handleError(error, "EventService -> updateEstado");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtiene estadísticas de eventos
   * @returns {Promise<Object>} Respuesta estandarizada
   */
  async getEstadisticas() {
    try {
      const now = new Date();
      
      const [total, activos, futuros, pasados, porTipo] = await Promise.all([
        this.model.countDocuments(),
        this.model.countDocuments({ activo: true }),
        this.model.countDocuments({ fecha: { $gte: now }, activo: true }),
        this.model.countDocuments({ fecha: { $lt: now } }),
        this.model.aggregate([
          { $group: { _id: '$tipo', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return {
        success: true,
        data: {
          total,
          activos,
          futuros,
          pasados,
          porTipo
        },
        error: null
      };
    } catch (error) {
      handleError(error, "EventService -> getEstadisticas");
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

// Exportar instancia del servicio
const eventService = new EventService();
export default eventService;
