'use strict'

import express from 'express'
import {
  getActiveGallery,
  getGalleryByCategory,
  getAllGallery,
  getImageById,
  createImage,
  updateImage,
  deleteImage,
  toggleImageStatus,
  updateImageOrder,
  getImageUrl
} from '../controllers/galeria.controller.js'
import { authenticateJWT } from '../../authentication/middlewares/index.js'
import { authorizeRoles } from '../../authentication/middlewares/authorization.middleware.js'

const router = express.Router()

// ============= RUTAS PÚBLICAS =============
// Estas rutas no requieren autenticación
router.get('/active', getActiveGallery)
router.get('/category/:categoria', getGalleryByCategory)
router.get('/image/:id/url', getImageUrl)
// Ruta principal de galería - pública para mostrar en frontend
router.get('/', getAllGallery)

// ============= RUTAS PROTEGIDAS =============
// Aplicar middleware de autenticación completo (extractJWT + verifyJWT)
router.use(authenticateJWT)

// Rutas de administración (requieren autenticación y roles específicos)
router.get('/:id', authorizeRoles(['administrador', 'asistente']), getImageById)
router.post('/', authorizeRoles(['administrador', 'asistente']), createImage)
router.put('/:id', authorizeRoles(['administrador', 'asistente']), updateImage)
router.delete('/:id', authorizeRoles(['administrador', 'asistente']), deleteImage)
router.put('/:id/toggle', authorizeRoles(['administrador', 'asistente']), toggleImageStatus)
router.put('/order/update', authorizeRoles(['administrador', 'asistente']), updateImageOrder)

export default router
