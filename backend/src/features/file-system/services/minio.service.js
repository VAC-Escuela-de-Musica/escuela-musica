import { Client } from 'minio'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'url'

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envFilePath = path.resolve(__dirname, '../../../.env')
dotenv.config({ path: envFilePath })

class MinioService {
  constructor () {
    // Verificar que las variables de entorno estén disponibles
    if (!process.env.MINIO_ENDPOINT) {
      throw new Error('MINIO_ENDPOINT no está definido en las variables de entorno')
    }
    if (!process.env.MINIO_ACCESS_KEY) {
      throw new Error('MINIO_ACCESS_KEY no está definido en las variables de entorno')
    }
    if (!process.env.MINIO_SECRET_KEY) {
      throw new Error('MINIO_SECRET_KEY no está definido en las variables de entorno')
    }

    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    })

    this.buckets = {
      private: process.env.MINIO_BUCKET_PRIVATE || 'materiales-privados',
      public: process.env.MINIO_BUCKET_PUBLIC || 'materiales-publicos',
      galery: process.env.MINIO_BUCKET_GALERY || 'galeria-imagenes'
    }
  }

  /**
   * Genera URL prefirmada para subida
   */
  async generateUploadUrl (bucketType, filename, duration = 300, headers = {}) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private

      // Verificar que el bucket existe
      const bucketExists = await this.client.bucketExists(bucket)
      if (!bucketExists) {
        throw new Error(`Bucket ${bucket} no existe`)
      }

      const uploadUrl = await this.client.presignedPutObject(
        bucket,
        filename,
        duration,
        headers
      )

      return {
        uploadUrl,
        bucket,
        filename,
        expiresIn: duration
      }
    } catch (error) {
      console.error('Error generando URL de subida MinIO:', error)
      throw new Error(`No se pudo generar URL de subida: ${error.message}`)
    }
  }

  /**
   * Genera URL prefirmada para descarga
   */
  async generateDownloadUrl (bucketType, filename, duration = 300, responseHeaders = {}) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private

      // Verificar que el bucket y archivo existen
      const bucketExists = await this.client.bucketExists(bucket)
      if (!bucketExists) {
        throw new Error(`Bucket ${bucket} no existe`)
      }

      const downloadUrl = await this.client.presignedGetObject(
        bucket,
        filename,
        duration,
        responseHeaders
      )

      return {
        url: downloadUrl, // Cambiar downloadUrl por url para consistencia
        downloadUrl, // Mantener por compatibilidad
        bucket,
        filename,
        expiresIn: duration
      }
    } catch (error) {
      console.error('Error generando URL de descarga MinIO:', error)
      throw new Error(`No se pudo generar URL de descarga: ${error.message}`)
    }
  }

  /**
   * Método genérico para generar URLs presignadas
   */
  async getPresignedUrl (method = 'GET', bucketType, filename, duration = 3600, responseHeaders = {}) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private

      // Verificar que el bucket existe
      const bucketExists = await this.client.bucketExists(bucket)
      if (!bucketExists) {
        throw new Error(`Bucket ${bucket} no existe`)
      }

      let presignedUrl

      if (method.toUpperCase() === 'GET') {
        presignedUrl = await this.client.presignedGetObject(
          bucket,
          filename,
          duration,
          responseHeaders
        )
      } else if (method.toUpperCase() === 'PUT') {
        presignedUrl = await this.client.presignedPutObject(
          bucket,
          filename,
          duration
        )
      } else {
        throw new Error(`Método ${method} no soportado`)
      }

      return presignedUrl
    } catch (error) {
      console.error(`Error generando URL presignada ${method}:`, error)
      throw new Error(`No se pudo generar URL presignada: ${error.message}`)
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists (bucketType, filename) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private
      const stat = await this.client.statObject(bucket, filename)
      return {
        exists: true,
        size: stat.size,
        lastModified: stat.lastModified,
        contentType: stat.metaData['content-type']
      }
    } catch (error) {
      if (error.code === 'NotFound') {
        return { exists: false }
      }
      throw error
    }
  }

  /**
   * Elimina un archivo
   */
  async deleteFile (bucketType, filename) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private
      await this.client.removeObject(bucket, filename)
      return true
    } catch (error) {
      console.error('Error eliminando archivo MinIO:', error)
      throw new Error('No se pudo eliminar el archivo')
    }
  }

  /**
   * Obtiene stream de archivo (para fallback)
   */
  async getFileStream (bucketType, filename) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private
      return await this.client.getObject(bucket, filename)
    } catch (error) {
      console.error('Error obteniendo stream MinIO:', error)
      throw new Error('No se pudo obtener el archivo')
    }
  }

  /**
   * Lista archivos en bucket
   */
  async listFiles (bucketType, prefix = '', maxKeys = 1000) {
    try {
      const bucket = this.buckets[bucketType] || this.buckets.private
      const stream = this.client.listObjects(bucket, prefix, false)

      const files = []
      return new Promise((resolve, reject) => {
        stream.on('data', obj => files.push(obj))
        stream.on('end', () => resolve(files))
        stream.on('error', reject)
      })
    } catch (error) {
      console.error('Error listando archivos MinIO:', error)
      throw new Error('No se pudo listar archivos')
    }
  }

  /**
   * Verifica salud de MinIO
   */
  async healthCheck () {
    try {
      // Intentar listar buckets como health check
      await this.client.listBuckets()
      return { status: 'healthy', timestamp: new Date() }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      }
    }
  }

  /**
   * Inicializa buckets si no existen
   */
  async initializeBuckets () {
    try {
      // Crear bucket privado
      const privateBucketExists = await this.client.bucketExists(this.buckets.private)
      if (!privateBucketExists) {
        await this.client.makeBucket(this.buckets.private)
        console.log(`✅ Bucket privado '${this.buckets.private}' creado exitosamente`)
      }

      // Crear bucket público
      const publicBucketExists = await this.client.bucketExists(this.buckets.public)
      if (!publicBucketExists) {
        await this.client.makeBucket(this.buckets.public)
        console.log(`✅ Bucket público '${this.buckets.public}' creado exitosamente`)

        // Configurar política para hacer público el bucket
        const publicPolicy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.buckets.public}/*`]
            }
          ]
        }

        await this.client.setBucketPolicy(this.buckets.public, JSON.stringify(publicPolicy))
        console.log(`✅ Política pública aplicada a '${this.buckets.public}'`)
      }

      console.log('✅ Buckets inicializados correctamente')
    } catch (error) {
      console.error('❌ Error inicializando buckets:', error)
      throw error
    }
  }
}

export const minioService = new MinioService()
