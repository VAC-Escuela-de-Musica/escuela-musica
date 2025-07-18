#!/usr/bin/env node

/**
 * Script de prueba para verificar las funcionalidades de subida y descarga
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '../config/.env');
dotenv.config({ path: envFilePath });

// Importar servicios
import { minioService } from '../services/minio.service.js';
import { fileService } from '../services/file.service.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar MinIO
app.get('/test-minio', async (req, res) => {
  try {
    const health = await minioService.healthCheck();
    res.json({
      success: true,
      message: 'MinIO está funcionando',
      health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error conectando a MinIO',
      error: error.message
    });
  }
});

// Ruta de prueba para generar URL de subida
app.post('/test-upload-url', async (req, res) => {
  try {
    const uploadData = await minioService.generateUploadUrl(
      'private',
      'test-file.txt',
      300,
      { 'Content-Type': 'text/plain' }
    );
    
    res.json({
      success: true,
      message: 'URL de subida generada',
      data: uploadData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generando URL de subida',
      error: error.message
    });
  }
});

// Ruta de prueba para listar archivos
app.get('/test-list-files', async (req, res) => {
  try {
    const privateFiles = await minioService.listFiles('private');
    const publicFiles = await minioService.listFiles('public');
    
    res.json({
      success: true,
      message: 'Archivos listados exitosamente',
      data: {
        private: privateFiles.length,
        public: publicFiles.length,
        privateFiles: privateFiles.slice(0, 5), // Solo los primeros 5
        publicFiles: publicFiles.slice(0, 5)   // Solo los primeros 5
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listando archivos',
      error: error.message
    });
  }
});

// Iniciar servidor de prueba
app.listen(PORT, () => {
  console.log(`🧪 Servidor de prueba iniciado en puerto ${PORT}`);
  console.log(`🔗 Pruebas disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/test-minio`);
  console.log(`   POST http://localhost:${PORT}/test-upload-url`);
  console.log(`   GET  http://localhost:${PORT}/test-list-files`);
});

export default app;
