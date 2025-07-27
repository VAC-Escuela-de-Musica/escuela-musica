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

async function migrateSpecificImage() {
  try {
    console.log('🔄 Iniciando migración de imagen específica...');
    
    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar la imagen específica por su URL
    const specificImageUrl = 'http://146.83.198.35:1254/galeria-imagenes/galeria_1753520879838_87s8s68fn';
    
    const image = await Galeria.findOne({ imagen: specificImageUrl });
    
    if (!image) {
      console.log('❌ No se encontró la imagen con la URL específica');
      console.log('🔍 Buscando imágenes en el bucket galeria-imagenes...');
      
      // Buscar todas las imágenes que contengan galeria-imagenes en la URL
      const imagesInPrivateBucket = await Galeria.find({
        imagen: { $regex: /galeria-imagenes/ }
      });
      
      console.log(`📊 Encontradas ${imagesInPrivateBucket.length} imágenes en bucket privado:`);
      imagesInPrivateBucket.forEach((img, index) => {
        console.log(`  ${index + 1}. ID: ${img._id}`);
        console.log(`     Título: ${img.titulo || 'Sin título'}`);
        console.log(`     URL: ${img.imagen}`);
        console.log(`     Activo: ${img.activo}`);
        console.log('');
      });
      
      return;
    }
    
    console.log('✅ Imagen encontrada:', {
      id: image._id,
      titulo: image.titulo || 'Sin título',
      url: image.imagen,
      bucket: image.bucket,
      bucketTipo: image.bucketTipo,
      activo: image.activo
    });
    
    // Extraer el nombre del archivo de la URL
    const fileName = image.imagen.split('galeria-imagenes/')[1];
    
    // Generar nueva URL con el bucket público
    const newUrl = `http://146.83.198.35:1254/imagenes-publicas/${fileName}`;
    
    console.log('🔄 Migrando imagen...');
    console.log(`   - URL anterior: ${image.imagen}`);
    console.log(`   - URL nueva: ${newUrl}`);
    console.log(`   - Archivo: ${fileName}`);
    
    // Actualizar la imagen en la base de datos
    await Galeria.findByIdAndUpdate(image._id, {
      imagen: newUrl,
      bucket: 'imagenes-publicas',
      bucketTipo: 'publico',
      fechaActualizacion: new Date()
    });
    
    console.log('✅ Imagen migrada exitosamente');
    
    // Verificar el resultado
    const updatedImage = await Galeria.findById(image._id);
    console.log('📊 Verificación final:', {
      id: updatedImage._id,
      titulo: updatedImage.titulo || 'Sin título',
      url: updatedImage.imagen,
      bucket: updatedImage.bucket,
      bucketTipo: updatedImage.bucketTipo,
      activo: updatedImage.activo
    });
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar la migración
migrateSpecificImage(); 