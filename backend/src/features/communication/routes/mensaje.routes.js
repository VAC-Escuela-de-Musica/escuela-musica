'use strict'

import { Router } from 'express'
import mensajeController from '../controllers/mensaje.controller.js'
import { authenticationMiddleware, authorizeRoles } from '../../authentication/index.js'

const router = Router()

// Rutas protegidas (requieren autenticación)
router.use(authenticationMiddleware)

// Rutas de administración (solo administrador y asistente)
router.get('/', authorizeRoles(['administrador', 'asistente']), mensajeController.getMensajes)
router.post('/', authorizeRoles(['administrador', 'asistente']), mensajeController.createMensaje)
router.get('/:id', authorizeRoles(['administrador', 'asistente']), mensajeController.getMensajeById)

export default router
