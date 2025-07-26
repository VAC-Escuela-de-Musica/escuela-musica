import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión a MongoDB
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/escuela_musica';

// Esquema de Galería
const galeriaSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  imagen: { type: String, required: true },
  bucket: { type: String, default: 'imagenes-publicas' },
  bucketTipo: { type: String, enum: ['publico', 'privado'], default: 'publico' },
  orden: { type: Number, default: 0 },
  activo: { type: Boolean, default: true },
  usuario: { type: String, required: true },
  categoria: {
    type: String,
    enum: ['eventos', 'instalaciones', 'actividades', 'profesores', 'estudiantes', 'otros'],
    default: 'otros'
  },
  tags: [String],
  fechaCreacion: { type: Date, default: Date.now },
  fechaActualizacion: { type: Date, default: Date.now },
  cols: { type: Number, default: 1, min: 1, max: 4 },
  rows: { type: Number, default: 1, min: 1, max: 4 }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'galeria'
});

const Galeria = mongoose.model('Galeria', galeriaSchema);

// Función para actualizar imágenes
async function updateGaleriaColsRows() {
  try {
    console.log('🔧 Iniciando actualización de cols y rows en galería...');
    console.log(`📊 Conectando a: ${DB_URL}`);

    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');

    // Buscar imágenes que no tengan cols o rows definidos
    const imagesToUpdate = await Galeria.find({
      $or: [
        { cols: { $exists: false } },
        { rows: { $exists: false } },
        { cols: null },
        { rows: null }
      ]
    });

    console.log(`📸 Encontradas ${imagesToUpdate.length} imágenes que necesitan actualización`);

    if (imagesToUpdate.length === 0) {
      console.log('✅ Todas las imágenes ya tienen cols y rows definidos');
      return;
    }

    // Mostrar imágenes que se van a actualizar
    console.log('\n📋 Imágenes a actualizar:');
    imagesToUpdate.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'} (ID: ${img._id})`);
      console.log(`     - cols actual: ${img.cols || 'undefined'}`);
      console.log(`     - rows actual: ${img.rows || 'undefined'}`);
    });

    // Actualizar todas las imágenes con valores por defecto
    const updateResult = await Galeria.updateMany(
      {
        $or: [
          { cols: { $exists: false } },
          { rows: { $exists: false } },
          { cols: null },
          { rows: null }
        ]
      },
      {
        $set: {
          cols: 1,
          rows: 1,
          fechaActualizacion: new Date()
        }
      }
    );

    console.log(`\n✅ Actualización completada:`);
    console.log(`   - Imágenes modificadas: ${updateResult.modifiedCount}`);
    console.log(`   - Imágenes coincidentes: ${updateResult.matchedCount}`);

    // Verificar el resultado
    const updatedImages = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    console.log(`\n📊 Verificación final: ${updatedImages.length} imágenes activas`);
    
    console.log('\n📋 Estado final de las primeras 5 imágenes:');
    updatedImages.slice(0, 5).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'}`);
      console.log(`     - cols: ${img.cols}`);
      console.log(`     - rows: ${img.rows}`);
    });

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
updateGaleriaColsRows().catch(console.error); 