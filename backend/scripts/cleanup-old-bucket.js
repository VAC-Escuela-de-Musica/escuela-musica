import dotenv from 'dotenv'
import { Client } from 'minio'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') })

// Configurar cliente MinIO
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})

const SOURCE_BUCKET = 'imagenes-publicas'

function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

async function cleanupOldBucket() {
  try {
    console.log('🧹 LIMPIEZA DEL BUCKET ORIGEN')
    console.log('=' .repeat(50))
    console.log('⚠️  ADVERTENCIA: Esta operación eliminará PERMANENTEMENTE:')
    console.log(`   - Todos los archivos del bucket '${SOURCE_BUCKET}'`)
    console.log(`   - El bucket '${SOURCE_BUCKET}' completo`)
    console.log('')
    console.log('💡 Asegúrate de que:')
    console.log('   1. La migración se completó exitosamente')
    console.log('   2. Las imágenes se muestran correctamente en el frontend')
    console.log('   3. Ya no necesitas el bucket origen')
    console.log('')
    
    const confirmation1 = await askQuestion('¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ')
    if (confirmation1 !== 'SI') {
      console.log('❌ Operación cancelada')
      return
    }
    
    const confirmation2 = await askQuestion(`¿Confirmas que quieres eliminar PERMANENTEMENTE el bucket '${SOURCE_BUCKET}'? (escribe "ELIMINAR" para confirmar): `)
    if (confirmation2 !== 'ELIMINAR') {
      console.log('❌ Operación cancelada')
      return
    }
    
    // Verificar que el bucket existe
    const bucketExists = await minioClient.bucketExists(SOURCE_BUCKET)
    if (!bucketExists) {
      console.log(`❌ El bucket '${SOURCE_BUCKET}' no existe`)
      return
    }
    
    console.log('\n🗑️  Iniciando limpieza...')
    
    // Listar todos los objetos en el bucket
    console.log('📋 Listando objetos a eliminar...')
    const objectsToDelete = []
    const stream = minioClient.listObjects(SOURCE_BUCKET, '', true)
    
    await new Promise((resolve, reject) => {
      stream.on('data', obj => objectsToDelete.push(obj.name))
      stream.on('end', resolve)
      stream.on('error', reject)
    })
    
    console.log(`📊 Objetos encontrados: ${objectsToDelete.length}`)
    
    if (objectsToDelete.length > 0) {
      console.log('🗑️  Eliminando objetos...')
      
      // Eliminar objetos en lotes
      const batchSize = 10
      for (let i = 0; i < objectsToDelete.length; i += batchSize) {
        const batch = objectsToDelete.slice(i, i + batchSize)
        try {
          await minioClient.removeObjects(SOURCE_BUCKET, batch)
          console.log(`   ✅ Eliminados ${batch.length} objetos (${i + batch.length}/${objectsToDelete.length})`)
        } catch (error) {
          console.log(`   ❌ Error eliminando lote: ${error.message}`)
        }
      }
    }
    
    // Eliminar el bucket
    console.log('🗑️  Eliminando bucket...')
    await minioClient.removeBucket(SOURCE_BUCKET)
    
    console.log('\n✅ LIMPIEZA COMPLETADA')
    console.log('=' .repeat(50))
    console.log(`✅ Bucket '${SOURCE_BUCKET}' eliminado exitosamente`)
    console.log(`✅ ${objectsToDelete.length} objetos eliminados`)
    console.log('')
    console.log('💡 La migración está completa. Las imágenes ahora están en:')
    console.log('   📦 Bucket: galeria-imagenes')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupOldBucket()
}