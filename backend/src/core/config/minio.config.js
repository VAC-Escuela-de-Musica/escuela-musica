import { Client as MinioClient } from 'minio'
import {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET_PRIVATE,
  MINIO_BUCKET_PUBLIC,
  MINIO_BUCKET_GALERY
} from './configEnv.js'
import { handleError } from '../utils/errorHandler.util.js'

// Crear cliente de MinIO usando las variables de entorno centralizadas
const minioClient = new MinioClient({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
})

/**
 * Inicializa MinIO y crea los buckets necesarios si no existen.
 */
async function setupMinIO () {
  try {
    console.log('🔧 Inicializando MinIO...')

    const buckets = [
      { name: MINIO_BUCKET_PRIVATE, label: 'Materiales Privados' },
      { name: MINIO_BUCKET_PUBLIC, label: 'Materiales Públicos' },
      { name: MINIO_BUCKET_GALERY, label: 'Galería de Imágenes' }
    ]

    for (const bucket of buckets) {
      const bucketExists = await minioClient.bucketExists(bucket.name)
      if (!bucketExists) {
        await minioClient.makeBucket(bucket.name, 'us-east-1')
        console.log(`✅ Bucket "${bucket.name}" (${bucket.label}) creado exitosamente`)
        // Si es el bucket público, configuramos la política pública de solo lectura
        if (bucket.name === MINIO_BUCKET_PUBLIC) {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${MINIO_BUCKET_PUBLIC}/*`]
              }
            ]
          }
          await minioClient.setBucketPolicy(MINIO_BUCKET_PUBLIC, JSON.stringify(policy))
          console.log(`=> Política pública configurada para el bucket '${MINIO_BUCKET_PUBLIC}'`)
        }
      } else {
        console.log(`✅ Bucket "${bucket.name}" (${bucket.label}) ya existe`)
        // Si es el bucket público, verificamos si ya tiene política pública
        if (bucket.name === MINIO_BUCKET_PUBLIC) {
          try {
            await minioClient.getBucketPolicy(MINIO_BUCKET_PUBLIC)
            console.log(`=> Política pública ya configurada para '${MINIO_BUCKET_PUBLIC}'`)
          } catch (policyError) {
            // Si no tiene política, la configuramos
            const policy = {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${MINIO_BUCKET_PUBLIC}/*`]
                }
              ]
            }
            await minioClient.setBucketPolicy(MINIO_BUCKET_PUBLIC, JSON.stringify(policy))
            console.log(`=> Política pública configurada para el bucket '${MINIO_BUCKET_PUBLIC}'`)
          }
        }
      }
    }

    console.log('🎉 MinIO inicializado correctamente')
    return true
  } catch (error) {
    handleError(error, '/config/minio.config.js -> setupMinIO')
    return false
  }
}

export {
  minioClient,
  MINIO_BUCKET_PRIVATE as BUCKET_PRIVATE,
  MINIO_BUCKET_PUBLIC as BUCKET_PUBLIC,
  MINIO_BUCKET_GALERY as BUCKET_GALERY,
  setupMinIO
}
