const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión a MongoDB
const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/escuela_musica';

// Configuración de MinIO
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || '146.83.198.35';
const MINIO_PORT = process.env.MINIO_PORT || '9000';
const MINIO_PUBLIC_BUCKET = process.env.MINIO_PUBLIC_BUCKET || 'imagenes-publicas';

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

// Función para verificar si una URL es accesible
async function checkImageUrl(url) {
  try {
    console.log(`🔍 Verificando URL: ${url}`);
    const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
    const isAccessible = response.ok;
    console.log(`  ✅ Status: ${response.status} - ${isAccessible ? 'ACCESIBLE' : 'NO ACCESIBLE'}`);
    return {
      url,
      accessible: isAccessible,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return {
      url,
      accessible: false,
      error: error.message
    };
  }
}

// Función para generar URL pública
function generatePublicUrl(filename) {
  return `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_PUBLIC_BUCKET}/${filename}`;
}

// Función principal
async function checkGaleriaImages() {
  try {
    console.log('🔍 Iniciando verificación de imágenes de galería...');
    console.log('📊 Configuración:');
    console.log(`  - DB_URL: ${DB_URL}`);
    console.log(`  - MINIO_ENDPOINT: ${MINIO_ENDPOINT}`);
    console.log(`  - MINIO_PORT: ${MINIO_PORT}`);
    console.log(`  - MINIO_PUBLIC_BUCKET: ${MINIO_PUBLIC_BUCKET}`);

    // Conectar a MongoDB
    await mongoose.connect(DB_URL);
    console.log('✅ Conectado a MongoDB');

    // Obtener todas las imágenes activas
    const galeria = await Galeria.find({ activo: true }).sort({ orden: 1, fechaCreacion: -1 });
    console.log(`📸 Encontradas ${galeria.length} imágenes activas en la base de datos`);

    if (galeria.length === 0) {
      console.log('⚠️ No hay imágenes activas en la galería');
      return;
    }

    // Analizar cada imagen
    const results = [];
    for (let i = 0; i < galeria.length; i++) {
      const item = galeria[i];
      console.log(`\n📸 Imagen ${i + 1}/${galeria.length}:`);
      console.log(`  - ID: ${item._id}`);
      console.log(`  - Título: ${item.titulo || 'Sin título'}`);
      console.log(`  - URL original: ${item.imagen}`);
      console.log(`  - Activo: ${item.activo}`);
      console.log(`  - Categoría: ${item.categoria}`);
      console.log(`  - Cols: ${item.cols}, Rows: ${item.rows}`);

      let finalUrl = item.imagen;
      
      // Si no es una URL completa, generar URL pública
      if (!item.imagen.startsWith('http://') && !item.imagen.startsWith('https://')) {
        finalUrl = generatePublicUrl(item.imagen);
        console.log(`  - URL generada: ${finalUrl}`);
      }

      // Verificar accesibilidad
      const urlCheck = await checkImageUrl(finalUrl);
      
      results.push({
        id: item._id,
        titulo: item.titulo,
        originalUrl: item.imagen,
        finalUrl: finalUrl,
        accessible: urlCheck.accessible,
        status: urlCheck.status,
        error: urlCheck.error,
        categoria: item.categoria,
        activo: item.activo,
        cols: item.cols,
        rows: item.rows
      });
    }

    // Resumen
    console.log('\n📊 RESUMEN:');
    const accessible = results.filter(r => r.accessible);
    const notAccessible = results.filter(r => !r.accessible);
    
    console.log(`✅ Imágenes accesibles: ${accessible.length}/${results.length}`);
    console.log(`❌ Imágenes no accesibles: ${notAccessible.length}/${results.length}`);

    if (notAccessible.length > 0) {
      console.log('\n❌ IMÁGENES CON PROBLEMAS:');
      notAccessible.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.titulo || 'Sin título'} (ID: ${item.id})`);
        console.log(`     URL: ${item.finalUrl}`);
        console.log(`     Error: ${item.error || `Status: ${item.status}`}`);
      });
    }

    // Verificar configuración de MinIO
    console.log('\n🔧 VERIFICACIÓN DE CONFIGURACIÓN MINIO:');
    const testUrl = `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_PUBLIC_BUCKET}/`;
    console.log(`Probando acceso a bucket: ${testUrl}`);
    
    try {
      const bucketResponse = await fetch(testUrl, { method: 'HEAD', timeout: 5000 });
      console.log(`Bucket accesible: ${bucketResponse.ok ? '✅ SÍ' : '❌ NO'} (Status: ${bucketResponse.status})`);
    } catch (error) {
      console.log(`❌ Error accediendo al bucket: ${error.message}`);
    }

    // Verificar API del backend
    console.log('\n🔧 VERIFICACIÓN DE API BACKEND:');
    const apiUrl = 'http://146.83.198.35:1230/api/galeria/active';
    console.log(`Probando API: ${apiUrl}`);
    
    try {
      const apiResponse = await fetch(apiUrl);
      console.log(`API accesible: ${apiResponse.ok ? '✅ SÍ' : '❌ NO'} (Status: ${apiResponse.status})`);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log(`Datos de API: ${apiData.data ? apiData.data.length : 0} imágenes`);
      }
    } catch (error) {
      console.log(`❌ Error accediendo a la API: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
checkGaleriaImages().catch(console.error); 