"use strict";
import CardsProfesores from "../models/cardsProfesores.model.js";

class CardsProfesoresService {
  // Obtener todas las tarjetas (para administración)
  async getAllCards() {
    try {
      const cards = await CardsProfesores.find()
        .sort({ createdAt: -1 });
      return { success: true, data: cards };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener solo las tarjetas activas (para la homepage)
  async getActiveCards() {
    try {
      const cards = await CardsProfesores.find({ activo: true })
        .sort({ orden: 1, createdAt: -1 });
      return { success: true, data: cards };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar el orden de las tarjetas
  async updateOrder(cardsOrder) {
    try {
      const updatePromises = cardsOrder.map((cardId, index) => {
        return CardsProfesores.findByIdAndUpdate(
          cardId,
          { orden: index },
          { new: true }
        );
      });

      await Promise.all(updatePromises);
      return { success: true, message: "Orden actualizado exitosamente" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener una tarjeta por ID
  async getCardById(id) {
    try {
      const card = await CardsProfesores.findById(id);
      if (!card) {
        return { success: false, error: "Tarjeta no encontrada" };
      }
      return { success: true, data: card };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Crear una nueva tarjeta
  async createCard(cardData) {
    try {
      const newCard = new CardsProfesores(cardData);
      await newCard.save();
      return { success: true, data: newCard };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar una tarjeta
  async updateCard(id, cardData) {
    try {
      const card = await CardsProfesores.findByIdAndUpdate(
        id, 
        cardData, 
        { new: true, runValidators: true }
      );
      if (!card) {
        return { success: false, error: "Tarjeta no encontrada" };
      }
      return { success: true, data: card };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Eliminar una tarjeta (soft delete)
  async deleteCard(id) {
    try {
      const card = await CardsProfesores.findByIdAndUpdate(
        id, 
        { activo: false }, 
        { new: true }
      );
      if (!card) {
        return { success: false, error: "Tarjeta no encontrada" };
      }
      return { success: true, message: "Tarjeta eliminada exitosamente" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Restaurar una tarjeta eliminada
  async restoreCard(id) {
    try {
      const card = await CardsProfesores.findByIdAndUpdate(
        id, 
        { activo: true }, 
        { new: true }
      );
      if (!card) {
        return { success: false, error: "Tarjeta no encontrada" };
      }
      return { success: true, message: "Tarjeta restaurada exitosamente" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new CardsProfesoresService(); 