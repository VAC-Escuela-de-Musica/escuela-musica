'use strict'

import { Router } from 'express'
import cardsProfesoresController from '../controllers/cardsProfesores.controller.js'
import { authenticateJWT } from '../../authentication/middlewares/index.js'
import { authorizeRoles } from '../../authentication/middlewares/authorization.middleware.js'

const router = Router()

// Rutas públicas (sin autenticación)
router.get('/', cardsProfesoresController.getCardsProfesores)
router.get('/active', cardsProfesoresController.getCardsProfesores)

// Rutas protegidas (requieren autenticación)
router.use(authenticateJWT)

// Rutas de administración (solo administrador y asistente)
router.post('/', authorizeRoles(['administrador', 'asistente']), cardsProfesoresController.createCardProfesor)
router.get('/:id', authorizeRoles(['administrador', 'asistente']), cardsProfesoresController.getCardProfesorById)
router.put('/order', authorizeRoles(['administrador', 'asistente']), cardsProfesoresController.updateCardsOrder)
router.put('/:id', authorizeRoles(['administrador', 'asistente']), cardsProfesoresController.updateCardProfesor)
router.delete('/:id', authorizeRoles(['administrador', 'asistente']), cardsProfesoresController.deleteCardProfesor)

export default router
