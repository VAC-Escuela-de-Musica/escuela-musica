import mongoose from 'mongoose';
import Alumno from './src/core/models/alumnos.model.js';
import { setupDB } from './src/core/config/configDB.js';

async function fixAlumnosPasswords() {
  try {
    console.log('🔧 [FIX-PASSWORDS] Iniciando reparación de contraseñas de alumnos...');
    
    // Conectar a la base de datos
    await setupDB();
    console.log('✅ [FIX-PASSWORDS] Conexión a MongoDB exitosa');
    
    // Buscar alumnos sin contraseña
    const alumnosSinPassword = await Alumno.find({ password: { $exists: false } }).select('email nombreAlumno');
    const alumnosConPasswordVacio = await Alumno.find({ password: null }).select('email nombreAlumno');
    const alumnosConPasswordVacioString = await Alumno.find({ password: '' }).select('email nombreAlumno');
    
    const todosLosAlumnosSinPassword = [
      ...alumnosSinPassword,
      ...alumnosConPasswordVacio,
      ...alumnosConPasswordVacioString
    ];
    
    console.log(`🔍 [FIX-PASSWORDS] Encontrados ${todosLosAlumnosSinPassword.length} alumnos sin contraseña`);
    
    if (todosLosAlumnosSinPassword.length === 0) {
      console.log('✅ [FIX-PASSWORDS] Todos los alumnos ya tienen contraseña');
      return;
    }
    
    // Mostrar alumnos que necesitan contraseña
    todosLosAlumnosSinPassword.forEach((alumno, index) => {
      console.log(`  ${index + 1}. ${alumno.email} - ${alumno.nombreAlumno}`);
    });
    
    // Generar contraseña por defecto
    const passwordPorDefecto = '123456';
    const passwordHasheada = await Alumno.encryptPassword(passwordPorDefecto);
    
    console.log(`\n🔧 [FIX-PASSWORDS] Estableciendo contraseña por defecto: ${passwordPorDefecto}`);
    
    // Actualizar cada alumno
    for (const alumno of todosLosAlumnosSinPassword) {
      try {
        await Alumno.findByIdAndUpdate(
          alumno._id,
          { password: passwordHasheada },
          { new: true }
        );
        console.log(`✅ [FIX-PASSWORDS] Contraseña actualizada para: ${alumno.email}`);
      } catch (error) {
        console.error(`❌ [FIX-PASSWORDS] Error actualizando ${alumno.email}:`, error.message);
      }
    }
    
    console.log(`\n🎉 [FIX-PASSWORDS] Proceso completado. Contraseña por defecto: ${passwordPorDefecto}`);
    console.log('📝 [FIX-PASSWORDS] Los alumnos pueden cambiar su contraseña después del primer login');
    
  } catch (error) {
    console.error('💥 [FIX-PASSWORDS] Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 [FIX-PASSWORDS] Conexión cerrada');
  }
}

fixAlumnosPasswords(); 