# Sistema de Notificaciones Automáticas

## Descripción

El sistema de notificaciones automáticas permite enviar mensajes automáticamente a los estudiantes cuando se cancela una clase. Las notificaciones se envían por múltiples canales:

- 📨 **Mensajes Internos**: Notificaciones dentro de la plataforma
- 📱 **WhatsApp**: Mensajes de WhatsApp (si está configurado)
- 📧 **Email**: Correos electrónicos (si está configurado)

## Funcionalidades

### Notificaciones de Cancelación de Clases

Cuando un administrador o asistente cancela una clase:

1. **Detección Automática**: El sistema detecta automáticamente cuando se cancela una clase
2. **Obtención de Destinatarios**: Se obtienen todos los estudiantes asignados a la clase
3. **Envío Multi-canal**: Se envían notificaciones por todos los canales disponibles
4. **Registro**: Se crea un mensaje interno con el resumen de las notificaciones enviadas

### Contenido de las Notificaciones

Las notificaciones incluyen:

- 🚫 **Título**: "CLASE CANCELADA"
- 📚 **Información de la clase**: Título, profesor, fecha, hora, sala
- 📝 **Motivo**: Razón de la cancelación (si se proporciona)
- ❌ **Cancelado por**: Usuario que realizó la cancelación
- 📅 **Fecha y hora**: Información detallada de la clase cancelada

## Configuración

### Variables de Entorno Requeridas

```env
# WhatsApp Web
WHATSAPP_SESSION_PATH=./.wwebjs_auth
WHATSAPP_PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox
WHATSAPP_TIMEOUT=60000

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña

# Base de datos
MONGODB_URI=mongodb://localhost:27017/escuela-musica
```

### Configuración de WhatsApp

1. **Inicializar WhatsApp Web**:
   ```bash
   # El sistema generará un código QR automáticamente
   # Escanea el código con WhatsApp en tu teléfono
   ```

2. **Verificar estado**:
   ```bash
   curl http://localhost:1230/api/messaging/whatsapp/status
   ```

## Uso

### Cancelar una Clase desde el Frontend

1. Ve a la sección "Gestión de Clases"
2. Busca la clase que deseas cancelar
3. Haz clic en "Cancelar"
4. Completa el formulario:
   - **Motivo** (opcional): Razón de la cancelación
5. Confirma la cancelación

### Cancelar una Clase via API

```bash
curl -X PUT http://localhost:1230/api/clases/cancel/CLASE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "estado": "cancelada",
    "motivo": "Motivo de la cancelación"
  }'
```

## Estructura del Sistema

### Servicios

- **`notification.service.js`**: Servicio principal de notificaciones
- **`internalMessage.service.js`**: Gestión de mensajes internos
- **`messaging.service.js`**: Envío de WhatsApp y Email
- **`whatsappWeb.service.js`**: Integración con WhatsApp Web

### Flujo de Notificaciones

```
1. Usuario cancela clase
   ↓
2. clase.service.js detecta cancelación
   ↓
3. notification.service.js se ejecuta
   ↓
4. Se obtienen estudiantes de la clase
   ↓
5. Se preparan mensajes personalizados
   ↓
6. Se envían por cada canal disponible
   ↓
7. Se registra el resumen
```

## Pruebas

### Script de Prueba

Ejecuta el script de prueba para verificar el sistema:

```bash
cd backend
node test-notification-system.js
```

### Verificación Manual

1. **Crear una clase** con estudiantes asignados
2. **Cancelar la clase** desde el frontend
3. **Verificar notificaciones**:
   - Mensajes internos en la plataforma
   - WhatsApp (si está configurado)
   - Email (si está configurado)

## Logs y Monitoreo

### Logs del Sistema

El sistema genera logs detallados:

```
🔔 Iniciando notificaciones de cancelación de clase: 64f8a1b2c3d4e5f6a7b8c9d0
✅ Notificaciones de cancelación enviadas correctamente
📊 Resumen de envíos:
   • Mensajes internos: 5/5
   • WhatsApp: 3/5
   • Email: 4/5
   • Errores totales: 0
```

### Monitoreo de Errores

Los errores se registran en:

- **Consola del servidor**: Errores de envío
- **Base de datos**: Registro de mensajes internos
- **Logs de WhatsApp**: Errores de conexión

## Personalización

### Modificar Mensajes

Los mensajes se pueden personalizar editando `notification.service.js`:

```javascript
// Mensaje interno
const mensajeInterno = `🚫 **CLASE CANCELADA**
📚 **Clase:** ${clase.titulo}
👨‍🏫 **Profesor:** ${profesor.username}
// ... más contenido
`;

// Mensaje WhatsApp
const mensajeWhatsApp = `🚫 *CLASE CANCELADA*
📚 *Clase:* ${clase.titulo}
// ... más contenido
`;
```

### Agregar Nuevos Canales

Para agregar un nuevo canal de notificación:

1. **Crear servicio** en `communication/services/`
2. **Integrar** en `notification.service.js`
3. **Configurar** en el frontend

## Troubleshooting

### Problemas Comunes

#### WhatsApp no envía mensajes
- Verificar que WhatsApp Web esté autenticado
- Revisar logs de conexión
- Verificar formato de números de teléfono

#### Email no se envía
- Verificar configuración SMTP
- Revisar credenciales de email
- Verificar que los estudiantes tengan email válido

#### Mensajes internos no aparecen
- Verificar permisos de usuario
- Revisar logs de base de datos
- Verificar que los estudiantes estén activos

### Comandos de Diagnóstico

```bash
# Verificar estado de WhatsApp
curl http://localhost:1230/api/messaging/whatsapp/status

# Verificar configuración de email
curl http://localhost:1230/api/messaging/email/status

# Ver mensajes internos
curl http://localhost:1230/api/internal-messages
```

## Seguridad

### Permisos

- Solo **administradores** y **asistentes** pueden cancelar clases
- Las notificaciones se envían solo a **estudiantes activos**
- Se registra **quién** canceló la clase

### Privacidad

- Los números de teléfono se formatean correctamente
- Los emails se validan antes del envío
- No se almacenan datos sensibles en logs

## Mantenimiento

### Limpieza de Datos

- Los mensajes internos se pueden archivar automáticamente
- Los logs de WhatsApp se pueden limpiar periódicamente
- Las sesiones de WhatsApp se renuevan automáticamente

### Actualizaciones

- Mantener actualizado `whatsapp-web.js`
- Revisar cambios en APIs de WhatsApp
- Actualizar configuraciones de email según sea necesario 