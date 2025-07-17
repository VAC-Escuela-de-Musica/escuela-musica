/**
 * AVISO IMPORTANTE:
 * 
 * Este archivo ya no está en uso.
 * 
 * Todas las funcionalidades de materiales se han migrado al sistema de URLs prefirmadas
 * en el archivo presignedOnly.routes.js.
 * 
 * Para mantener compatibilidad con versiones anteriores, las solicitudes a /api/materiales
 * se redireccionan automáticamente a /api/materials.
 * 
 * Si necesitas modificar las rutas de materiales, por favor edita:
 * - src/routes/presignedOnly.routes.js
 * - src/controllers/presignedOnly.controller.js
 */

import { Router } from "express";
const router = Router();

// Este router está vacío porque ya no se usa
// Ver presignedOnly.routes.js para las rutas actuales

export default router;
