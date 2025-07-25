"use strict";
import cardsProfesoresService from "../services/cardsProfesores.service.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";

class CardsProfesoresController {
  // Obtener todas las tarjetas
  async getAllCards(req, res) {
    try {
      const result = await cardsProfesoresService.getAllCards();
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, 400, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Obtener solo las tarjetas activas
  async getActiveCards(req, res) {
    try {
      const result = await cardsProfesoresService.getActiveCards();
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, 400, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Obtener una tarjeta por ID
  async getCardById(req, res) {
    try {
      const { id } = req.params;
      const result = await cardsProfesoresService.getCardById(id);
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, 404, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Crear una nueva tarjeta
  async createCard(req, res) {
    try {
      const { nombre, especialidad, descripcion, imagen } = req.body;
      
      // Validaciones básicas
      if (!nombre || !especialidad || !descripcion || !imagen) {
        return respondError(req, res, 400, "Todos los campos son requeridos");
      }

      const cardData = { nombre, especialidad, descripcion, imagen };
      const result = await cardsProfesoresService.createCard(cardData);
      
      if (result.success) {
        return respondSuccess(req, res, 201, result.data);
      } else {
        return respondError(req, res, 400, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Actualizar una tarjeta
  async updateCard(req, res) {
    try {
      const { id } = req.params;
      const { nombre, especialidad, descripcion, imagen, activo } = req.body;
      
      // Validaciones básicas para campos requeridos
      if (!nombre || !especialidad || !descripcion || !imagen) {
        return respondError(req, res, 400, "Todos los campos son requeridos");
      }

      const cardData = { nombre, especialidad, descripcion, imagen };
      // Incluir el campo activo si está presente
      if (typeof activo === "boolean") {
        cardData.activo = activo;
      }
      
      const result = await cardsProfesoresService.updateCard(id, cardData);
      
      if (result.success) {
        return respondSuccess(req, res, 200, result.data);
      } else {
        return respondError(req, res, 404, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Eliminar una tarjeta
  async deleteCard(req, res) {
    try {
      const { id } = req.params;
      const result = await cardsProfesoresService.deleteCard(id);
      
      if (result.success) {
        return respondSuccess(req, res, 200, { message: result.message });
      } else {
        return respondError(req, res, 404, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Restaurar una tarjeta
  async restoreCard(req, res) {
    try {
      const { id } = req.params;
      const result = await cardsProfesoresService.restoreCard(id);
      
      if (result.success) {
        return respondSuccess(req, res, 200, { message: result.message });
      } else {
        return respondError(req, res, 404, result.error);
      }
    } catch (error) {
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }

  // Actualizar el orden de las tarjetas
  async updateOrder(req, res) {
    try {
      console.log("Body recibido:", req.body); // Debug
      const { cardsOrder } = req.body;
      
      console.log("cardsOrder extraído:", cardsOrder); // Debug
      
      if (!cardsOrder || !Array.isArray(cardsOrder)) {
        console.log("Validación fallida - cardsOrder:", cardsOrder); // Debug
        return respondError(req, res, 400, "Se requiere un array con el orden de las tarjetas");
      }

      console.log("Enviando a servicio:", cardsOrder); // Debug
      const result = await cardsProfesoresService.updateOrder(cardsOrder);
      
      console.log("Resultado del servicio:", result); // Debug
      
      if (result.success) {
        return respondSuccess(req, res, 200, { message: result.message });
      } else {
        return respondError(req, res, 400, result.error);
      }
    } catch (error) {
      console.error("Error en updateOrder:", error); // Debug
      return respondError(req, res, 500, "Error interno del servidor");
    }
  }
}

export default new CardsProfesoresController(); 