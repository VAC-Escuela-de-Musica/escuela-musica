// Script para verificar conexión a MongoDB y modelo de profesores
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://gcadin:gcadin1230@146.83.198.35:1232/admin';

async function testMongoDBConnection() {
  console.log('🔍 [MONGODB] Verificando conexión a MongoDB...');
  console.log('🔍 [MONGODB] URL:', DB_URL);
  
  try {
    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ [MONGODB] Conexión exitosa a MongoDB');
    
    // Verificar que la conexión esté activa
    console.log('🔍 [MONGODB] Estado de conexión:', mongoose.connection.readyState);
    console.log('🔍 [MONGODB] Base de datos:', mongoose.connection.name);
    
    // Listar las colecciones existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('🔍 [MONGODB] Colecciones existentes:', collections.map(c => c.name));
    
    // Verificar si existe la colección de profesores
    const profesoresCollection = collections.find(c => c.name === 'profesores');
    console.log('🔍 [MONGODB] ¿Existe colección profesores?', !!profesoresCollection);
    
    // Intentar importar el modelo de profesores
    console.log('🔍 [MONGODB] Intentando importar modelo de profesores...');
    const Profesor = (await import('../backend/src/core/models/profesores.model.js')).default;
    console.log('✅ [MONGODB] Modelo de profesores importado correctamente');
    
    // Verificar que el modelo esté registrado
    console.log('🔍 [MONGODB] Modelos registrados:', Object.keys(mongoose.models));
    
    // Intentar hacer una consulta simple
    console.log('🔍 [MONGODB] Intentando consulta simple...');
    const count = await Profesor.countDocuments();
    console.log('✅ [MONGODB] Consulta exitosa. Profesores en BD:', count);
    
    // Verificar índices
    console.log('🔍 [MONGODB] Verificando índices...');
    const indexes = await Profesor.collection.indexes();
    console.log('🔍 [MONGODB] Índices de la colección profesores:', indexes.map(i => i.name));
    
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
testMongoDBConnection(); 