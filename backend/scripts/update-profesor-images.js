import mongoose from 'mongoose'
import CardsProfesores from '../src/core/models/cardsProfesores.model.js'
import { config } from '../src/core/config/index.js'

// Conectar a la base de datos
async function connectDB () {
  try {
    await mongoose.connect(config.database.url)
    console.log('✅ Conectado a MongoDB')
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

// Imágenes locales de reemplazo
const localImages = {
  'María González': '/maria.png',
  'Carlos Rodríguez': '/imagenprueba.jpg',
  'Ana Martínez': '/maria.png',
  'Luis Fernández': '/imagenprueba.jpg'
}

// Función para actualizar las imágenes
async function updateProfessorImages () {
  try {
    console.log('🔄 Actualizando imágenes de profesores...')

    const profesores = await CardsProfesores.find({})

    for (const profesor of profesores) {
      const newImage = localImages[profesor.nombre] || '/imagenprueba.jpg'

      await CardsProfesores.findByIdAndUpdate(
        profesor._id,
        { imagen: newImage },
        { new: true }
      )

      console.log(`✅ Actualizado ${profesor.nombre}: ${newImage}`)
    }

    console.log('🎉 Todas las imágenes han sido actualizadas')
  } catch (error) {
    console.error('❌ Error actualizando imágenes:', error)
  }
}

// Ejecutar el script
async function main () {
  await connectDB()
  await updateProfessorImages()
  await mongoose.disconnect()
  console.log('👋 Desconectado de MongoDB')
}

main().catch(console.error)
