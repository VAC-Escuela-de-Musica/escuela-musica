'use strict'
import { model } from 'mongoose'
import alumnoSchema from '../schemas/alumnos.schema.js'

// Exportar el modelo de datos 'Alumno'
export default model('Alumno', alumnoSchema)
