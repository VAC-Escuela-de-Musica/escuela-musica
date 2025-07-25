import mongoose from 'mongoose'
import { DB_URL } from './src/config/configEnv.js'
import CardsProfesores from './src/features/website-content/models/cardsProfesores.model.js'

// Conectar a la base de datos
await mongoose.connect(DB_URL)

// Datos de ejemplo
const sampleCards = [
  {
    nombre: 'María González',
    especialidad: 'Piano',
    descripcion: 'Profesora con más de 10 años de experiencia en piano clásico y contemporáneo.',
    imagen: 'https://via.placeholder.com/300x400?text=Maria+Gonzalez',
    activo: true,
    orden: 1
  },
  {
    nombre: 'Carlos Ruiz',
    especialidad: 'Guitarra',
    descripcion: 'Especialista en guitarra acústica y eléctrica, con formación en jazz y rock.',
    imagen: 'https://via.placeholder.com/300x400?text=Carlos+Ruiz',
    activo: true,
    orden: 2
  },
  {
    nombre: 'Ana López',
    especialidad: 'Violín',
    descripcion: 'Violinista profesional con estudios en conservatorio internacional.',
    imagen: 'https://via.placeholder.com/300x400?text=Ana+Lopez',
    activo: true,
    orden: 3
  }
]

try {
  // Limpiar datos existentes
  await CardsProfesores.deleteMany({})

  // Insertar datos de ejemplo
  await CardsProfesores.insertMany(sampleCards)

  console.log('✅ Datos de ejemplo creados exitosamente')
  console.log(`📊 Se crearon ${sampleCards.length} cards de profesores`)
} catch (error) {
  console.error('❌ Error creando datos de ejemplo:', error)
} finally {
  await mongoose.disconnect()
}
