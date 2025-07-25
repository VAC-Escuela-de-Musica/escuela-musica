'use strict'

import { Router } from 'express'
import archivoController from '../controllers/archivo.controller.js'
import { authenticationMiddleware, authorizeRoles } from '../../authentication/index.js'

const router = Router()

// Rutas protegidas (requieren autenticación)
router.use(authenticationMiddleware)

// Rutas de administración (solo administrador y asistente)
router.get('/', authorizeRoles(['administrador', 'asistente']), archivoController.getArchivos)
router.post('/', authorizeRoles(['administrador', 'asistente']), archivoController.createArchivo)
router.get('/:id', authorizeRoles(['administrador', 'asistente']), archivoController.getArchivoById)
router.put('/:id', authorizeRoles(['administrador', 'asistente']), archivoController.updateArchivo)
router.delete('/:id', authorizeRoles(['administrador', 'asistente']), archivoController.deleteArchivo)

export default router
