"use strict";

import Evento from "../models/evento.model.js";
import { handleError } from "../../../utils/errorHandler.js";

async function getEventos() {
  try {
    const eventos = await Evento.find({ visible: true })
      .populate("creadoPor")
      .lean();

    if (!eventos) return [null, "No hay eventos registrados"];

    return [eventos, null];
  } catch (error) {
    handleError(error, "evento.service -> getEventos");
    return [null, "Error al obtener los eventos"];
  }
}

async function createEvento(evento) {
  try {
    const newEvento = new Evento(evento);
    await newEvento.save();

    return [newEvento, null];
  } catch (error) {
    handleError(error, "evento.service -> createEvento");
    return [null, "Error al crear el evento"];
  }
}

export default {
  getEventos,
  createEvento,
}; 