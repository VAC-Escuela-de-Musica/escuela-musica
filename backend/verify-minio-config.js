import { Client } from 'minio';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar cliente MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || '146.83.198.35',
  port: parseInt(process.env.MINIO_PORT) || 1254,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

async function verifyMinioConfig() {
  try {
    console.log('🔍 Verificando configuración de MinIO...');
    
    // Mostrar configuración actual
    console.log('\n📋 Configuración actual:');
    console.log(`   - MINIO_ENDPOINT: ${process.env.MINIO_ENDPOINT}`);
    console.log(`   - MINIO_PORT: ${process.env.MINIO_PORT}`);
    console.log(`   - MINIO_ACCESS_KEY: ${process.env.MINIO_ACCESS_KEY ? 'Configurado' : 'No configurado'}`);
    console.log(`   - MINIO_SECRET_KEY: ${process.env.MINIO_SECRET_KEY ? 'Configurado' : 'No configurado'}`);
    console.log(`   - MINIO_BUCKET_PRIVATE: ${process.env.MINIO_BUCKET_PRIVATE || 'No configurado'}`);
    console.log(`   - MINIO_BUCKET_PUBLIC: ${process.env.MINIO_BUCKET_PUBLIC || 'No configurado'}`);
    console.log(`   - MINIO_BUCKET_GALERY: ${process.env.MINIO_BUCKET_GALERY || 'No configurado'}`);
    
    // Mapeo actual de buckets (usando la misma lógica del servicio)
    const buckets = {
      private: process.env.MINIO_BUCKET_PRIVATE || 'materiales-privados',
      public: 'imagenes-publicas', // Forzar uso del bucket público correcto
      galery: process.env.MINIO_BUCKET_GALERY || 'galeria-imagenes'
    };
    
    console.log('\n📦 Mapeo de buckets:');
    console.log(`   - 'private' → ${buckets.private}`);
    console.log(`   - 'public' → ${buckets.public}`);
    console.log(`   - 'galery' → ${buckets.galery}`);
    
    // Verificar que los buckets existen
    console.log('\n🔍 Verificando existencia de buckets:');
    for (const [type, bucketName] of Object.entries(buckets)) {
      try {
        const exists = await minioClient.bucketExists(bucketName);
        console.log(`   - ${bucketName}: ${exists ? '✅ Existe' : '❌ No existe'}`);
      } catch (error) {
        console.log(`   - ${bucketName}: ❌ Error: ${error.message}`);
      }
    }
    
    // Probar generación de URL de subida
    console.log('\n🧪 Probando generación de URL de subida:');
    try {
      const testFilename = `test_${Date.now()}.jpg`;
      
      // Probar con bucket 'public'
      const uploadUrl = await minioClient.presignedPutObject(
        buckets.public,
        testFilename,
        300 // 5 minutos
      );
      
      console.log(`   ✅ URL de subida generada para 'public':`);
      console.log(`      Bucket: ${buckets.public}`);
      console.log(`      Archivo: ${testFilename}`);
      console.log(`      URL: ${uploadUrl.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ Error generando URL de subida: ${error.message}`);
    }
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar la verificación
verifyMinioConfig(); 