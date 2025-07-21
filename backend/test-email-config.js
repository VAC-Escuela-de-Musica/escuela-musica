import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Función para cargar configuración
function loadEmailConfig() {
  const configPath = path.join(process.cwd(), 'email-config.json');
  
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  }
  
  return null;
}

// Función para probar configuración
async function testEmailConfig() {
  console.log('🔍 Iniciando prueba de configuración de email...\n');
  
  const config = loadEmailConfig();
  
  if (!config) {
    console.log('❌ No se encontró archivo de configuración email-config.json');
    console.log('💡 Asegúrate de configurar el email desde el panel de administración');
    return;
  }
  
  if (!config.enabled) {
    console.log('❌ Email no está habilitado en la configuración');
    return;
  }
  
  console.log('📋 Configuración encontrada:');
  console.log(`   Proveedor: ${config.provider}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Seguro: ${config.secure}`);
  console.log(`   Usuario: ${config.user}`);
  console.log(`   Nombre: ${config.fromName}`);
  console.log(`   Email respuesta: ${config.fromEmail}\n`);
  
  // Configuración específica por proveedor
  let transporterConfig = {
    host: config.host,
    port: parseInt(config.port),
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password
    }
  };

  // Configuraciones específicas por proveedor
  if (config.host.includes('gmail.com')) {
    console.log('📧 Configurando para Gmail...');
    transporterConfig = {
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.password
      }
    };
  } else if (config.host.includes('outlook.com') || config.host.includes('hotmail.com')) {
    console.log('📧 Configurando para Outlook/Hotmail...');
    transporterConfig = {
      service: 'outlook',
      auth: {
        user: config.user,
        pass: config.password
      }
    };
  } else if (config.host.includes('yahoo.com')) {
    console.log('📧 Configurando para Yahoo...');
    transporterConfig = {
      service: 'yahoo',
      auth: {
        user: config.user,
        pass: config.password
      }
    };
  } else {
    console.log('📧 Configurando para proveedor personalizado...');
    transporterConfig = {
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      requireTLS: true
    };
  }

  try {
    console.log('🔧 Creando transporter...');
    const transporter = nodemailer.createTransport(transporterConfig);
    
    console.log('✅ Transporter creado exitosamente');
    console.log('🔍 Verificando configuración...');
    
    // Verificar configuración
    await transporter.verify();
    console.log('✅ Configuración verificada correctamente\n');
    
    // Probar envío
    console.log('📤 Probando envío de email...');
    
    const testEmail = {
      from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
      to: config.user, // Enviar a sí mismo para prueba
      subject: 'Prueba de Configuración - GPS',
      html: `
        <h2>✅ Prueba de Configuración Exitosa</h2>
        <p>Este email confirma que la configuración de email está funcionando correctamente.</p>
        <p><strong>Proveedor:</strong> ${config.provider}</p>
        <p><strong>Servidor:</strong> ${config.host}</p>
        <p><strong>Puerto:</strong> ${config.port}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este es un email de prueba automático del sistema GPS.
        </p>
      `,
      text: `
        Prueba de Configuración Exitosa
        
        Este email confirma que la configuración de email está funcionando correctamente.
        
        Proveedor: ${config.provider}
        Servidor: ${config.host}
        Puerto: ${config.port}
        Fecha: ${new Date().toLocaleString()}
        
        ---
        Este es un email de prueba automático del sistema GPS.
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    
    console.log('✅ Email de prueba enviado exitosamente!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Destinatario: ${config.user}`);
    console.log('\n🎉 ¡La configuración de email está funcionando perfectamente!');
    
  } catch (error) {
    console.log('❌ Error durante la prueba:');
    console.log(`   Tipo: ${error.code || 'Desconocido'}`);
    console.log(`   Mensaje: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que estés usando una contraseña de aplicación (NO tu contraseña normal)');
      console.log('   2. Asegúrate de que tienes 2FA habilitado en tu cuenta');
      console.log('   3. Regenera la contraseña de aplicación');
      console.log('   4. Verifica que el email y contraseña no tengan espacios extra');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. El servidor SMTP puede estar temporalmente no disponible');
      console.log('   3. Verifica que el puerto y host sean correctos');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. El servidor está tardando en responder');
      console.log('   2. Verifica tu conexión a internet');
      console.log('   3. Intenta de nuevo en unos minutos');
    }
    
    console.log('\n📖 Consulta la guía EMAIL_SETUP_GUIDE.md para más ayuda');
  }
}

// Ejecutar prueba
testEmailConfig().catch(console.error); 