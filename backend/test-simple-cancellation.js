import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './src/features/communication/services/notification.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';

// Cargar variables de entorno
dotenv.config();

async function testSimpleCancellation() {
  try {
    console.log('🧪 Iniciando prueba simple de cancelación...\n');

    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión a MongoDB establecida\n');

    // Buscar una clase con estudiantes
    console.log('🔍 Buscando clase con estudiantes...');
    const clase = await Clase.findOne({
      estado: 'programada',
      'estudiantes.0': { $exists: true }
    }).populate('estudiantes.alumno', 'nombreAlumno rutAlumno email telefono');

    if (!clase) {
      console.log('❌ No se encontró ninguna clase con estudiantes asignados');
      return;
    }

    console.log(`✅ Clase encontrada: ${clase.titulo}`);
    console.log(`👥 Estudiantes: ${clase.estudiantes.length}`);
    clase.estudiantes.forEach(est => {
      console.log(`   - ${est.alumno?.nombreAlumno} (${est.alumno?.rutAlumno})`);
    });

    // Buscar un usuario para simular quién cancela la clase
    console.log('\n🔍 Buscando usuario...');
    const adminUser = await User.findOne();
    if (adminUser) {
      console.log(`✅ Usuario encontrado: ${adminUser.username || adminUser.email}`);
    }

    // Simular cancelación de clase
    console.log('\n🚫 Simulando cancelación de clase...');
    const motivo = 'Prueba del sistema de notificaciones';
    
    const resultado = await notificationService.notifyClassCancellation(
      clase, 
      motivo, 
      adminUser?._id
    );

    if (resultado.success) {
      console.log('✅ Notificaciones enviadas correctamente');
      console.log('\n📊 Resumen de envíos:');
      console.log(`   • Mensajes internos: ${resultado.results.internos.enviados}/${clase.estudiantes.length}`);
      console.log(`   • WhatsApp: ${resultado.results.whatsapp.enviados}/${clase.estudiantes.length}`);
      console.log(`   • Email: ${resultado.results.email.enviados}/${clase.estudiantes.length}`);
      console.log(`   • Errores totales: ${resultado.results.internos.errores + resultado.results.whatsapp.errores + resultado.results.email.errores}`);
    } else {
      console.log('❌ Error enviando notificaciones:', resultado.error);
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar la prueba
testSimpleCancellation(); 