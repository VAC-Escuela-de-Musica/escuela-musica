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

async function checkMinioBuckets() {
  try {
    console.log('🔍 Verificando buckets de MinIO...');
    console.log('📋 Configuración:', {
      endpoint: process.env.MINIO_ENDPOINT,
      port: process.env.MINIO_PORT,
      accessKey: process.env.MINIO_ACCESS_KEY ? 'Configurado' : 'No configurado',
      secretKey: process.env.MINIO_SECRET_KEY ? 'Configurado' : 'No configurado'
    });

    // Lista de buckets a verificar
    const bucketsToCheck = [
      'imagenes-publicas',
      'galeria-imagenes', 
      'materiales-publicos',
      'materiales-privados'
    ];

    for (const bucketName of bucketsToCheck) {
      try {
        console.log(`\n📦 Verificando bucket: ${bucketName}`);
        
        // Verificar si el bucket existe
        const bucketExists = await minioClient.bucketExists(bucketName);
        console.log(`   - Existe: ${bucketExists ? '✅ Sí' : '❌ No'}`);
        
        if (bucketExists) {
          // Listar archivos en el bucket
          const files = [];
          const stream = minioClient.listObjects(bucketName, '', true);
          
          await new Promise((resolve, reject) => {
            stream.on('data', obj => files.push(obj));
            stream.on('end', resolve);
            stream.on('error', reject);
          });
          
          console.log(`   - Archivos encontrados: ${files.length}`);
          
          if (files.length > 0) {
            console.log(`   - Primeros 5 archivos:`);
            files.slice(0, 5).forEach((file, index) => {
              console.log(`     ${index + 1}. ${file.name} (${file.size} bytes)`);
            });
            
            if (files.length > 5) {
              console.log(`     ... y ${files.length - 5} archivos más`);
            }
          }
        }
        
      } catch (error) {
        console.log(`   - Error: ${error.message}`);
      }
    }

    // Verificar archivos específicos mencionados en los logs
    console.log('\n🔍 Verificando archivos específicos mencionados en los logs:');
    
    const specificFiles = [
      { bucket: 'materiales-publicos', file: 'galeria_1753521140002_x220i6ug4' },
      { bucket: 'galeria-imagenes', file: 'galeria_1753520879838_87s8s68fn' },
      { bucket: 'galeria-imagenes', file: 'galeria_1753519240437_vheqidhtw' },
      { bucket: 'galeria-imagenes', file: 'galeria_1753518646012_bwcyrnkfy' },
      { bucket: 'imagenes-publicas', file: 'galeria/52061e64-845d-41c3-95d5-c394094d0d1e.jpeg' }
    ];

    for (const { bucket, file } of specificFiles) {
      try {
        const exists = await minioClient.statObject(bucket, file);
        console.log(`   ✅ ${bucket}/${file} - Existe (${exists.size} bytes)`);
      } catch (error) {
        console.log(`   ❌ ${bucket}/${file} - No existe: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error verificando buckets:', error);
  }
}

// Ejecutar la verificación
checkMinioBuckets(); 