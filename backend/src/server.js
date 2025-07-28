import { PORT, HOST, SESSION_SECRET } from './core/config/configEnv.js'
import path from 'node:path'
import cors from 'cors'
import express, { urlencoded, json } from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import lusca from 'lusca'
import indexRoutes from './routes/index.routes.js'
import { setupDB } from './core/config/configDB.js'
import { setupMinIO } from './core/config/minio.config.js'
import { handleFatalError, handleError } from './core/utils/errorHandler.util.js'
import { createRoles, createUsers } from './core/config/initialSetup.js'
import { initializeServices } from './services/index.js'
import session from 'express-session'
const { csrf } = lusca

/**
 * Inicia el servidor web
 */
async function setupServer () {
  try {
    /** Instancia de la aplicacion */
    const app = express()
    app.disable('x-powered-by')
    
    // Configuración de CORS para credenciales
    const corsOptions = {
      credentials: true,
      origin: function (origin, callback) {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true)
        
        // Lista de orígenes permitidos
        const allowedOrigins = [
          'http://146.83.198.35:1230',
          'http://146.83.198.35',
          'https://146.83.198.35:1230',
          'https://146.83.198.35',
          'http://localhost:3000',
          'http://localhost:5173',
          'http://localhost:1230'
        ]
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          console.warn('CORS blocked origin:', origin)
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', '_csrf']
    }
    
    // Agregamos los cors
    app.use(cors(corsOptions))
    // Agrega el middleware para el manejo de datos en formato URL
    app.use(urlencoded({ extended: true }))
    // Agrega el middleware para el manejo de datos en formato JSON
    app.use(json())
    app.use(cookieParser())
    app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }))
    // CSRF exclusions
    app.use((req, res, next) => {
      const csrfExcluded = [
        /^\/api\/auth\//,
        '/api/csrf-token',
        '/api/materials/upload-url',
        '/api/materials/confirm-upload',
        /^\/api\/materials\/.+$/,
        '/api/galeria/upload-url',
        '/api/galeria/confirm-upload',
        /^\/api\/galeria.*$/,
        /^\/api\/cards-profesores.*$/,
        /^\/api\/testimonios.*$/,
        /^\/api\/carousel\/upload$/,
        /^\/api\/files\/upload$/,
        /^\/api\/alumnos.*$/,
        /^\/api\/profesores.*$/,
        /^\/api\/users.*$/,
        /^\/api\/roles.*$/,
        /^\/api\/messaging\/whatsapp-web\/(reset|initialize)$/,
        /^\/api\/messaging\/(send-whatsapp|send-email|send-message|test-message|test-email-config-unrestricted|email-config.*|whatsapp.*)$/,
        /^\/api\/internal-messages.*$/
      ]
      const isExcluded = csrfExcluded.some(pattern => {
        if (pattern instanceof RegExp) return pattern.test(req.path)
        return req.path === pattern
      })

      if (isExcluded) {
        return next()
      }
      return csrf()(req, res, next)
    })
    app.use(morgan('dev'))
    app.use('/api', indexRoutes)

    // Frontend static
    const distPath = path.resolve(process.cwd(), '../frontend/dist')
    app.use(express.static(distPath))

    // Para SPA: redirige cualquier ruta que NO empiece con /api al index.html del frontend
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })

    // Inicia el servidor en el puerto especificado
    const server = app.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}`)
    })

    return server
  } catch (err) {
    handleError(err, '/server.js -> setupServer')
    throw err
  }
}

/**
 * Inicia la API
 */
async function setupAPI () {
  try {
    console.log('[API] Iniciando servidor...')

    await setupDB()
    
    const servicesInitialized = await initializeServices()
    if (!servicesInitialized) {
      console.warn('[API] Algunos servicios no se inicializaron correctamente')
    }

    await setupServer()
    await createRoles()
    await createUsers()

    console.log('[API] Servidor iniciado exitosamente')
  } catch (err) {
    console.error('[API] Error en setupAPI:', err)
    handleFatalError(err, '/server.js -> setupAPI')
  }
}
// Inicia la API
setupAPI()
  .then(() => console.log('[SERVER] Server listening on http://localhost:' + PORT))
  .catch((err) => handleFatalError(err, '/server.js -> setupAPI'))
