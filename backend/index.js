// Importa el módulo Express
const express = require('express');

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto en el que escuchará el servidor
const port = process.env.PORT || 1230; // Cambiado a 1230 como en tu ejemplo

// Middleware para parsear JSON
app.use(express.json());

// Define una ruta de ejemplo para la raíz ('/')
app.get('/', (req, res) => {
    res.send('¡Hola Mundo desde Express en index.js!');
});

// Define otra ruta de ejemplo para una API
app.get('/api/saludo', (req, res) => {
    res.json({ mensaje: 'Hola desde la API de Express' });
});

// Inicia el servidor y haz que escuche en el puerto especificado
const server = app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
});

// Manejador para el evento 'error' del servidor
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error; // Si no es un error de 'listen', relánzalo
    }

    // Manejar errores específicos de listen
    switch (error.code) {
        case 'EACCES': // Error de permisos
            console.error(`El puerto ${port} requiere privilegios elevados.`);
            process.exit(1); // Termina el proceso con código de error
            break;
        case 'EADDRINUSE': // Error de puerto en uso
        console.error(`El puerto ${port} ya está en uso por otra aplicación.`);
            process.exit(1); // Termina el proceso con código de error
            break;
        default:
            console.error('Ocurrió un error al iniciar el servidor:', error);
            process.exit(1); // Termina el proceso con código de error
    }
});