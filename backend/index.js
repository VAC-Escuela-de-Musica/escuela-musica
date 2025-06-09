require('dotenv').config();

// Importacion modulo Express
const express = require('express');

// Creacion instancia Express
const app = express();

// Define el puerto en el que escucha el servidor
const port = process.env.PORT || 443;

// Middleware para parsear JSON
app.use(express.json());

// Ruta para la raiz ('/')
app.get('/', (req, res) => {
    res.send('¡Hola Mundo desde el servidor con Express!');
});

// Ruta para una API
app.get('/api/saludo', (req, res) => {
    res.json({ mensaje: '¡Hola desde la API de Express!' });
});

// Inicia el servidor
const server = app.listen(port, () => {
    console.log(`Servidor de Express escuchando en http://localhost:${port}`);
});

// Manejador de eventos de error del servidor
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    // Errores especificos de listen
    switch (error.code) {
        case 'EACCES': // Error de permisos
            console.error(`El puerto ${port} requiere privilegios elevados.`);
            process.exit(1); // Termina el proceso con codigo de error
            break;
        case 'EADDRINUSE': // Error de puerto en uso
        console.error(`El puerto ${port} ya esta en uso por otra aplicacion.`);
            process.exit(1); // Termina el proceso con codigo de error
            break;
        default:
            console.error('Ocurrio un error al iniciar el servidor:', error);
            process.exit(1); // Termina el proceso con codigo de error
    }
});