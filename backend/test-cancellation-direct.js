import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './src/features/communication/services/notification.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';

// Cargar variables de entorno
dotenv.config();

async function testCancellationDirect() {
  try {
    console.log('🧪 Iniciando prueba directa de cancelación...\n');

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
    
    console.log('🔔 Llamando a notifyClassCancellation...');
    const resultado = await notificationService.notifyClassCancellation(
      clase, 
      motivo, 
      adminUser?._id
    );

    console.log('📊 Resultado recibido:', resultado);

    if (resultado && resultado.success) {
      console.log('✅ Notificaciones enviadas correctamente');
      if (resultado.results) {
        console.log('\n📊 Resumen de envíos:');
        console.log(`   • Mensajes internos: ${resultado.results.internos?.enviados || 0}/${clase.estudiantes.length}`);
        console.log(`   • WhatsApp: ${resultado.results.whatsapp?.enviados || 0}/${clase.estudiantes.length}`);
        console.log(`   • Email: ${resultado.results.email?.enviados || 0}/${clase.estudiantes.length}`);
        console.log(`   • Errores totales: ${(resultado.results.internos?.errores || 0) + (resultado.results.whatsapp?.errores || 0) + (resultado.results.email?.errores || 0)}`);
      }
    } else {
      console.log('❌ Error enviando notificaciones:', resultado?.error || 'Error desconocido');
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
testCancellationDirect(); 