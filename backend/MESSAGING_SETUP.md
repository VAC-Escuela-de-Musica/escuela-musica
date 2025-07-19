# Configuración del Servicio de Mensajería

**NOTA**: Para opciones gratuitas y simulación, consulta `MESSAGING_SETUP_FREE.md`

Este documento explica cómo configurar el servicio de mensajería para enviar mensajes de WhatsApp y Email usando APIs pagas.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

### Para WhatsApp (Twilio)
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=tu_account_sid_de_twilio
TWILIO_AUTH_TOKEN=tu_auth_token_de_twilio
TWILIO_WHATSAPP_NUMBER=+1234567890
```

### Para WhatsApp (API Alternativa)
```env
# WhatsApp API Alternative
WHATSAPP_API_TOKEN=tu_token_de_whatsapp_api
```

### Para Email (Gmail)
```env
# Email Configuration (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## Configuración de Twilio para WhatsApp

1. **Crear cuenta en Twilio**: Ve a [twilio.com](https://www.twilio.com) y crea una cuenta
2. **Obtener credenciales**: En el dashboard de Twilio, encuentra tu Account SID y Auth Token
3. **Configurar WhatsApp**: 
   - Ve a la sección de WhatsApp en Twilio
   - Sigue las instrucciones para configurar tu número de WhatsApp
   - Obtén el número de WhatsApp de Twilio

## Configuración de Gmail para Email

1. **Habilitar autenticación de 2 factores** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a Configuración de Google Account
   - Seguridad > Verificación en 2 pasos > Contraseñas de aplicación
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASSWORD`

## APIs Alternativas para WhatsApp

Si no quieres usar Twilio, puedes usar estas alternativas:

### 1. WhatsApp Business API
- Requiere aprobación de Meta
- Más complejo de configurar
- Gratuito para volúmenes bajos

### 2. APIs de terceros
- [MessageBird](https://messagebird.com)
- [Vonage](https://vonage.com)
- [Infobip](https://infobip.com)

## Instalación de Dependencias

Ejecuta el siguiente comando para instalar las dependencias:

```bash
npm install
```

## Verificación de Configuración

Una vez configurado, puedes verificar el estado con:

```bash
# Verificar configuración
GET /api/messaging/config-status

# Enviar mensaje de prueba
POST /api/messaging/test-message
{
  "type": "whatsapp",
  "recipient": "+34612345678"
}
```

## Uso de las APIs

### Enviar WhatsApp
```javascript
POST /api/messaging/send-whatsapp
{
  "phoneNumber": "+34612345678",
  "message": "Hola, este es un mensaje de prueba"
}
```

### Enviar Email
```javascript
POST /api/messaging/send-email
{
  "email": "destinatario@email.com",
  "subject": "Asunto del email",
  "content": "Contenido del email"
}
```

### Enviar mensaje genérico
```javascript
POST /api/messaging/send-message
{
  "type": "whatsapp", // o "email"
  "recipient": "+34612345678", // o email
  "subject": "Asunto", // solo para email
  "content": "Contenido del mensaje"
}
```

## Notas Importantes

1. **WhatsApp**: Los números deben incluir el código de país (+34 para España)
2. **Email**: Usa contraseñas de aplicación, no tu contraseña normal de Gmail
3. **Rate Limits**: Respeta los límites de envío de las APIs
4. **Pruebas**: Siempre prueba con tu propio número/email primero
5. **Logs**: Revisa los logs del servidor para debugging

## Solución de Problemas

### Error de autenticación de Gmail
- Verifica que la autenticación de 2 factores esté habilitada
- Usa contraseña de aplicación, no contraseña normal
- Verifica que el email esté correcto

### Error de Twilio
- Verifica que las credenciales sean correctas
- Asegúrate de que el número de WhatsApp esté configurado
- Revisa que el número de destino esté en el formato correcto

### Error de red
- Verifica la conectividad a internet
- Revisa los firewalls y proxies
- Comprueba que las URLs de las APIs sean accesibles 