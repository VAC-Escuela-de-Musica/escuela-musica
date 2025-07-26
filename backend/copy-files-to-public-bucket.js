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

async function copyFilesToPublicBucket() {
  try {
    console.log('🔄 Iniciando copia de archivos al bucket público...');
    
    // Archivos específicos que necesitan ser copiados
    const filesToCopy = [
      {
        sourceBucket: 'materiales-publicos',
        sourceFile: 'galeria_1753521140002_x220i6ug4',
        destFile: 'galeria_1753521140002_x220i6ug4'
      },
      {
        sourceBucket: 'galeria-imagenes',
        sourceFile: 'galeria_1753520879838_87s8s68fn',
        destFile: 'galeria_1753520879838_87s8s68fn'
      },
      {
        sourceBucket: 'galeria-imagenes',
        sourceFile: 'galeria_1753519240437_vheqidhtw',
        destFile: 'galeria_1753519240437_vheqidhtw'
      },
      {
        sourceBucket: 'galeria-imagenes',
        sourceFile: 'galeria_1753518646012_bwcyrnkfy',
        destFile: 'galeria_1753518646012_bwcyrnkfy'
      }
    ];
    
    const destBucket = 'imagenes-publicas';
    let copiedCount = 0;
    
    for (const fileInfo of filesToCopy) {
      try {
        console.log(`\n🔄 Copiando: ${fileInfo.sourceBucket}/${fileInfo.sourceFile} → ${destBucket}/${fileInfo.destFile}`);
        
        // Verificar si el archivo de origen existe
        try {
          const sourceStats = await minioClient.statObject(fileInfo.sourceBucket, fileInfo.sourceFile);
          console.log(`   - Archivo origen existe (${sourceStats.size} bytes)`);
        } catch (error) {
          console.log(`   ❌ Archivo origen no existe: ${error.message}`);
          continue;
        }
        
        // Verificar si el archivo de destino ya existe
        try {
          const destStats = await minioClient.statObject(destBucket, fileInfo.destFile);
          console.log(`   ⚠️  Archivo destino ya existe (${destStats.size} bytes) - Saltando`);
          copiedCount++;
          continue;
        } catch (error) {
          // El archivo no existe, podemos proceder con la copia
          console.log(`   - Archivo destino no existe, procediendo con copia`);
        }
        
        // Copiar el archivo
        await minioClient.copyObject(
          destBucket,
          fileInfo.destFile,
          `${fileInfo.sourceBucket}/${fileInfo.sourceFile}`
        );
        
        console.log(`   ✅ Copiado exitosamente`);
        copiedCount++;
        
      } catch (error) {
        console.error(`   ❌ Error copiando archivo: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Resumen de copia:`);
    console.log(`   - Archivos procesados: ${filesToCopy.length}`);
    console.log(`   - Archivos copiados: ${copiedCount}`);
    console.log(`   - Errores: ${filesToCopy.length - copiedCount}`);
    
    // Verificar que los archivos estén ahora en el bucket público
    console.log('\n🔍 Verificando archivos en bucket público:');
    for (const fileInfo of filesToCopy) {
      try {
        const stats = await minioClient.statObject(destBucket, fileInfo.destFile);
        console.log(`   ✅ ${destBucket}/${fileInfo.destFile} - Existe (${stats.size} bytes)`);
      } catch (error) {
        console.log(`   ❌ ${destBucket}/${fileInfo.destFile} - No existe: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la copia:', error);
  }
}

// Ejecutar la copia
copyFilesToPublicBucket(); 