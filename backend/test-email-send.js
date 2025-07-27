import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

async function testEmailSend() {
  console.log('🔍 Probando envío de email...');
  
  try {
    // Cargar configuración
    const configPath = path.join(process.cwd(), 'email-config.json');
    if (!fs.existsSync(configPath)) {
      console.log('❌ Archivo de configuración no encontrado');
      return;
    }

    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    
    console.log('📋 Configuración cargada:', {
      enabled: config.enabled,
      user: config.user,
      host: config.host,
      port: config.port,
      secure: config.secure
    });

    if (!config.enabled) {
      console.log('❌ Email no está habilitado');
      return;
    }

    // Crear transportador
    let transporterConfig = {
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    };

    // Configuración específica para Gmail
    if (config.host.includes('gmail.com')) {
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: config.user,
          pass: config.password
        }
      };
    } else {
      // Para otros proveedores, agregar configuración TLS
      if (config.requireTLS) {
        transporterConfig.requireTLS = true;
      }
      transporterConfig.tls = {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      };
    }

    console.log('🔧 Configuración del transportador:', transporterConfig);

    const transporter = nodemailer.createTransport(transporterConfig);

    // Verificar conexión
    console.log('🔍 Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión verificada correctamente');

    // Enviar email de prueba
    const testEmail = process.argv[2] || 'test@example.com';
    console.log('📧 Enviando email de prueba a:', testEmail);

    const result = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
      to: testEmail,
      subject: 'Prueba de Configuración - GPS',
      html: '<h1>Prueba de Email</h1><p>Este es un mensaje de prueba para verificar que la configuración de email funciona correctamente.</p>',
      text: 'Este es un mensaje de prueba para verificar que la configuración de email funciona correctamente.'
    });

    console.log('✅ Email enviado correctamente');
    console.log('📧 Message ID:', result.messageId);

  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

testEmailSend(); 