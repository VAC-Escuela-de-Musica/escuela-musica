// Importa el archivo 'configEnv.js' para cargar las variables de entorno
import { PORT, HOST } from "./core/config/configEnv.js";
import path from "node:path";
// Importa el módulo 'cors' para agregar los cors
import cors from "cors";
// Importa el módulo 'express' para crear la aplicacion web
import express, { urlencoded, json } from "express";
// Importamos morgan para ver las peticiones que se hacen al servidor
import morgan from "morgan";
// Importa el módulo 'cookie-parser' para manejar las cookies
import cookieParser from "cookie-parser";
/** El enrutador principal */
import indexRoutes from "./routes/index.routes.js";
// Importa el archivo 'configDB.js' para crear la conexión a la base de datos
import { setupDB } from "./core/config/configDB.js";
// Importa la configuración de MinIO
import { setupMinIO } from "./core/config/minio.config.js";
// Importa el handler de errores
import { handleFatalError, handleError } from "./utils/errorHandler.util.js";
import { createRoles, createUsers } from "./core/config/initialSetup.js";
// Importa la función para inicializar servicios
import { initializeServices } from "./services/index.js";

/**
 * Inicia el servidor web
 */
async function setupServer() {
  try {
    /** Instancia de la aplicacion */
    const app = express();
    app.disable("x-powered-by");
    // Agregamos los cors
    app.use(cors({ credentials: true, origin: true }));
    // Agrega el middleware para el manejo de datos en formato URL
    app.use(urlencoded({ extended: true }));
    // Agrega el middleware para el manejo de datos en formato JSON
    app.use(json());
    // Agregamos el middleware para el manejo de cookies
    app.use(cookieParser());
    // Agregamos morgan para ver las peticiones que se hacen al servidor
    app.use(morgan("dev"));
    // Agrega el enrutador principal al servidor
    app.use("/api", indexRoutes);

    // === Servir archivos estáticos del frontend (dist) ===
    const distPath = path.resolve(process.cwd(), "../frontend/dist");
    app.use(express.static(distPath));

    // Para SPA: redirige cualquier ruta que NO empiece con /api al index.html del frontend
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Inicia el servidor en el puerto especificado
    const server = app.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}`);
    });

    return server;
  } catch (err) {
    handleError(err, "/server.js -> setupServer");
    throw err;
  }
}

/**
 * Inicia la API
 */
async function setupAPI() {
  try {
    console.log("🚀 Iniciando API de Escuela de Música...");
    
    // Inicia la conexión a la base de datos
    console.log("📊 Conectando a la base de datos...");
    await setupDB();
    
    // Inicializa todos los servicios (MinIO, buckets, etc.)
    console.log("⚙️ Inicializando servicios...");
    const servicesInitialized = await initializeServices();
    if (!servicesInitialized) {
      console.warn("⚠️ Algunos servicios no se inicializaron correctamente, pero continuando...");
    }
    
    // Inicia el servidor web
    console.log("🌐 Iniciando servidor web...");
    await setupServer();
    
    // Inicia la creación de los roles
    console.log("👤 Configurando roles...");
    await createRoles();
    
    // Inicia la creación del usuario admin y user
    console.log("👥 Configurando usuarios iniciales...");
    await createUsers();
    
    console.log("✅ API iniciada exitosamente");
  } catch (err) {
    console.error("[API] Error en setupAPI:", err);
    handleFatalError(err, "/server.js -> setupAPI");
  }
}
const app = express();
app.use(cors());

// Inicia la API
setupAPI()
  .then(() => console.log("🎉 => API de Escuela de Música lista para usar"))
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
