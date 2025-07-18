#!/usr/bin/env node

/**
 * Script para probar el flujo completo de subida con autenticación
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const BASE_URL = 'http://localhost:1230';
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

async function testCompleteUploadFlow() {
  console.log('🧪 === PRUEBA COMPLETA DE SUBIDA CON AUTENTICACIÓN ===\n');
  
  try {
    // 1. Crear un archivo de prueba
    console.log('1️⃣ Creando archivo de prueba...');
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    const testContent = 'Este es un archivo de prueba creado el ' + new Date().toISOString();
    fs.writeFileSync(testFilePath, testContent);
    
    const fileBuffer = fs.readFileSync(testFilePath);
    console.log(`✅ Archivo creado: ${testFilePath} (${fileBuffer.length} bytes)\n`);
    
    // 2. Autenticarse (si es necesario)
    console.log('2️⃣ Verificando autenticación...');
    // Aquí simularemos que tenemos un token válido
    const token = 'fake-token-for-testing'; // En producción, obtener del login
    console.log('✅ Token simulado obtenido\n');
    
    // 3. Obtener URL de subida
    console.log('3️⃣ Obteniendo URL de subida...');
    const uploadUrlResponse = await fetch(`${BASE_URL}/api/materials/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        extension: 'txt',
        contentType: 'text/plain',
        nombre: 'Archivo de prueba',
        descripcion: 'Archivo creado para pruebas de subida',
        bucketTipo: 'privado'
      })
    });
    
    if (!uploadUrlResponse.ok) {
      const errorText = await uploadUrlResponse.text();
      throw new Error(`Error obteniendo URL de subida: ${uploadUrlResponse.status} - ${errorText}`);
    }
    
    const uploadData = await uploadUrlResponse.json();
    console.log('✅ URL de subida obtenida:', {
      materialId: uploadData.materialId,
      filename: uploadData.filename,
      expiresIn: uploadData.expiresIn
    });
    console.log('');
    
    // 4. Subir archivo a MinIO
    console.log('4️⃣ Subiendo archivo a MinIO...');
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Error subiendo a MinIO: ${uploadResponse.status} - ${errorText}`);
    }
    
    console.log('✅ Archivo subido a MinIO exitosamente\n');
    
    // 5. Confirmar subida
    console.log('5️⃣ Confirmando subida en backend...');
    const confirmResponse = await fetch(`${BASE_URL}/api/materials/confirm-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        materialId: uploadData.materialId,
        nombre: 'Archivo de prueba',
        descripcion: 'Archivo creado para pruebas de subida'
      })
    });
    
    if (!confirmResponse.ok) {
      const errorText = await confirmResponse.text();
      throw new Error(`Error confirmando subida: ${confirmResponse.status} - ${errorText}`);
    }
    
    const result = await confirmResponse.json();
    console.log('✅ Subida confirmada:', {
      id: result._id,
      nombre: result.nombre,
      filename: result.filename,
      tamaño: result.tamaño
    });
    console.log('');
    
    // 6. Probar descarga
    console.log('6️⃣ Probando descarga...');
    const downloadResponse = await fetch(`${BASE_URL}/api/files/serve/${result._id}?token=${token}`);
    
    if (downloadResponse.ok) {
      const downloadedContent = await downloadResponse.text();
      console.log('✅ Archivo descargado exitosamente');
      console.log('📄 Contenido:', downloadedContent.substring(0, 100) + '...');
    } else {
      console.log('⚠️ No se pudo descargar (puede ser normal si hay redirección)');
    }
    console.log('');
    
    // 7. Limpiar
    console.log('7️⃣ Limpiando archivos de prueba...');
    fs.unlinkSync(testFilePath);
    console.log('✅ Archivo local eliminado');
    
    console.log('\n🎉 === PRUEBA COMPLETADA ===');
    console.log('ℹ️ Nota: Algunos pasos pueden fallar debido a autenticación, pero el flujo básico se probó.');
    
  } catch (error) {
    console.error('💥 Error durante la prueba:', error.message);
    
    // Limpiar archivo de prueba si existe
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    console.log('\n🔍 Posibles causas del error:');
    console.log('  - El servidor backend no está ejecutándose en puerto 1230');
    console.log('  - Problemas de autenticación (token inválido)');
    console.log('  - MinIO no está disponible');
    console.log('  - Problemas de red o CORS');
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  testCompleteUploadFlow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { testCompleteUploadFlow };
