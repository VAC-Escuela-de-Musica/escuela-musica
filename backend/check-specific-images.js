import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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

async function testImageUrl(url, description) {
  try {
    console.log(`🔍 Probando: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, { 
      method: 'HEAD', 
      timeout: 10000 
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
      'server': response.headers.get('server')
    });
    
    return {
      url,
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      url,
      accessible: false,
      error: error.message
    };
  }
}

async function checkSpecificImages() {
  try {
    console.log('🔍 Verificando imágenes específicas problemáticas...');
    console.log(`📊 Conectando a: ${DB_URL}`);

    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');

    // Buscar las imágenes específicas mencionadas en los logs del frontend
    const specificImageIds = [
      '68849488d7e2c69485da5694',
      '68849236d7e2c69485da5675'
    ];

    console.log('\n📋 Buscando imágenes específicas:');
    for (const id of specificImageIds) {
      const image = await Galeria.findById(id);
      if (image) {
        console.log(`\n📸 Imagen ID: ${id}`);
        console.log(`   - Título: ${image.titulo || 'Sin título'}`);
        console.log(`   - URL actual: ${image.imagen}`);
        console.log(`   - Bucket: ${image.bucket || 'no especificado'}`);
        console.log(`   - Activo: ${image.activo}`);
        console.log(`   - Cols: ${image.cols}, Rows: ${image.rows}`);
        
        // Probar la URL actual
        await testImageUrl(image.imagen, 'URL actual de la imagen');
        console.log('');
      } else {
        console.log(`❌ Imagen con ID ${id} no encontrada`);
      }
    }

    // Verificar todas las imágenes activas
    const activeImages = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    console.log(`\n📊 Total de imágenes activas: ${activeImages.length}`);
    
    console.log('\n📋 Primeras 10 imágenes activas:');
    activeImages.slice(0, 10).forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.titulo || 'Sin título'} (ID: ${img._id})`);
      console.log(`     - URL: ${img.imagen}`);
      console.log(`     - Bucket: ${img.bucket || 'no especificado'}`);
      console.log(`     - Cols: ${img.cols}, Rows: ${img.rows}`);
    });

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
checkSpecificImages().catch(console.error); 