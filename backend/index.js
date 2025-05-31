// Importa el módulo Express
const express = require('express');

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto en el que escuchará el servidor
// Puedes usar una variable de entorno para el puerto en producción, o un valor por defecto
const port = process.env.PORT || 1230;

// Middleware para parsear JSON (opcional, pero muy común si vas a recibir datos JSON)
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
app.listen(port, () => {
    console.log(`Servidor Express escuchando en http://localhost:${port}`);
});