/**
 * Script para configurar CORS en MinIO usando AWS SDK
 * Ejecutar con: node src/scripts/setupMinioCors.js
 */

import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuración de MinIO desde variables de entorno
const {
  MINIO_ENDPOINT = 'localhost',
  MINIO_PORT = '9000',
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET = 'materiales',
  MINIO_PUBLIC_BUCKET = 'imagenes-publicas',
  MINIO_USE_SSL = 'false'
} = process.env;

// Crear cliente S3 compatible con MinIO
const s3Client = new S3Client({
  endpoint: `${MINIO_USE_SSL === 'true' ? 'https' : 'http'}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  region: 'us-east-1', // Región por defecto para MinIO
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY
  },
  forcePathStyle: true // Necesario para MinIO
});

// Configuración CORS
const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
      AllowedOrigins: ['*'], // En producción, especificar orígenes exactos
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
      MaxAgeSeconds: 3600
    }
  ]
};

// Función para configurar CORS en un bucket
async function configureCors(bucketName) {
  try {
    console.log(`Configurando CORS para bucket '${bucketName}'...`);
    
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfig
    });
    
    await s3Client.send(command);
    console.log(`✅ CORS configurado correctamente para bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(`❌ Error configurando CORS para bucket '${bucketName}':`, error);
    return false;
  }
}

// Configurar CORS para ambos buckets
async function main() {
  try {
    console.log('🚀 Iniciando configuración de CORS en MinIO...');
    console.log(`📂 Endpoint MinIO: ${MINIO_ENDPOINT}:${MINIO_PORT}`);
    
    // Configurar bucket principal
    await configureCors(MINIO_BUCKET);
    
    // Configurar bucket público
    await configureCors(MINIO_PUBLIC_BUCKET);
    
    console.log('✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar script
main();
