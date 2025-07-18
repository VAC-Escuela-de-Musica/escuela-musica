#!/usr/bin/env node

/**
 * Script de diagnóstico específico para subida de archivos
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { minioService } from '../services/minio.service.js';
import { fileService } from '../services/file.service.js';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envFilePath = path.resolve(__dirname, '../config/.env');
dotenv.config({ path: envFilePath });

async function testUploadFlow() {
  console.log('🧪 === DIAGNÓSTICO DE SUBIDA DE ARCHIVOS ===\n');
  
  try {
    // 1. Verificar MinIO está disponible
    console.log('1️⃣ Verificando MinIO...');
    const health = await minioService.healthCheck();
    if (health.status !== 'healthy') {
      throw new Error(`MinIO no está disponible: ${health.error}`);
    }
    console.log('✅ MinIO está operativo\n');
    
    // 2. Simular material para subida
    console.log('2️⃣ Simulando material...');
    const materialMock = {
      _id: '507f1f77bcf86cd799439011',
      nombre: 'Archivo de prueba',
      descripcion: 'Test upload',
      bucketTipo: 'privado',
      tipoContenido: 'text/plain',
      tipo: 'document'
    };
    
    const uploadOptions = {
      extension: 'txt',
      contentType: 'text/plain',
      user: { email: 'test@example.com' }
    };
    
    console.log('✅ Material simulado creado\n');
    
    // 3. Probar prepareUpload
    console.log('3️⃣ Probando prepareUpload...');
    const uploadData = await fileService.prepareUpload(materialMock, uploadOptions);
    console.log('✅ Upload URL generada:', {
      filename: uploadData.filename,
      bucket: uploadData.bucketType,
      expiresIn: uploadData.expiresIn,
      url: uploadData.uploadUrl.substring(0, 100) + '...'
    });
    console.log('');
    
    // 4. Probar si el archivo existe (debería fallar)
    console.log('4️⃣ Verificando que archivo no existe todavía...');
    try {
      await fileService.verifyUpload(uploadData.filename, materialMock.bucketTipo);
      console.log('❌ ERROR: El archivo no debería existir aún');
    } catch (error) {
      console.log('✅ Correcto: El archivo no existe (como se esperaba)');
    }
    console.log('');
    
    // 5. Simular subida (crear un archivo pequeño)
    console.log('5️⃣ Simulando subida de archivo...');
    const testContent = 'Este es un archivo de prueba para verificar la subida';
    const bucket = materialMock.bucketTipo === 'publico' ? 'public' : 'private';
    
    // Usar el cliente MinIO directamente para simular la subida
    const minioClient = minioService.client;
    const bucketName = minioService.buckets[bucket];
    
    await minioClient.putObject(
      bucketName,
      uploadData.filename,
      Buffer.from(testContent),
      {
        'Content-Type': 'text/plain',
        'X-Amz-Meta-Test': 'true'
      }
    );
    
    // Actualizar el mock con el filename para las siguientes pruebas
    materialMock.filename = uploadData.filename;
    
    console.log('✅ Archivo subido exitosamente');
    console.log('');
    
    // 6. Verificar que ahora el archivo existe
    console.log('6️⃣ Verificando que archivo existe después de subida...');
    const fileInfo = await fileService.verifyUpload(uploadData.filename, materialMock.bucketTipo);
    console.log('✅ Archivo verificado:', {
      exists: fileInfo.exists,
      size: fileInfo.size,
      contentType: fileInfo.contentType
    });
    console.log('');
    
    // 7. Probar descarga
    console.log('7️⃣ Probando generación de URL de descarga...');
    const downloadData = await fileService.prepareDownload(materialMock, {
      action: 'download',
      duration: 300
    });
    console.log('✅ Download URL generada:', {
      action: downloadData.action,
      expiresIn: downloadData.expiresIn,
      url: downloadData.downloadUrl.substring(0, 100) + '...'
    });
    console.log('');
    
    // 8. Limpiar - eliminar archivo de prueba
    console.log('8️⃣ Limpiando archivo de prueba...');
    await fileService.deleteFile(materialMock);
    console.log('✅ Archivo de prueba eliminado');
    console.log('');
    
    console.log('🎉 === DIAGNÓSTICO COMPLETADO EXITOSAMENTE ===');
    console.log('✅ Todos los componentes de subida funcionan correctamente');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  testUploadFlow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { testUploadFlow };
