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

async function checkSpecificFilesInPublic() {
  try {
    console.log('🔍 Verificando archivos específicos en bucket público...');
    
    // Archivos específicos mencionados en el console log
    const specificFiles = [
      'galeria_1753521140002_x220i6ug4',  // De materiales-publicos
      'galeria_1753520879838_87s8s68fn'   // De galeria-imagenes
    ];
    
    const bucket = 'imagenes-publicas';
    
    for (const fileName of specificFiles) {
      try {
        console.log(`\n🔍 Verificando: ${bucket}/${fileName}`);
        
        const stats = await minioClient.statObject(bucket, fileName);
        console.log(`   ✅ Existe (${stats.size} bytes)`);
        
        // Generar URL para probar acceso
        const url = `http://146.83.198.35:1254/${bucket}/${fileName}`;
        console.log(`   📋 URL: ${url}`);
        
      } catch (error) {
        console.log(`   ❌ No existe: ${error.message}`);
      }
    }
    
    // También verificar algunos archivos que sabemos que existen
    const knownFiles = [
      'galeria/52061e64-845d-41c3-95d5-c394094d0d1e.jpeg',
      'galeria/3cd1a263-c295-4d64-a9a1-b2c1cbdff956.jpeg',
      'galeria/5afd8ca1-54e3-41d7-8258-bf7a2574cd06.jpeg'
    ];
    
    console.log('\n🔍 Verificando archivos conocidos que funcionan:');
    for (const fileName of knownFiles) {
      try {
        const stats = await minioClient.statObject(bucket, fileName);
        console.log(`   ✅ ${fileName} - Existe (${stats.size} bytes)`);
      } catch (error) {
        console.log(`   ❌ ${fileName} - No existe: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando archivos:', error);
  }
}

// Ejecutar la verificación
checkSpecificFilesInPublic(); 