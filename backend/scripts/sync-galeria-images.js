import dotenv from 'dotenv'
import { Client } from 'minio'
import mongoose from 'mongoose'
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

// Función para categorizar imágenes basado en el nombre del archivo
function categorizeImage (filename) {
  const lower = filename.toLowerCase()

  if (lower.includes('concierto') || lower.includes('concert')) return 'eventos'
  if (lower.includes('clase') || lower.includes('lesson')) return 'actividades'
  if (lower.includes('profesor') || lower.includes('teacher')) return 'profesores'
  if (lower.includes('estudiante') || lower.includes('student')) return 'estudiantes'
  if (lower.includes('instalacion') || lower.includes('facility')) return 'instalaciones'

  return 'otros'
}

// Función para generar título basado en el nombre del archivo
function generateTitle (filename) {
  // Remover extensión y UUID/timestamps
  let title = filename
    .replace(/\.(jpg|jpeg|png|gif|webp|bmp)$/i, '')
    .replace(/^galeria[/_]/, '')
    .replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[/_]?/i, '')
    .replace(/^galeria_\d+_/, '')
    .replace(/[_-]/g, ' ')
    .trim()

  // Si quedó muy corto o solo números, usar un título genérico
  if (!title || title.length < 3 || /^\d+$/.test(title)) {
    title = `Imagen de galería ${Date.now()}`
  }

  // Capitalizar primera letra de cada palabra
  return title.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

async function syncGaleriaImages () {
  try {
    console.log('🔄 Iniciando sincronización de imágenes de galería...')

    // Conectar a MongoDB
    await mongoose.connect(process.env.DB_URL)
    console.log('✅ Conectado a MongoDB')

    // Importar modelo de Galeria
    const Galeria = mongoose.model('Galeria', new mongoose.Schema({
      titulo: { type: String, required: true },
      descripcion: { type: String },
      imagen: { type: String, required: true },
      categoria: {
        type: String,
        required: true,
        enum: ['eventos', 'instalaciones', 'actividades', 'profesores', 'estudiantes', 'otros'],
        default: 'otros'
      },
      tags: { type: [String], default: [] },
      activo: { type: Boolean, default: true },
      orden: { type: Number, default: 0 },
      cols: { type: Number, default: 1, min: 1, max: 4 },
      rows: { type: Number, default: 1, min: 1, max: 4 },
      usuario: { type: String, required: true }
    }, {
      timestamps: true,
      versionKey: false,
      collection: 'galeria'
    }))

    // Buckets a procesar (priorizar galeria-imagenes)
    const bucketsToProcess = [
      { name: 'galeria-imagenes', priority: 1 },
      { name: 'imagenes-publicas', priority: 2 }
    ]

    let totalProcessed = 0
    let totalCreated = 0
    let orden = 0

    for (const bucket of bucketsToProcess) {
      console.log(`\n📦 Procesando bucket: ${bucket.name}`)
      console.log('='.repeat(50))

      try {
        const bucketExists = await minioClient.bucketExists(bucket.name)
        if (!bucketExists) {
          console.log(`❌ Bucket ${bucket.name} no existe`)
          continue
        }

        const files = []
        const stream = minioClient.listObjects(bucket.name, '', true)

        await new Promise((resolve, reject) => {
          stream.on('data', obj => files.push(obj))
          stream.on('end', resolve)
          stream.on('error', reject)
        })

        console.log(`📊 Archivos encontrados: ${files.length}`)

        for (const file of files) {
          try {
            totalProcessed++

            // Solo procesar archivos de imagen
            if (!/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name)) {
              console.log(`⏭️  Saltando archivo no imagen: ${file.name}`)
              continue
            }

            // Construir URL de la imagen
            const imageUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket.name}/${file.name}`

            // Verificar si ya existe una imagen con esta URL
            const existingImage = await Galeria.findOne({ imagen: imageUrl })
            if (existingImage) {
              console.log(`⏭️  Ya existe: ${file.name}`)
              continue
            }

            // Generar datos para la imagen
            const titulo = generateTitle(file.name)
            const categoria = categorizeImage(file.name)

            // Crear registro en la base de datos
            const nuevaImagen = new Galeria({
              titulo,
              descripcion: `Imagen importada automáticamente desde ${bucket.name}`,
              imagen: imageUrl,
              categoria,
              tags: ['importado', 'galeria'],
              activo: true,
              orden: orden++,
              cols: 1,
              rows: 1,
              usuario: 'sistema-migracion'
            })

            await nuevaImagen.save()
            totalCreated++

            console.log(`✅ Creado: ${titulo} (${categoria})`)
          } catch (fileError) {
            console.error(`❌ Error procesando ${file.name}:`, fileError.message)
          }
        }
      } catch (bucketError) {
        console.error(`❌ Error procesando bucket ${bucket.name}:`, bucketError.message)
      }
    }

    console.log('\n📊 RESUMEN DE SINCRONIZACIÓN')
    console.log('='.repeat(50))
    console.log(`📁 Archivos procesados: ${totalProcessed}`)
    console.log(`✅ Registros creados: ${totalCreated}`)
    console.log(`⏭️  Registros existentes: ${totalProcessed - totalCreated}`)

    // Verificar estado final
    const totalEnBD = await Galeria.countDocuments()
    console.log(`📊 Total en base de datos: ${totalEnBD}`)

    if (totalCreated > 0) {
      console.log('\n🎉 Sincronización completada exitosamente!')
      console.log('💡 Las imágenes ahora deberían aparecer en la gestión de galería')
    } else {
      console.log('\n💡 No se crearon nuevos registros (posiblemente ya estaban sincronizados)')
    }
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message)
    console.error(error.stack)
  } finally {
    await mongoose.disconnect()
    console.log('📴 Desconectado de MongoDB')
  }
}

// Ejecutar el script
syncGaleriaImages()
