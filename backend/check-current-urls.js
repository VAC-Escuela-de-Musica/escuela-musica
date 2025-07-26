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

async function checkCurrentUrls() {
  try {
    console.log('🔍 Verificando URLs actuales en la base de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener todas las imágenes activas
    const images = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    
    console.log(`📊 Encontradas ${images.length} imágenes activas:`);
    
    for (const image of images) {
      console.log(`\n📸 ${image.titulo || 'Sin título'} (ID: ${image._id})`);
      console.log(`   - URL: ${image.imagen}`);
      console.log(`   - Bucket: ${image.bucket}`);
      console.log(`   - Tipo: ${image.bucketTipo}`);
      console.log(`   - Activo: ${image.activo}`);
      
      // Verificar si la URL contiene buckets privados
      if (image.imagen.includes('materiales-publicos') || image.imagen.includes('galeria-imagenes')) {
        console.log(`   ⚠️  ATENCIÓN: Esta imagen apunta a un bucket privado`);
      } else if (image.imagen.includes('imagenes-publicas')) {
        console.log(`   ✅ Esta imagen apunta al bucket público`);
      } else {
        console.log(`   ❓ URL no reconocida`);
      }
    }
    
    // Contar imágenes por tipo de bucket
    const bucketCounts = {};
    images.forEach(img => {
      if (img.imagen.includes('materiales-publicos')) {
        bucketCounts['materiales-publicos'] = (bucketCounts['materiales-publicos'] || 0) + 1;
      } else if (img.imagen.includes('galeria-imagenes')) {
        bucketCounts['galeria-imagenes'] = (bucketCounts['galeria-imagenes'] || 0) + 1;
      } else if (img.imagen.includes('imagenes-publicas')) {
        bucketCounts['imagenes-publicas'] = (bucketCounts['imagenes-publicas'] || 0) + 1;
      } else {
        bucketCounts['otros'] = (bucketCounts['otros'] || 0) + 1;
      }
    });
    
    console.log('\n📊 Resumen por bucket:');
    Object.entries(bucketCounts).forEach(([bucket, count]) => {
      console.log(`   - ${bucket}: ${count} imágenes`);
    });
    
  } catch (error) {
    console.error('❌ Error verificando URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la verificación
checkCurrentUrls(); 