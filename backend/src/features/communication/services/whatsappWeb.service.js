import pkg from 'whatsapp-web.js'
import qrcode from 'qrcode-terminal'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'
const { Client, LocalAuth } = pkg

class WhatsAppWebService {
  constructor () {
    this.client = null
    this.isReady = false
    this.qrCode = null
    this.qrCodeImage = null
    this.sessionPath = path.resolve(process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth')

    // Crear directorio de sesión si no existe
    if (!fs.existsSync(this.sessionPath)) {
      fs.mkdirSync(this.sessionPath, { recursive: true })
    }
  }

  /**
   * Inicializa el cliente de WhatsApp Web
   */
  async initialize () {
    try {
      console.log('🚀 Inicializando WhatsApp Web...')

      // Obtener argumentos de Puppeteer desde variables de entorno
      const puppeteerArgs = process.env.WHATSAPP_PUPPETEER_ARGS 
        ? process.env.WHATSAPP_PUPPETEER_ARGS.split(',')
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]

      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'gps-system',
          dataPath: this.sessionPath
        }),
        puppeteer: {
          headless: true,
          args: puppeteerArgs,
          timeout: parseInt(process.env.WHATSAPP_TIMEOUT) || 60000
        }
      })

      // Evento cuando se genera el código QR
      this.client.on('qr', async (qr) => {
        console.log('📱 Código QR generado. Escanea con WhatsApp:')
        this.qrCode = qr

        // Mostrar en consola
        qrcode.generate(qr, { small: true })

        // Generar imagen base64 para el frontend
        try {
          console.log('🖼️ Generando imagen QR para el frontend...')
          this.qrCodeImage = await QRCode.toDataURL(qr, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          console.log('✅ Imagen QR generada correctamente')
          console.log('📏 Tamaño de la imagen:', this.qrCodeImage.length, 'caracteres')
        } catch (error) {
          console.error('❌ Error generando QR como imagen:', error)
        }
      })

      // Evento cuando está listo
      this.client.on('ready', () => {
        console.log('✅ WhatsApp Web está listo!')
        this.isReady = true
        this.qrCode = null
        this.qrCodeImage = null
      })

      // Evento de autenticación
      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp Web autenticado')
      })

      // Evento de desconexión
      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp Web desconectado:', reason)
        this.isReady = false
      })

      // Evento de error
      this.client.on('auth_failure', (msg) => {
        console.error('❌ Error de autenticación:', msg)
      })

      // Inicializar el cliente
      await this.client.initialize()

      return { success: true, message: 'WhatsApp Web inicializado correctamente' }
    } catch (error) {
      console.error('❌ Error inicializando WhatsApp Web:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Envía un mensaje de WhatsApp
   * @param {string} to - Número de teléfono del destinatario
   * @param {string} message - Contenido del mensaje
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendMessage (to, message) {
    try {
      if (!this.client || !this.isReady) {
        return {
          success: false,
          error: 'WhatsApp Web no está inicializado o listo',
          message: 'Inicializa WhatsApp Web primero'
        }
      }

      // Formatear el número de teléfono
      const formattedNumber = this.formatPhoneNumber(to)

      console.log(`📱 Enviando mensaje a: ${formattedNumber}`)
      console.log(`💬 Mensaje: ${message}`)

      // Enviar mensaje
      const response = await this.client.sendMessage(`${formattedNumber}@c.us`, message)

      console.log('✅ Mensaje enviado exitosamente:', response.id._serialized)

      return {
        success: true,
        messageId: response.id._serialized,
        status: 'sent',
        message: 'Mensaje de WhatsApp enviado correctamente'
      }
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error)
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar mensaje de WhatsApp'
      }
    }
  }

  /**
   * Formatea el número de teléfono
   * @param {string} phoneNumber - Número de teléfono
   * @returns {string} - Número formateado
   */
  formatPhoneNumber (phoneNumber) {
    // Remover todos los caracteres no numéricos excepto +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '')

    // Si no empieza con +, agregar el código de país por defecto (+34 para España)
    if (!cleaned.startsWith('+')) {
      cleaned = '+34' + cleaned
    }

    // Remover el + para el formato interno de WhatsApp
    return cleaned.replace('+', '')
  }

  /**
   * Obtiene el estado del servicio
   * @returns {Object} - Estado del servicio
   */
  getStatus () {
    return {
      initialized: !!this.client,
      ready: this.isReady,
      hasQrCode: !!this.qrCode,
      qrCode: this.qrCode,
      qrCodeImage: this.qrCodeImage
    }
  }

  /**
   * Obtiene el código QR para autenticación
   * @returns {Object} - Información del código QR
   */
  getQrCode () {
    console.log('🔍 getQrCode llamado')
    console.log('📱 qrCode disponible:', !!this.qrCode)
    console.log('🖼️ qrCodeImage disponible:', !!this.qrCodeImage)

    if (!this.qrCode) {
      console.log('❌ No hay código QR disponible')
      return {
        success: false,
        message: 'No hay código QR disponible. El servicio puede estar ya autenticado.'
      }
    }

    console.log('✅ Devolviendo código QR con imagen')
    return {
      success: true,
      qrCode: this.qrCode,
      qrCodeImage: this.qrCodeImage,
      message: 'Código QR generado. Escanea con WhatsApp para autenticar.'
    }
  }

  /**
   * Cierra la conexión
   */
  async destroy () {
    try {
      if (this.client) {
        await this.client.destroy()
        this.client = null
        this.isReady = false
        console.log('🔌 WhatsApp Web desconectado')
      }
    } catch (error) {
      console.error('❌ Error cerrando WhatsApp Web:', error)
    }
  }
}

// Crear instancia singleton
const whatsappWebService = new WhatsAppWebService()

export default whatsappWebService
