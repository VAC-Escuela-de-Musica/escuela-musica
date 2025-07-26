const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DB_URL || 'mongodb://gcadin:gcadin1230@146.83.198.35:1232/admin';

// Definir el esquema de profesores
const profesoresSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede superar los 50 caracteres'],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
      'El nombre solo puede contener letras y espacios'
    ]
  },
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true,
    minlength: [2, 'Los apellidos deben tener al menos 2 caracteres'],
    maxlength: [100, 'Los apellidos no pueden superar los 100 caracteres'],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/,
      'Los apellidos solo pueden contener letras y espacios'
    ]
  },
  rut: {
    type: String,
    required: [true, 'El RUT es obligatorio'],
    unique: true,
    trim: true,
    match: [
      /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/,
      'El RUT debe tener el formato 12.345.678-9'
    ]
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'El email no es válido'
    ]
  },
  numero: {
    type: String,
    required: [true, 'El número de teléfono es obligatorio'],
    trim: true,
    match: [
      /^\+?\d{9,15}$/,
      'El teléfono debe contener solo números y puede iniciar con +'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  sueldo: {
    type: Number,
    required: [true, 'El sueldo es obligatorio'],
    min: [0, 'El sueldo no puede ser negativo']
  },
  fechaContrato: {
    type: Date,
    required: [true, 'La fecha de contrato es obligatoria'],
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  },
  roles: {
    type: [String],
    default: ['profesor'],
    enum: ['profesor']
  }
}, {
  timestamps: true,
  versionKey: false
});

async function testMongoDBProfesores() {
  console.log('🔍 [MONGODB] Verificando colección de profesores...');
  console.log('🔍 [MONGODB] URL:', DB_URL);
  
  try {
    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ [MONGODB] Conexión exitosa a MongoDB');
    
    // Crear el modelo
    const Profesor = mongoose.model('Profesor', profesoresSchema);
    console.log('✅ [MONGODB] Modelo de Profesor creado');
    
    // Listar todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('🔍 [MONGODB] Colecciones existentes:', collections.map(c => c.name));
    
    // Verificar si existe la colección de profesores
    const profesoresCollection = collections.find(c => c.name === 'profesores');
    console.log('🔍 [MONGODB] ¿Existe colección profesores?', !!profesoresCollection);
    
    // Intentar crear un profesor de prueba
    console.log('🔍 [MONGODB] Intentando crear profesor de prueba...');
    const profesorTest = new Profesor({
      nombre: 'Profesor',
      apellidos: 'Prueba',
      rut: '12.345.678-9',
      email: 'profesor@email.com',
      numero: '+56962774850',
      password: '123456',
      sueldo: 500000,
      fechaContrato: new Date()
    });
    
    const profesorGuardado = await profesorTest.save();
    console.log('✅ [MONGODB] Profesor creado exitosamente:', profesorGuardado._id);
    
    // Verificar que se creó la colección
    const collectionsAfter = await mongoose.connection.db.listCollections().toArray();
    console.log('🔍 [MONGODB] Colecciones después de crear profesor:', collectionsAfter.map(c => c.name));
    
    // Contar profesores
    const count = await Profesor.countDocuments();
    console.log('✅ [MONGODB] Total de profesores en BD:', count);
    
    // Eliminar el profesor de prueba
    await Profesor.findByIdAndDelete(profesorGuardado._id);
    console.log('✅ [MONGODB] Profesor de prueba eliminado');
    
  } catch (error) {
    console.error('❌ [MONGODB] Error:', error.message);
    console.error('❌ [MONGODB] Stack:', error.stack);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔍 [MONGODB] Conexión cerrada');
  }
}

// Ejecutar la prueba
testMongoDBProfesores(); 