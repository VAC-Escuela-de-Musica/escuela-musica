import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Client } from 'minio'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') })

// Debug: Verificar variables de entorno
console.log('🔍 Variables de entorno:')
console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT)
console.log('MINIO_PORT:', process.env.MINIO_PORT)
console.log('MINIO_ACCESS_KEY:', process.env.MINIO_ACCESS_KEY ? '***' : 'undefined')
console.log('MINIO_SECRET_KEY:', process.env.MINIO_SECRET_KEY ? '***' : 'undefined')
console.log('DB_URL:', process.env.DB_URL ? '***' : 'undefined')

// Configurar cliente MinIO directamente
console.log('🔧 Configurando cliente MinIO...')
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
})
console.log('✅ Cliente MinIO configurado')

// Configuración de buckets
const SOURCE_BUCKET = 'imagenes-publicas'
const TARGET_BUCKET = process.env.MINIO_BUCKET_GALERY || 'galeria-imagenes'

/**
 * Script para migrar imágenes del bucket 'imagenes-publicas' al bucket 'galeria-imagenes'
 * y actualizar las referencias en la base de datos
 */
async function migrateImages() {
  console.log('📋 Función migrateImages iniciada')
  try {
    console.log('🚀 Iniciando migración de imágenes...')
    console.log(`📦 Origen: ${SOURCE_BUCKET}`)
    console.log(`📦 Destino: ${TARGET_BUCKET}`)
    
    // Conectar a MongoDB
    console.log('🔗 Conectando a MongoDB...')
    await mongoose.connect(process.env.DB_URL)
    console.log('✅ Conectado a MongoDB')
    
    const db = mongoose.connection.db
    
    // Verificar que el bucket destino existe
    console.log('🔍 Verificando bucket destino...')
    const targetBucketExists = await minioClient.bucketExists(TARGET_BUCKET)
    if (!targetBucketExists) {
      console.log(`📦 Creando bucket destino: ${TARGET_BUCKET}`)
      await minioClient.makeBucket(TARGET_BUCKET)
      
      // Configurar política pública para el bucket galería
      const galeryPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${TARGET_BUCKET}/*`]
          }
        ]
      }
      
      await minioClient.setBucketPolicy(TARGET_BUCKET, JSON.stringify(galeryPolicy))
      console.log(`✅ Bucket ${TARGET_BUCKET} creado con política pública`)
    } else {
      console.log(`✅ Bucket destino ${TARGET_BUCKET} ya existe`)
    }
    
    // Verificar que el bucket origen existe
    console.log('🔍 Verificando bucket origen...')
    const sourceBucketExists = await minioClient.bucketExists(SOURCE_BUCKET)
    if (!sourceBucketExists) {
      console.log(`❌ El bucket origen ${SOURCE_BUCKET} no existe`)
      return
    }
    
    // Buscar imágenes en la base de datos que usen el bucket origen
    console.log('🔍 Buscando imágenes en la base de datos...')
    const galeriasPublicas = await db.collection('galerias').find({
      imagen: { $regex: SOURCE_BUCKET }
    }).toArray()
    
    console.log(`📊 Encontradas ${galeriasPublicas.length} imágenes para migrar`)
    
    if (galeriasPublicas.length === 0) {
      console.log('ℹ️ No hay imágenes para migrar')
      return
    }
    
    // Listar archivos en el bucket origen (recursivo para incluir subcarpetas)
    console.log('📋 Listando archivos en bucket origen...')
    const sourceFiles = []
    const stream = minioClient.listObjects(SOURCE_BUCKET, '', true) // recursive = true
    
    await new Promise((resolve, reject) => {
      stream.on('data', obj => sourceFiles.push(obj))
      stream.on('end', resolve)
      stream.on('error', reject)
    })
    
    console.log(`📊 Encontrados ${sourceFiles.length} archivos en bucket origen`)
    
    let migratedCount = 0
    let errorCount = 0
    const migrationResults = []
    
    // Procesar cada imagen
    for (const galeria of galeriasPublicas) {
      try {
        console.log(`\n🔄 Procesando imagen: ${galeria.titulo || 'Sin título'}`)
        console.log(`   ID: ${galeria._id}`)
        console.log(`   URL actual: ${galeria.imagen}`)
        
        // Extraer nombre del archivo de la URL
        const filename = galeria.imagen.split(`/${SOURCE_BUCKET}/`)[1]
        if (!filename) {
          console.log(`   ❌ No se pudo extraer el nombre del archivo`)
          errorCount++
          continue
        }
        
        console.log(`   📄 Archivo: ${filename}`)
        
        // Verificar que el archivo existe en el bucket origen
        const fileExists = sourceFiles.find(file => file.name === filename)
        if (!fileExists) {
          console.log(`   ⚠️ Archivo no encontrado en bucket origen: ${filename}`)
          errorCount++
          continue
        }
        
        // Verificar si ya existe en el bucket destino
        try {
          await minioClient.statObject(TARGET_BUCKET, filename)
          console.log(`   ℹ️ Archivo ya existe en destino: ${filename}`)
        } catch (error) {
          if (error.code === 'NotFound') {
            // Copiar archivo del bucket origen al destino
            console.log(`   📋 Copiando archivo...`)
            await minioClient.copyObject(
              TARGET_BUCKET,
              filename,
              `/${SOURCE_BUCKET}/${filename}`
            )
            console.log(`   ✅ Archivo copiado exitosamente`)
          } else {
            throw error
          }
        }
        
        // Actualizar URL en la base de datos
        const newUrl = galeria.imagen.replace(SOURCE_BUCKET, TARGET_BUCKET)
        console.log(`   🔄 Actualizando URL en base de datos...`)
        console.log(`   Nueva URL: ${newUrl}`)
        
        await db.collection('galerias').updateOne(
          { _id: galeria._id },
          { $set: { imagen: newUrl } }
        )
        
        console.log(`   ✅ URL actualizada en base de datos`)
        
        migratedCount++
        migrationResults.push({
          id: galeria._id,
          titulo: galeria.titulo,
          filename,
          oldUrl: galeria.imagen,
          newUrl,
          status: 'success'
        })
        
      } catch (error) {
        console.log(`   ❌ Error procesando imagen: ${error.message}`)
        errorCount++
        migrationResults.push({
          id: galeria._id,
          titulo: galeria.titulo,
          filename: galeria.imagen.split(`/${SOURCE_BUCKET}/`)[1] || 'unknown',
          oldUrl: galeria.imagen,
          error: error.message,
          status: 'error'
        })
      }
    }
    
    // Resumen de migración
    console.log('\n📊 RESUMEN DE MIGRACIÓN')
    console.log('========================')
    console.log(`✅ Imágenes migradas exitosamente: ${migratedCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📊 Total procesadas: ${galeriasPublicas.length}`)
    
    if (migrationResults.length > 0) {
      console.log('\n📋 DETALLES:')
      migrationResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.titulo || 'Sin título'} - ${result.status.toUpperCase()}`)
        if (result.status === 'error') {
          console.log(`   Error: ${result.error}`)
        }
      })
    }
    
    // Verificar migración
    console.log('\n🔍 Verificando migración...')
    const remainingImages = await db.collection('galerias').find({
      imagen: { $regex: SOURCE_BUCKET }
    }).toArray()
    
    if (remainingImages.length === 0) {
      console.log('✅ Todas las imágenes han sido migradas exitosamente')
      console.log('\n💡 RECOMENDACIONES:')
      console.log('1. Verifica que las imágenes se muestren correctamente en el frontend')
      console.log('2. Una vez confirmado, puedes eliminar el bucket origen si ya no se necesita')
      console.log(`3. Comando para eliminar bucket origen: minioClient.removeBucket('${SOURCE_BUCKET}')`)
    } else {
      console.log(`⚠️ Quedan ${remainingImages.length} imágenes sin migrar`)
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message)
    console.error(error.stack)
  } finally {
    // Cerrar conexión a MongoDB
    await mongoose.disconnect()
    console.log('\n🔌 Desconectado de MongoDB')
    console.log('🎉 Migración completada')
  }
}

// Función para limpiar bucket origen (usar con precaución)
async function cleanupSourceBucket() {
  try {
    console.log('⚠️ ADVERTENCIA: Esta función eliminará el bucket origen')
    console.log('Asegúrate de que la migración fue exitosa antes de continuar')
    
    // Verificar que no quedan referencias en la base de datos
    await mongoose.connect(process.env.DB_URL)
    const db = mongoose.connection.db
    
    const remainingImages = await db.collection('galerias').find({
      imagen: { $regex: SOURCE_BUCKET }
    }).toArray()
    
    if (remainingImages.length > 0) {
      console.log(`❌ No se puede eliminar el bucket. Quedan ${remainingImages.length} referencias en la base de datos`)
      return
    }
    
    // Eliminar todos los objetos del bucket
    console.log(`🗑️ Eliminando objetos del bucket ${SOURCE_BUCKET}...`)
    const objectsList = []
    const stream = minioClient.listObjects(SOURCE_BUCKET, '', false)
    
    await new Promise((resolve, reject) => {
      stream.on('data', obj => objectsList.push(obj.name))
      stream.on('end', resolve)
      stream.on('error', reject)
    })
    
    if (objectsList.length > 0) {
      await minioClient.removeObjects(SOURCE_BUCKET, objectsList)
      console.log(`✅ Eliminados ${objectsList.length} objetos`)
    }
    
    // Eliminar bucket
    await minioClient.removeBucket(SOURCE_BUCKET)
    console.log(`✅ Bucket ${SOURCE_BUCKET} eliminado exitosamente`)
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message)
  } finally {
    await mongoose.disconnect()
  }
}

// Ejecutar migración
if (import.meta.url.startsWith('file://') && process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)
  
  if (args.includes('--cleanup')) {
    console.log('🧹 Modo limpieza activado')
    cleanupSourceBucket()
  } else {
    console.log('🎯 Ejecutando migración...')
    migrateImages()
  }
} else {
  console.log('🎯 Ejecutando migración directamente...')
  migrateImages()
}

export { migrateImages, cleanupSourceBucket }