import { respondSuccess, respondError } from '../../../core/utils/responseHandler.util.js'
import EmailTemplate from '../../../core/models/emailTemplate.model.js'
import fs from 'fs'
import path from 'path'

class EmailConfigController {
  /**
   * Obtiene la configuración actual de email
   */
  async getEmailConfig (req, res) {
    try {
      const configPath = path.join(process.cwd(), 'email-config.json')

      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8')
        const config = JSON.parse(configData)
        return respondSuccess(req, res, 200, config)
      } else {
        // Configuración por defecto
        const defaultConfig = {
          enabled: false,
          provider: 'gmail',
          host: 'smtp.gmail.com',
          port: '587',
          secure: true,
          user: '',
          password: '',
          fromName: '',
          fromEmail: ''
        }
        return respondSuccess(req, res, 200, defaultConfig)
      }
    } catch (error) {
      console.error('Error getting email config:', error)
      return respondError(req, res, 500, 'Error obteniendo configuración de email')
    }
  }

  /**
   * Guarda la configuración de email
   */
  async saveEmailConfig (req, res) {
    try {
      const config = req.body
      const configPath = path.join(process.cwd(), 'email-config.json')

      console.log('Guardando configuración de email:', {
        user: config.user,
        host: config.host,
        port: config.port,
        secure: config.secure,
        enabled: config.enabled
      })

      // Validar configuración
      if (!config.user || !config.password) {
        return respondError(req, res, 400, 'Email y contraseña son requeridos')
      }

      // Asegurar que la configuración tenga los valores correctos para Gmail
      if (config.host && config.host.includes('gmail.com')) {
        config.secure = false
        config.requireTLS = true
        config.port = '587'
      }

      // Guardar configuración en archivo
      const configJson = JSON.stringify(config, null, 2)
      console.log('Configuración JSON a guardar:', configJson)

      fs.writeFileSync(configPath, configJson)
      console.log('✅ Configuración guardada en:', configPath)

      return respondSuccess(req, res, 200, {
        message: 'Configuración guardada correctamente',
        config
      })
    } catch (error) {
      console.error('Error saving email config:', error)
      return respondError(req, res, 500, 'Error guardando configuración de email')
    }
  }

  /**
   * Prueba la configuración de email
   */
  async testEmailConfig (req, res) {
    try {
      const { to, subject, content } = req.body

      if (!to || !subject || !content) {
        return respondError(req, res, 400, 'Destinatario, asunto y contenido son requeridos')
      }

      // Cargar configuración
      const configPath = path.join(process.cwd(), 'email-config.json')
      if (!fs.existsSync(configPath)) {
        return respondError(req, res, 400, 'Configuración de email no encontrada')
      }

      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)

      if (!config.enabled) {
        return respondError(req, res, 400, 'Email no está habilitado')
      }

      // Importar el servicio de mensajería dinámicamente
      const messagingService = (await import('../services/messaging.service.js')).default

      // Crear transportador temporal con la nueva configuración
      const nodemailer = (await import('nodemailer')).default

      let transporterConfig = {
        host: config.host,
        port: parseInt(config.port),
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password
        }
      }

      // Configuración específica para Gmail
      if (config.host.includes('gmail.com')) {
        transporterConfig = {
          service: 'gmail',
          auth: {
            user: config.user,
            pass: config.password
          }
        }
      } else {
        // Para otros proveedores, agregar configuración TLS
        if (config.requireTLS) {
          transporterConfig.requireTLS = true
        }
        transporterConfig.tls = {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      }

      const testTransporter = nodemailer.createTransport(transporterConfig)

      // Enviar email de prueba
      const result = await testTransporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
        to,
        subject,
        html: messagingService.formatEmailContent(content),
        text: content
      })

      return respondSuccess(req, res, 200, {
        message: 'Email de prueba enviado correctamente',
        messageId: result.messageId
      })
    } catch (error) {
      console.error('Error testing email config:', error)
      return respondError(req, res, 500, `Error enviando email de prueba: ${error.message}`)
    }
  }

  /**
   * Prueba la configuración de email sin restricciones de autorización (solo para desarrollo)
   */
  async testEmailConfigUnrestricted (req, res) {
    try {
      console.log('🔍 [TEST-EMAIL-UNRESTRICTED] Iniciando prueba sin restricciones')
      
      const { to, subject, content } = req.body

      if (!to || !subject || !content) {
        return respondError(req, res, 400, 'Destinatario, asunto y contenido son requeridos')
      }

      // Cargar configuración
      const configPath = path.join(process.cwd(), 'email-config.json')
      if (!fs.existsSync(configPath)) {
        return respondError(req, res, 400, 'Configuración de email no encontrada')
      }

      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)

      if (!config.enabled) {
        return respondError(req, res, 400, 'Email no está habilitado')
      }

      console.log('📋 Configuración cargada:', {
        enabled: config.enabled,
        user: config.user,
        host: config.host,
        port: config.port
      })

      // Crear transportador temporal con la nueva configuración
      const nodemailer = (await import('nodemailer')).default

      let transporterConfig = {
        host: config.host,
        port: parseInt(config.port),
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password
        }
      }

      // Configuración específica para Gmail
      if (config.host.includes('gmail.com')) {
        transporterConfig = {
          service: 'gmail',
          auth: {
            user: config.user,
            pass: config.password
          }
        }
      } else {
        // Para otros proveedores, agregar configuración TLS
        if (config.requireTLS) {
          transporterConfig.requireTLS = true
        }
        transporterConfig.tls = {
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        }
      }

      console.log('🔧 Configuración del transportador:', transporterConfig)

      const testTransporter = nodemailer.createTransport(transporterConfig)

      // Verificar conexión
      console.log('🔍 Verificando conexión...')
      await testTransporter.verify()
      console.log('✅ Conexión verificada correctamente')

      // Enviar email de prueba
      console.log('📧 Enviando email de prueba a:', to)
      
      const result = await testTransporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail || config.user}>`,
        to,
        subject,
        html: `<h1>${subject}</h1><p>${content}</p>`,
        text: content
      })

      console.log('✅ Email enviado correctamente')
      console.log('📧 Message ID:', result.messageId)

      return respondSuccess(req, res, 200, {
        message: 'Email de prueba enviado correctamente',
        messageId: result.messageId
      })
    } catch (error) {
      console.error('❌ Error testing email config:', error)
      return respondError(req, res, 500, `Error enviando email de prueba: ${error.message}`)
    }
  }

  /**
   * Obtiene todas las plantillas de email
   */
  async getEmailTemplates (req, res) {
    try {
      const templates = await EmailTemplate.find({ isActive: true }).sort({ createdAt: -1 })
      return respondSuccess(req, res, 200, templates)
    } catch (error) {
      console.error('Error getting email templates:', error)
      return respondError(req, res, 500, 'Error obteniendo plantillas de email')
    }
  }

  /**
   * Crea una nueva plantilla de email
   */
  async addEmailTemplate (req, res) {
    try {
      const { name, subject, content, variables } = req.body

      if (!name || !subject || !content) {
        return respondError(req, res, 400, 'Nombre, asunto y contenido son requeridos')
      }

      const template = new EmailTemplate({
        name,
        subject,
        content,
        variables: variables || [],
        createdBy: req.email || 'admin'
      })

      await template.save()

      return respondSuccess(req, res, 201, {
        message: 'Plantilla creada correctamente',
        template
      })
    } catch (error) {
      console.error('Error adding email template:', error)
      return respondError(req, res, 500, 'Error creando plantilla de email')
    }
  }

  /**
   * Actualiza una plantilla de email
   */
  async updateEmailTemplate (req, res) {
    try {
      const { id } = req.params
      const { name, subject, content, variables } = req.body

      const template = await EmailTemplate.findById(id)
      if (!template) {
        return respondError(req, res, 404, 'Plantilla no encontrada')
      }

      template.name = name || template.name
      template.subject = subject || template.subject
      template.content = content || template.content
      template.variables = variables || template.variables

      await template.save()

      return respondSuccess(req, res, 200, {
        message: 'Plantilla actualizada correctamente',
        template
      })
    } catch (error) {
      console.error('Error updating email template:', error)
      return respondError(req, res, 500, 'Error actualizando plantilla de email')
    }
  }

  /**
   * Elimina una plantilla de email
   */
  async deleteEmailTemplate (req, res) {
    try {
      const { id } = req.params

      const template = await EmailTemplate.findById(id)
      if (!template) {
        return respondError(req, res, 404, 'Plantilla no encontrada')
      }

      template.isActive = false
      await template.save()

      return respondSuccess(req, res, 200, {
        message: 'Plantilla eliminada correctamente'
      })
    } catch (error) {
      console.error('Error deleting email template:', error)
      return respondError(req, res, 500, 'Error eliminando plantilla de email')
    }
  }

  /**
   * Obtiene una plantilla específica
   */
  async getEmailTemplate (req, res) {
    try {
      const { id } = req.params

      const template = await EmailTemplate.findById(id)
      if (!template || !template.isActive) {
        return respondError(req, res, 404, 'Plantilla no encontrada')
      }

      return respondSuccess(req, res, 200, template)
    } catch (error) {
      console.error('Error getting email template:', error)
      return respondError(req, res, 500, 'Error obteniendo plantilla de email')
    }
  }
}

export default new EmailConfigController()
