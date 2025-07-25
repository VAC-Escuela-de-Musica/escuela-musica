import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('DB_URL:', process.env.DB_URL ? 'Definida' : 'No definida');

mongoose.connect(process.env.DB_URL).then(async () => {
  const db = mongoose.connection.db;
  
  // Buscar imágenes con bucket imagenes-publicas
  const galeriasPublicas = await db.collection('galerias').find({
    imagen: { $regex: 'imagenes-publicas' }
  }).toArray();
  
  console.log('Imágenes con bucket imagenes-publicas:', galeriasPublicas.length);
  
  if (galeriasPublicas.length > 0) {
    console.log('\nEjemplos:');
    galeriasPublicas.slice(0, 3).forEach((img, i) => {
      console.log(`${i + 1}. ID: ${img._id}`);
      console.log(`   URL: ${img.imagen}`);
      console.log(`   Título: ${img.titulo}`);
    });
  }
  
  // Buscar imágenes con bucket galeria-imagenes
  const galeriasGaleria = await db.collection('galerias').find({
    imagen: { $regex: 'galeria-imagenes' }
  }).toArray();
  
  console.log('\nImágenes con bucket galeria-imagenes:', galeriasGaleria.length);
  
  mongoose.disconnect();
}).catch(console.error);