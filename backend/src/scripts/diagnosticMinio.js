#!/usr/bin/env node

/**
 * Script de diagnóstico para MinIO
 * Verifica conectividad, buckets y permisos
 */

import { minioService } from '../services/minio.service.js';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '../config/.env');
dotenv.config({ path: envFilePath });

async function diagnosticMinIO() {
  console.log('🔍 === DIAGNÓSTICO MINIO ===\n');
  
  // 1. Verificar configuración
  console.log('📋 Configuración actual:');
  console.log(`   Endpoint: ${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`);
  console.log(`   Access Key: ${process.env.MINIO_ACCESS_KEY}`);
  console.log(`   Secret Key: ${process.env.MINIO_SECRET_KEY ? '***' + process.env.MINIO_SECRET_KEY.slice(-3) : 'NO DEFINIDA'}`);
  console.log(`   Bucket Privado: ${process.env.MINIO_BUCKET}`);
  console.log(`   Bucket Público: ${process.env.MINIO_PUBLIC_BUCKET}\n`);
  
  try {
    // 2. Health Check
    console.log('❤️ Verificando salud de MinIO...');
    const health = await minioService.healthCheck();
    if (health.status === 'healthy') {
      console.log('✅ MinIO está operativo\n');
    } else {
      console.log(`❌ MinIO no está disponible: ${health.error}\n`);
      return;
    }
    
    // 3. Verificar buckets
    console.log('🪣 Verificando buckets...');
    await minioService.initializeBuckets();
    console.log('✅ Buckets verificados\n');
    
    // 4. Probar generación de URLs
    console.log('🔗 Probando generación de URLs...');
    
    try {
      const uploadUrl = await minioService.generateUploadUrl('private', 'test-file.txt', 60);
      console.log('✅ URL de subida generada correctamente');
      console.log(`   URL: ${uploadUrl.uploadUrl.substring(0, 100)}...\n`);
    } catch (error) {
      console.log(`❌ Error generando URL de subida: ${error.message}\n`);
    }
    
    // 5. Listar archivos existentes
    console.log('📁 Listando archivos en buckets...');
    try {
      const privateFiles = await minioService.listFiles('private');
      const publicFiles = await minioService.listFiles('public');
      
      console.log(`   Archivos privados: ${privateFiles.length}`);
      console.log(`   Archivos públicos: ${publicFiles.length}\n`);
      
      if (privateFiles.length > 0) {
        console.log('   Últimos archivos privados:');
        privateFiles.slice(0, 5).forEach(file => {
          console.log(`   - ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.log(`❌ Error listando archivos: ${error.message}\n`);
    }
    
    console.log('🎉 Diagnóstico completado exitosamente');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error.message);
    process.exit(1);
  }
}

// Ejecutar diagnóstico si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  diagnosticMinIO()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { diagnosticMinIO };
