# Sistema de Notificaciones de Cambio de Horario

## Descripción

El sistema de notificaciones automáticas de cambio de horario permite enviar mensajes automáticamente a los estudiantes cuando se modifica el horario de una clase. Las notificaciones se envían por múltiples canales:

- 📨 **Mensajes Internos**: Notificaciones dentro de la plataforma
- 📱 **WhatsApp**: Mensajes de WhatsApp (si está configurado)
- 📧 **Email**: Correos electrónicos (si está configurado)

## Funcionalidades

### Notificaciones Automáticas de Cambio de Horario

Cuando un administrador o profesor actualiza el horario de una clase:

1. **Detección Automática**: El sistema detecta automáticamente cuando se cambia el horario de una clase
2. **Obtención de Destinatarios**: Se obtienen todos los estudiantes asignados a la clase
3. **Envío Multi-canal**: Se envían notificaciones por todos los canales disponibles
4. **Registro**: Se crea un mensaje interno con el resumen de las notificaciones enviadas

### Contenido de las Notificaciones

Las notificaciones incluyen:

- 🕐 **Título**: "CAMBIO DE HORARIO"
- 📚 **Información de la clase**: Título, profesor, fecha, sala
- ⏰ **Cambio específico**: Horario anterior → Horario nuevo
- 👤 **Actualizado por**: Usuario que realizó el cambio
- 📅 **Fecha y hora**: Información detallada de la clase

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

## Uso

### Cambiar Horario desde el Frontend

1. Ve a la sección "Gestión de Clases"
2. Busca la clase que deseas modificar
3. Haz clic en "Editar"
4. Modifica el horario (hora de inicio y/o fin)
5. Guarda los cambios

### Cambiar Horario via API

```bash
curl -X PUT http://localhost:1230/api/clases/CLASE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "titulo": "Nombre de la clase",
    "descripcion": "Descripción de la clase",
    "profesor": "PROFESOR_ID",
    "sala": "Sala A",
    "horarios": [
      {
        "dia": "18-08-2025",
        "horaInicio": "14:00",
        "horaFin": "15:00"
      }
    ]
  }'
```

## Estructura del Sistema

### Servicios

- **`notification.service.js`**: Servicio principal de notificaciones
- **`clase.service.js`**: Servicio de gestión de clases (detecta cambios)
- **`internalMessage.service.js`**: Gestión de mensajes internos
- **`messaging.service.js`**: Envío de WhatsApp y Email

### Flujo de Notificaciones

```
1. Usuario actualiza horario de clase
   ↓
2. clase.service.js detecta cambio de horario
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

### Script de Prueba de Notificaciones

```bash
cd backend
node test-cambio-horario-notification.js
```

### Script de Prueba de Actualización Completa

```bash
cd backend
node test-actualizar-clase-con-notificacion.js
```

### Verificación Manual

1. **Crear una clase** con estudiantes asignados
2. **Modificar el horario** desde el frontend
3. **Verificar notificaciones**:
   - Mensajes internos en la plataforma
   - WhatsApp (si está configurado)
   - Email (si está configurado)

## Logs y Monitoreo

### Logs del Sistema

El sistema genera logs detallados:

```
🔔 Iniciando notificaciones de cambio de horario: 64f8a1b2c3d4e5f6a7b8c9d0
✅ Notificaciones de cambio de horario completadas
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
const mensaje = `🕐 **CAMBIO DE HORARIO**

📚 **Clase:** ${claseCompleta.titulo}
👨‍🏫 **Profesor:** ${profesorNombre}
📅 **Fecha:** ${fechaClase}
📍 **Sala:** ${salaClase}
⏰ **Cambio:** ${horaAnterior} → ${horaNueva}

Por favor, toma nota del nuevo horario.`;

// Mensaje WhatsApp
const mensajeWhatsApp = `🕐 *CAMBIO DE HORARIO*

📚 *Clase:* ${claseCompleta.titulo}
👨‍🏫 *Profesor:* ${profesorNombre}
📅 *Fecha:* ${fechaClase}
📍 *Sala:* ${salaClase}
⏰ *Cambio:* ${horaAnterior} → ${horaNueva}

Por favor, toma nota del nuevo horario.`;
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

#### Notificaciones no se envían al cambiar horario
- Verificar que la clase tenga estudiantes asignados
- Revisar logs del servicio de notificaciones
- Verificar que el cambio sea de horario (no solo otros campos)

### Comandos de Diagnóstico

```bash
# Verificar estado de WhatsApp
curl http://localhost:1230/api/messaging/whatsapp/status

# Verificar configuración de email
curl http://localhost:1230/api/messaging/email/status

# Ver mensajes internos
curl http://localhost:1230/api/internal-messages

# Probar notificaciones manualmente
node test-cambio-horario-notification.js
```

## Seguridad

### Permisos

- Solo **administradores** y **profesores** pueden modificar horarios
- Las notificaciones se envían solo a **estudiantes activos**
- Se registra quién realizó el cambio

### Validaciones

- Se verifica que no haya conflictos de horario
- Se valida que la clase exista y esté activa
- Se verifica que los estudiantes tengan información de contacto

## Ejemplos de Uso

### Ejemplo 1: Cambio de Horario Simple

```javascript
// Cambiar de 10:00-11:00 a 14:00-15:00
const datosActualizacion = {
  horarios: [{
    dia: '18-08-2025',
    horaInicio: '14:00',
    horaFin: '15:00'
  }]
};
```

### Ejemplo 2: Cambio de Horario con Notificación Personalizada

El sistema automáticamente:
1. Detecta el cambio de horario
2. Obtiene todos los estudiantes de la clase
3. Envía notificaciones por todos los canales disponibles
4. Registra el resumen de envíos

### Ejemplo 3: Verificación de Notificaciones

```bash
# Verificar que las notificaciones se enviaron
node test-cambio-horario-notification.js

# Resultado esperado:
# ✅ Notificación de cambio de horario enviada correctamente
# 📊 Resultados: { internos: 5, whatsapp: 3, email: 4 }
```

## Integración con Frontend

### Componentes Relacionados

- **`HorarioAdmin.jsx`**: Gestión de horarios con notificaciones
- **`HorarioDia.jsx`**: Visualización de horarios
- **`ClasesManagement.jsx`**: Gestión completa de clases

### Eventos del Frontend

1. **Actualización de clase**: Se dispara automáticamente
2. **Confirmación de cambio**: El usuario confirma la modificación
3. **Feedback visual**: Se muestra el estado de las notificaciones

## Mantenimiento

### Limpieza de Logs

```bash
# Limpiar logs antiguos
find ./logs -name "*.log" -mtime +30 -delete
```

### Monitoreo de Rendimiento

- **Tiempo de envío**: < 5 segundos por notificación
- **Tasa de éxito**: > 95% de envíos exitosos
- **Errores**: < 5% de errores por canal

### Actualizaciones

Para actualizar el sistema:

1. **Backup** de la base de datos
2. **Actualizar** servicios de notificación
3. **Probar** con scripts de prueba
4. **Verificar** configuración de canales 