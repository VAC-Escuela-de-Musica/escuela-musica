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

async function updateUrlsToPublicBucket() {
  try {
    console.log('🔄 Actualizando URLs al bucket público...');
    
    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar imágenes que necesitan actualización
    const imagesToUpdate = await Galeria.find({
      $or: [
        { imagen: { $regex: /materiales-publicos/ } },
        { imagen: { $regex: /galeria-imagenes/ } }
      ]
    });
    
    console.log(`📊 Encontradas ${imagesToUpdate.length} imágenes que necesitan actualización:`);
    
    if (imagesToUpdate.length === 0) {
      console.log('✅ No hay imágenes que necesiten actualización');
      return;
    }
    
    let updatedCount = 0;
    
    for (const image of imagesToUpdate) {
      try {
        console.log(`\n🔄 Actualizando: ${image.titulo || 'Sin título'} (ID: ${image._id})`);
        console.log(`   - URL actual: ${image.imagen}`);
        
        let fileName = '';
        let newUrl = '';
        
        // Extraer el nombre del archivo según el bucket
        if (image.imagen.includes('materiales-publicos/')) {
          fileName = image.imagen.split('materiales-publicos/')[1];
          newUrl = `http://146.83.198.35:1254/imagenes-publicas/${fileName}`;
        } else if (image.imagen.includes('galeria-imagenes/')) {
          fileName = image.imagen.split('galeria-imagenes/')[1];
          newUrl = `http://146.83.198.35:1254/imagenes-publicas/${fileName}`;
        } else {
          console.log(`   ⚠️  URL no reconocida, saltando`);
          continue;
        }
        
        console.log(`   - Archivo: ${fileName}`);
        console.log(`   - Nueva URL: ${newUrl}`);
        
        // Actualizar la imagen en la base de datos
        await Galeria.findByIdAndUpdate(image._id, {
          imagen: newUrl,
          bucket: 'imagenes-publicas',
          bucketTipo: 'publico',
          fechaActualizacion: new Date()
        });
        
        console.log(`   ✅ Actualizada exitosamente`);
        updatedCount++;
        
      } catch (error) {
        console.error(`   ❌ Error actualizando imagen ${image._id}:`, error.message);
      }
    }
    
    console.log(`\n📊 Resumen de actualización:`);
    console.log(`   - Imágenes procesadas: ${imagesToUpdate.length}`);
    console.log(`   - Imágenes actualizadas: ${updatedCount}`);
    console.log(`   - Errores: ${imagesToUpdate.length - updatedCount}`);
    
    // Verificar el resultado
    const updatedImages = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    console.log(`\n📊 Verificación final: ${updatedImages.length} imágenes activas`);
    
    console.log('\n📋 URLs finales de las primeras 10 imágenes:');
    updatedImages.slice(0, 10).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'}: ${img.imagen}`);
    });
    
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la actualización
updateUrlsToPublicBucket(); 