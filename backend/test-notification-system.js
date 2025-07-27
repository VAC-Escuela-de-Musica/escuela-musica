import dotenv from 'dotenv';
import mongoose from 'mongoose';
import notificationService from './src/features/communication/services/notification.service.js';
import Clase from './src/features/clases-management/models/clase.entity.js';
import User from './src/core/models/user.model.js';
import Alumno from './src/core/models/alumnos.model.js';
import Role from './src/core/models/role.model.js';

// Cargar variables de entorno
dotenv.config();

async function testNotificationSystem() {
  try {
    console.log('🧪 Iniciando prueba del sistema de notificaciones...\n');

    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Conexión a MongoDB establecida\n');

    // Buscar una clase con estudiantes y profesor
    console.log('🔍 Buscando clase con estudiantes y profesor...');
    const clase = await Clase.findOne({
      estado: 'programada',
      'estudiantes.0': { $exists: true },
      profesor: { $exists: true, $ne: null }
    }).populate('estudiantes.alumno', 'nombreAlumno rutAlumno email telefono')
      .populate('profesor', 'username email');

    if (!clase) {
      console.log('❌ No se encontró ninguna clase con estudiantes asignados');
      console.log('💡 Crea una clase y asígnale estudiantes para probar el sistema');
      return;
    }

    console.log(`✅ Clase encontrada: ${clase.titulo}`);
    console.log(`👨‍🏫 Profesor: ${clase.profesor?.username || 'No asignado'}`);
    console.log(`👥 Estudiantes: ${clase.estudiantes.length}`);
    clase.estudiantes.forEach(est => {
      console.log(`   - ${est.alumno?.nombreAlumno} (${est.alumno?.rutAlumno})`);
    });

    // Buscar un usuario para simular quién cancela la clase
    console.log('\n🔍 Buscando usuario administrador...');
    const adminUser = await User.findOne().populate('roles');
    if (adminUser) {
      console.log(`✅ Usuario encontrado: ${adminUser.username}`);
      console.log(`👤 Roles: ${adminUser.roles.map(r => r.name).join(', ')}`);
    } else {
      console.log('⚠️ No se encontró usuario administrador');
    }

    // Simular cancelación de clase
    console.log('\n🚫 Simulando cancelación de clase...');
    const motivo = 'Prueba del sistema de notificaciones automáticas';
    
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
      
      console.log('\n📋 Detalles por estudiante:');
      resultado.results.detalles.forEach(detalle => {
        const canales = [];
        if (detalle.internos) canales.push('✅ Interno');
        if (detalle.whatsapp) canales.push('✅ WhatsApp');
        if (detalle.email) canales.push('✅ Email');
        
        console.log(`   • ${detalle.estudiante}: ${canales.join(', ')}`);
        if (detalle.errores.length > 0) {
          console.log(`     ❌ Errores: ${detalle.errores.join(', ')}`);
        }
      });
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
testNotificationSystem(); 