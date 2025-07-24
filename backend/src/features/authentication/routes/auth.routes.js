'use strict'

import { Router } from 'express'
import {
  validateParams,
  validateQuery,
  validateBody,
  enhancedSanitizeInput,
  validatePagination
} from '../../../middlewares/validation/index.js'
import { idParamSchema, userFiltersSchema, commonSchemas } from '../../../core/schemas/common.schema.js'
import { authLoginBodySchema } from '../../../core/schemas/auth.schema.js'
import { extractJWT, verifyJWT, requireAuthenticated, requireRole } from '../middlewares/index.js'
import authController from '../controllers/auth.controller.js'
import { HTTP_STATUS } from '../../../core/constants/index.js'
import rateLimit from 'express-rate-limit'
import { config } from '../../../core/config/index.js'

const { login, logout, refresh } = authController

const router = Router()

// Rate limiting específico para autenticación
const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación, intenta más tarde',
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos
 */
router.post('/login',
  authLimiter,
  enhancedSanitizeInput(['email', 'password']),
  validateBody(authLoginBodySchema),
  login
)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No autorizado
 */
router.post('/logout',
  extractJWT,
  verifyJWT,
  logout
)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *       401:
 *         description: Token de refresh inválido
 */
router.post('/refresh',
  authLimiter,
  refresh
)

export default router
