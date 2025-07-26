import { model } from 'mongoose'
import galeriaSchema from '../schemas/galeria.schema.js'

// Exportar el modelo de datos 'Galeria'
export default model('Galeria', galeriaSchema)
