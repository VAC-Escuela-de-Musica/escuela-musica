// Importa la configuración centralizada
import { config } from "./config/index.js";
// Importa la aplicación Express configurada
import { createApp } from "./app.js";
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
    // Crea la aplicación Express con toda la configuración
    const app = createApp();

    // Inicia el servidor en el puerto especificado
    const server = app.listen(config.server.port, () => {
      console.log(`=> Servidor corriendo en ${config.server.host}:${config.server.port}`);
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
    handleFatalError(err, "/server.js -> setupAPI");
  }
}

// Inicia la API
setupAPI()
  .then(() => console.log("🎉 => API de Escuela de Música lista para usar"))
  .catch((err) => handleFatalError(err, "/server.js -> setupAPI"));
