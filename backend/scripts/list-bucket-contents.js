import dotenv from 'dotenv'
import { Client } from 'minio'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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

async function listBucketContents() {
  try {
    console.log('📋 Listando contenido de buckets...')
    
    const buckets = ['imagenes-publicas', 'galeria-imagenes']
    
    for (const bucketName of buckets) {
      console.log(`\n📦 Bucket: ${bucketName}`)
      console.log('=' .repeat(50))
      
      try {
        const bucketExists = await minioClient.bucketExists(bucketName)
        if (!bucketExists) {
          console.log(`❌ Bucket ${bucketName} no existe`)
          continue
        }
        
        const files = []
        const stream = minioClient.listObjects(bucketName, '', true) // recursive = true
        
        await new Promise((resolve, reject) => {
          stream.on('data', obj => files.push(obj))
          stream.on('end', resolve)
          stream.on('error', reject)
        })
        
        if (files.length === 0) {
          console.log('📂 Bucket vacío')
        } else {
          console.log(`📊 Total de archivos: ${files.length}`)
          console.log('\n📄 Archivos:')
          files.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
          })
        }
        
      } catch (error) {
        console.log(`❌ Error listando bucket ${bucketName}: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

listBucketContents()