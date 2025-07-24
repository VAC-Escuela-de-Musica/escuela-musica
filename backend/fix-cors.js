import dotenv from 'dotenv'
import { minioService } from './src/services/index.js'

// Cargar variables de entorno
dotenv.config()

async function fixCorsConfiguration() {
  try {
    console.log('🔧 Configurando CORS para MinIO...')
    
    // Llamar directamente al servicio MinIO para inicializar buckets con CORS
    await minioService.initializeBuckets()
    
    console.log('✅ Configuración CORS completada!')
    console.log('💡 Ahora las imágenes deberían cargar correctamente desde el frontend')
    
  } catch (error) {
    console.error('❌ Error configurando CORS:', error.message)
  }
}

fixCorsConfiguration()