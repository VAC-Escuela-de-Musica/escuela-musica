'use strict'

// Importa el módulo 'cors' para agregar los cors
import cors from 'cors'
// Importa el módulo 'express' para crear la aplicacion web
import express, { urlencoded, json } from 'express'
// Importamos morgan para ver las peticiones que se hacen al servidor
import morgan from 'morgan'
// Importa el módulo 'cookie-parser' para manejar las cookies
import cookieParser from 'cookie-parser'
// Importa el módulo 'path' para manejar rutas de archivos
import path from 'path'
// Importa el módulo 'url' para manejar URLs
import { fileURLToPath } from 'url'
// Importa middlewares de seguridad
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import lusca from 'lusca'
/** El enrutador principal */
import indexRoutes from './routes/index.routes.js'
// Importa el handler de errores
import { handleError } from './core/utils/errorHandler.util.js'
// Importa la configuración centralizada
import { config } from './core/config/index.js'
// Importa las constantes
import { HTTP_STATUS } from './core/constants/index.js'

/**
 * Crea y configura la aplicación Express
 * @returns {express.Application} La aplicación Express configurada
 */
export function createApp () {
  try {
    /** Instancia de la aplicacion */
    const app = express()
    app.disable('x-powered-by')

    // === CONFIGURACIÓN DE SEGURIDAD ===
    // Helmet para headers de seguridad
    app.use(helmet({
      contentSecurityPolicy: false, // Deshabilitado para desarrollo
      crossOriginEmbedderPolicy: false // Deshabilitado para desarrollo
    }))

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: {
        success: false,
        error: 'Demasiadas peticiones desde esta IP, intenta más tarde',
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
      },
      standardHeaders: true,
      legacyHeaders: false
    })
    app.use(limiter)

    // CORS configurado por entorno
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://yourdomain.com'
        : ['http://localhost:3000', 'http://localhost:443', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
    app.use(cors(corsOptions))

    // === CONFIGURACIÓN DE MIDDLEWARES ===
    // Agrega el middleware para el manejo de datos en formato URL
    app.use(urlencoded({ extended: true }))
    // Agrega el middleware para el manejo de datos en formato JSON
    app.use(json())
    // Agregamos el middleware para el manejo de cookies
    app.use(cookieParser())
    // Agregamos el middleware para la protección contra CSRF
    app.use(lusca.csrf())
    // Agregamos morgan para ver las peticiones que se hacen al servidor
    app.use(morgan('dev'))

    // === ARCHIVOS ESTÁTICOS ===
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const frontendPath = path.join(__dirname, '../../frontend/dist')
    app.use(express.static(frontendPath))

    // === RUTAS ===
    // Agrega el enrutador principal al servidor
    app.use('/api', indexRoutes)

    // Redirige cualquier ruta que no sea /api a index.html (SPA)
    app.use((req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
      }
    })

    return app
  } catch (err) {
    handleError(err, '/app.js -> createApp')
    throw err
  }
}
