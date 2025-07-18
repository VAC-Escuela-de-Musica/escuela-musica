// Importa el archivo 'configEnv.js' para cargar las variables de entorno
import { PORT, HOST } from "./config/configEnv.js";
// Importa el módulo 'cors' para agregar los cors
import cors from "cors";
// Importa el módulo 'express' para crear la aplicacion web
import express, { urlencoded, json } from "express";
// Importamos morgan para ver las peticiones que se hacen al servidor
import morgan from "morgan";
// Importa el módulo 'cookie-parser' para manejar las cookies
import cookieParser from "cookie-parser";
// Importa el módulo 'path' para manejar rutas de archivos
import path from "path";
// Importa el módulo 'url' para manejar URLs
import { fileURLToPath } from "url";
/** El enrutador principal */
import indexRoutes from "./routes/index.routes.js";
// Importa el archivo 'configDB.js' para crear la conexión a la base de datos
import { setupDB } from "./config/configDB.js";
// Importa el handler de errores
import { handleFatalError, handleError } from "./utils/errorHandler.util.js";
import { createRoles, createUsers } from "./config/initialSetup.js";
// Importa la función para inicializar servicios
import { initializeServices } from "./services/index.js";

/**
 * Inicia el servidor web
 */
async function setupServer() {
  try {
    /** Instancia de la aplicacion */
    const server = express();
    server.disable("x-powered-by");
    // Agregamos los cors
    server.use(cors({ credentials: true, origin: true }));
    // Agrega el middleware para el manejo de datos en formato URL
    server.use(urlencoded({ extended: true }));
    // Agrega el middleware para el manejo de datos en formato JSON
    server.use(json());    // Agregamos el middleware para el manejo de cookies
    server.use(cookieParser());
    // Agregamos morgan para ver las peticiones que se hacen al servidor
    server.use(morgan("dev"));
    
    // === Servir archivos estáticos del frontend ===
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendPath = path.join(__dirname, "../../frontend/dist");
    server.use(express.static(frontendPath));    // Agrega el enrutador principal al servidor
    server.use("/api", indexRoutes);
    
    // Redirige cualquier ruta que no sea /api a index.html (SPA)
    server.use((req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
      }
    });

    // Inicia el servidor en el puerto especificado
    server.listen(PORT, () => {
      console.log(`=> Servidor corriendo en ${HOST}:${PORT}`);
    });
  } catch (err) {
    handleError(err, "/server.js -> setupServer");
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
    handleFatalError(err, "/server.js -> setupAPI");
  }
}

// Inicia la API
setupAPI()
  .then(() => console.log("🎉 => API de Escuela de Música lista para usar"))
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
