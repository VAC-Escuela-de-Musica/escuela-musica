'use strict'

import { Router } from 'express'
import metricaController from '../controllers/metrica.controller.js'
import { authenticationMiddleware, authorizeRoles } from '../../authentication/index.js'

const router = Router()

router.use(authenticationMiddleware)

router.get('/', authorizeRoles(['administrador']), metricaController.getMetricas)
router.post('/', authorizeRoles(['administrador']), metricaController.createMetrica)

export default router
