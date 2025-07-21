# Configuración Gratuita del Servicio de Mensajería

Este documento explica cómo configurar el servicio de mensajería usando opciones gratuitas para pruebas.

## Estado Actual (Simulación)

### WhatsApp
- **Estado**: Simulado para pruebas
- **Funcionalidad**: Los mensajes se simulan en el servidor
- **Ventajas**: No requiere configuración, funciona inmediatamente
- **Limitaciones**: Los mensajes no se envían realmente

### Email
- **Estado**: Funcional con Gmail
- **Configuración**: Requiere variables de entorno

## Variables de Entorno Requeridas

### Para Email (Gmail) - OPCIONAL
```env
# Email Configuration (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_de_aplicacion
```

## Opciones Gratuitas para WhatsApp (Futuro)

### 1. WhatsApp Business API (Gratuita para volúmenes bajos)
- **Requisitos**: Aprobación de Meta/Facebook
- **Límites**: 1000 mensajes/mes gratuitos
- **Configuración**: Compleja, requiere verificación

### 2. APIs de Terceros Gratuitas
- **Callmebot**: Gratuito para uso personal
- **WhatsApp Web API**: Requiere sesión activa
- **APIs locales**: Usando bibliotecas como whatsapp-web.js

### 3. Servicios con Plan Gratuito
- **MessageBird**: 100 SMS gratuitos/mes
- **Vonage**: Créditos gratuitos para nuevos usuarios
- **Infobip**: Plan gratuito limitado

## Configuración de Email (Gmail)

1. **Habilitar autenticación de 2 factores** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a Configuración de Google Account
   - Seguridad > Verificación en 2 pasos > Contraseñas de aplicación
   - Genera una nueva contraseña para "Correo"
   - Usa esta contraseña en `EMAIL_PASSWORD`

## Instalación de Dependencias

```bash
npm install
```

## Verificación de Configuración

### Verificar estado actual
```bash
GET http://localhost:1230/api/messaging/config-status
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "services": {
      "whatsapp": true,
      "email": false
    },
    "configuration": {
      "whatsapp": {
        "twilio": { "configured": false },
        "alternative": { "configured": true }
      },
      "email": { "configured": false }
    }
  }
}
```

### Enviar mensaje de prueba
```bash
POST http://localhost:1230/api/messaging/test-message
{
  "type": "whatsapp",
  "recipient": "+34612345678"
}
```

## Uso de las APIs

### Enviar WhatsApp (Simulado)
```javascript
POST /api/messaging/send-whatsapp
{
  "phoneNumber": "+34612345678",
  "message": "Hola, este es un mensaje de prueba"
}
```

### Enviar Email (Real)
```javascript
POST /api/messaging/send-email
{
  "email": "destinatario@email.com",
  "subject": "Asunto del email",
  "content": "Contenido del email"
}
```

## Logs del Servidor

Cuando envíes un mensaje de WhatsApp, verás en los logs:
```
Simulando envío de WhatsApp a: +34612345678
Mensaje: Hola, este es un mensaje de prueba
```

## Migración a APIs Reales

### Para WhatsApp Business API:
1. Crear cuenta en Meta for Developers
2. Configurar aplicación de WhatsApp Business
3. Obtener token de acceso
4. Actualizar el servicio con la API real

### Para APIs de terceros:
1. Registrarse en el servicio elegido
2. Obtener credenciales de API
3. Actualizar el método `sendWhatsAppMessage` en `messaging.service.js`

## Ventajas de la Simulación

1. **Desarrollo rápido**: No necesitas configurar APIs externas
2. **Pruebas inmediatas**: Funciona sin configuración
3. **Sin costos**: No hay gastos durante desarrollo
4. **Control total**: Puedes simular diferentes escenarios

## Desventajas de la Simulación

1. **No envío real**: Los mensajes no llegan al destinatario
2. **Solo para desarrollo**: No es útil en producción
3. **Sin confirmación**: No puedes verificar entrega

## Próximos Pasos

1. **Desarrollo**: Usar simulación para probar la interfaz
2. **Pruebas**: Configurar email real para pruebas completas
3. **Producción**: Migrar a APIs reales cuando esté listo

## Notas Importantes

- El puerto del backend es **1230**
- WhatsApp está simulado para facilitar el desarrollo
- Email funciona con Gmail si se configura
- Los logs muestran los mensajes simulados
- La interfaz funciona igual que con APIs reales 