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

// Función para migrar imágenes
async function migrateGaleriaImages() {
  try {
    console.log('🔧 Iniciando migración de imágenes de galería...');
    console.log(`📊 Conectando a: ${DB_URL}`);

    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');

    // Buscar imágenes que están en el bucket galeria-imagenes
    const imagesToMigrate = await Galeria.find({
      $or: [
        { imagen: { $regex: /galeria-imagenes/ } },
        { bucket: 'galeria-imagenes' }
      ]
    });

    console.log(`📸 Encontradas ${imagesToMigrate.length} imágenes para migrar`);

    if (imagesToMigrate.length === 0) {
      console.log('✅ No hay imágenes que necesiten migración');
      return;
    }

    // Mostrar imágenes que se van a migrar
    console.log('\n📋 Imágenes a migrar:');
    imagesToMigrate.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'} (ID: ${img._id})`);
      console.log(`     - URL actual: ${img.imagen}`);
      console.log(`     - Bucket actual: ${img.bucket || 'no especificado'}`);
    });

    // Migrar cada imagen
    let migratedCount = 0;
    for (const image of imagesToMigrate) {
      try {
        // Extraer el nombre del archivo de la URL actual
        const currentUrl = image.imagen;
        let fileName = '';
        
        if (currentUrl.includes('galeria-imagenes/')) {
          fileName = currentUrl.split('galeria-imagenes/')[1];
        } else if (currentUrl.includes('/')) {
          fileName = currentUrl.split('/').pop();
        } else {
          fileName = currentUrl;
        }

        // Generar nueva URL con el bucket público
        const newUrl = `http://146.83.198.35:1254/imagenes-publicas/galeria/${fileName}`;
        
        console.log(`\n🔄 Migrando imagen: ${image.titulo || 'Sin título'}`);
        console.log(`   - URL anterior: ${currentUrl}`);
        console.log(`   - URL nueva: ${newUrl}`);
        console.log(`   - Archivo: ${fileName}`);

        // Actualizar la imagen en la base de datos
        await Galeria.findByIdAndUpdate(image._id, {
          imagen: newUrl,
          bucket: 'imagenes-publicas',
          bucketTipo: 'publico',
          fechaActualizacion: new Date()
        });

        console.log(`   ✅ Migrada exitosamente`);
        migratedCount++;

      } catch (error) {
        console.error(`   ❌ Error migrando imagen ${image._id}:`, error.message);
      }
    }

    console.log(`\n📊 Resumen de migración:`);
    console.log(`   - Imágenes procesadas: ${imagesToMigrate.length}`);
    console.log(`   - Imágenes migradas: ${migratedCount}`);
    console.log(`   - Errores: ${imagesToMigrate.length - migratedCount}`);

    // Verificar el resultado
    const updatedImages = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    console.log(`\n📊 Verificación final: ${updatedImages.length} imágenes activas`);
    
    console.log('\n📋 URLs finales de las primeras 5 imágenes:');
    updatedImages.slice(0, 5).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'}`);
      console.log(`     - URL: ${img.imagen}`);
      console.log(`     - Bucket: ${img.bucket || 'no especificado'}`);
    });

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
migrateGaleriaImages().catch(console.error); 