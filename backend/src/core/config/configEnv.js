'use strict'
// Import the 'path' module to get the absolute path of the .env file
import path from 'node:path'
import { fileURLToPath } from 'url'
// Load environment variables from the .env file
// ...existing code...
import dotenv from 'dotenv'

// Obtener __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** Get the absolute path of the .env file. */
const envFilePath = path.resolve(__dirname, '../../../.env')
const result = dotenv.config({ path: envFilePath })
if (result.error) {
  // eslint-disable-next-line no-console
  console.error('[dotenv] Error cargando .env:', result.error)
  // ...existing code...
} else {
  // eslint-disable-next-line no-console
  console.log('[dotenv] Variables de entorno cargadas correctamente')
  // eslint-disable-next-line no-console
  console.log('[dotenv] DB_URL:', process.env.DB_URL)
  // eslint-disable-next-line no-console
  console.log('[dotenv] MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT)
  // ...existing code...
}
dotenv.config({ path: envFilePath })

/**
 * Validates that all required environment variables are present
 * @throws {Error} If any required environment variable is missing
 */
function validateEnvironment () {
  const requiredVars = [
    'PORT',
    'HOST',
    'DB_URL',
    'ACCESS_JWT_SECRET',
    'REFRESH_JWT_SECRET',
    'MINIO_ENDPOINT',
    'MINIO_PORT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'MINIO_BUCKET_PRIVATE',
    'MINIO_BUCKET_PUBLIC',
    'MINIO_BUCKET_GALERY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
  }

  console.log('✅ Environment variables validated successfully')
}

// Validate environment on module load
validateEnvironment()

/** Server port */
export const PORT = process.env.PORT || 3000
/** Server host */
export const HOST = process.env.HOST || 'localhost'
/** Database URL */
export const DB_URL = process.env.DB_URL
/** Access token secret */
export const ACCESS_JWT_SECRET = process.env.ACCESS_JWT_SECRET
/** Refresh token secret */
export const REFRESH_JWT_SECRET = process.env.REFRESH_JWT_SECRET

/** MinIO Configuration */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost'
export const MINIO_PORT = parseInt(process.env.MINIO_PORT) || 9000
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
export const MINIO_BUCKET_PRIVATE = process.env.MINIO_BUCKET_PRIVATE
export const MINIO_BUCKET_PUBLIC = process.env.MINIO_BUCKET_PUBLIC
export const MINIO_BUCKET_GALERY = process.env.MINIO_BUCKET_GALERY
