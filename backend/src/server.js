// Importa el archivo 'configEnv.js' para cargar las variables de entorno
import { PORT, HOST } from "./config/configEnv.js";
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
import { setupDB } from "./config/configDB.js";
// Importa la configuración de MinIO
import { setupMinIO } from "./config/minio.config.js";
// Importa el handler de errores
import { handleFatalError, handleError } from "./utils/errorHandler.js";
import { createUsers } from "./config/initialSetup.js";

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
    server.use(json());
    // Agregamos el middleware para el manejo de cookies
    server.use(cookieParser());
    // Agregamos morgan para ver las peticiones que se hacen al servidor
    server.use(morgan("dev"));
    // Agrega el enrutador principal al servidor
    server.use("/api", indexRoutes);

    // === Servir archivos estáticos del frontend (dist) ===
    const distPath = path.resolve(process.cwd(), "../frontend/dist");
    server.use(express.static(distPath));

    // Para SPA: redirige cualquier ruta que NO empiece con /api al index.html del frontend
    server.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    // Inicia el servidor en el puerto especificado
    server.listen(PORT, () => {
      // ...existing code...
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
    console.log("[API] Iniciando setupAPI...");
    // Inicia la conexión a la base de datos
    await setupDB();
    console.log("[API] setupDB completado");
    // Inicia la configuración de MinIO
    await setupMinIO();
    console.log("[API] setupMinIO completado");
    // Inicia el servidor web
    await setupServer();
    console.log("[API] setupServer completado");
    // Inicia la creación del usuario admin y user
    await createUsers();
    console.log("[API] createUsers completado");
  } catch (err) {
    console.error("[API] Error en setupAPI:", err);
    handleFatalError(err, "/server.js -> setupAPI");
  }
}
const app = express();
app.use(cors());

// Inicia la API
setupAPI()
  // ...existing code...
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
