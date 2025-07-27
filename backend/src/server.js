// Importa el archivo 'configEnv.js' para cargar las variables de entorno
import { PORT, HOST, SESSION_SECRET } from './core/config/configEnv.js'
import path from 'node:path'
// Importa el módulo 'cors' para agregar los cors
import cors from 'cors'
// Importa el módulo 'express' para crear la aplicacion web
import express, { urlencoded, json } from 'express'
// Importamos morgan para ver las peticiones que se hacen al servidor
import morgan from 'morgan'
// Importa el módulo 'cookie-parser' para manejar las cookies
import cookieParser from 'cookie-parser'
// Importa el módulo 'lusca' para manejar la seguridad de la aplicación
import lusca from 'lusca'
/** El enrutador principal */
import indexRoutes from './routes/index.routes.js'
// Importa el archivo 'configDB.js' para crear la conexión a la base de datos
import { setupDB } from './core/config/configDB.js'
// Importa la configuración de MinIO
import { setupMinIO } from './core/config/minio.config.js'
// Importa el handler de errores
import { handleFatalError, handleError } from './core/utils/errorHandler.util.js'
import { createRoles, createUsers } from './core/config/initialSetup.js'
// Importa la función para inicializar servicios
import { initializeServices } from './services/index.js'
// Importa el módulo 'express-session' para manejar sesiones
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
    // Agregamos los cors
    app.use(cors({ credentials: true, origin: true }))
    // Agrega el middleware para el manejo de datos en formato URL
    app.use(urlencoded({ extended: true }))
    // Agrega el middleware para el manejo de datos en formato JSON
    app.use(json())
    // Agregamos el middleware para el manejo de cookies
    app.use(cookieParser())
    // Agregamos el middleware de sesión requerido por lusca
    app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    }))
    // Aplica CSRF solo a rutas protegidas (excepto /api/auth/*, /api/csrf-token y rutas de upload)
    app.use((req, res, next) => {
      const csrfExcluded = [
        /^\/api\/auth\//,
        '/api/csrf-token',
        '/api/materials/upload-url',
        '/api/materials/confirm-upload',
        /^\/api\/materials\/.+$/, // Excluir todas las rutas de materiales con ID
        '/api/galeria/upload-url',
        '/api/galeria/confirm-upload',
        /^\/api\/galeria.*$/, // Excluir todas las rutas de galería
        /^\/api\/cards-profesores.*$/, // Excluir todas las rutas de cards-profesores
        /^\/api\/testimonios.*$/, // Excluir todas las rutas de testimonios
        /^\/api\/carousel\/upload$/,
        /^\/api\/files\/upload$/,
        /^\/api\/alumnos.*$/, // Excluir todas las rutas de alumnos
        /^\/api\/profesores.*$/, // Excluir todas las rutas de profesores
        /^\/api\/users.*$/, // Excluir todas las rutas de usuarios (gestión de usuarios)
        /^\/api\/roles.*$/, // Excluir todas las rutas de roles
        /^\/api\/messaging\/whatsapp-web\/(reset|initialize)$/, // Excluir rutas públicas de WhatsApp Web
        /^\/api\/messaging\/(send-whatsapp|send-email|send-message|test-message|test-email-config-unrestricted|email-config.*|whatsapp.*)$/, // Excluir rutas de envío de mensajes, configuración de email y WhatsApp
        /^\/api\/internal-messages.*$/ // Excluir todas las rutas de mensajes internos
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
    // Agregamos morgan para ver las peticiones que se hacen al servidor
    app.use(morgan('dev'))
    // Agrega el enrutador principal al servidor
    app.use('/api', indexRoutes)

    // ...existing code...

    // === Servir archivos estáticos del frontend (dist) ===
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
