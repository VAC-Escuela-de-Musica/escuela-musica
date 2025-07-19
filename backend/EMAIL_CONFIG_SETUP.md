# 📧 Configuración de Email - GPS System

## 🎯 **Descripción**

El sistema de email ahora es completamente configurable desde el frontend, permitiendo a los administradores gestionar la configuración SMTP y las plantillas de email sin necesidad de modificar archivos del backend.

## 🚀 **Características**

### **Configuración SMTP**
- ✅ **Configuración desde frontend** - No más archivos .env
- ✅ **Múltiples proveedores** - Gmail, Outlook, Yahoo, Personalizado
- ✅ **Configuración segura** - Contraseñas de aplicación
- ✅ **Pruebas integradas** - Test de configuración en tiempo real

### **Gestión de Plantillas**
- ✅ **Plantillas personalizables** - Crear, editar, eliminar
- ✅ **Variables dinámicas** - {{nombre}}, {{fecha}}, etc.
- ✅ **Editor visual** - Interfaz intuitiva
- ✅ **Categorización** - Organizar por tipo de mensaje

## 📋 **Configuración Inicial**

### **1. Acceder al Panel de Configuración**

1. Inicia sesión como administrador
2. Ve al menú lateral
3. Haz clic en **"Configuración Email"**

### **2. Configurar SMTP**

#### **Para Gmail:**
1. **Habilitar** el envío de emails
2. Seleccionar **"Gmail"** como proveedor
3. **Email:** tu-email@gmail.com
4. **Contraseña:** Usar contraseña de aplicación (NO tu contraseña normal)
5. **Nombre del remitente:** Tu nombre o institución
6. **Email del remitente:** tu-email@gmail.com

#### **Para Outlook/Hotmail:**
1. Seleccionar **"Outlook"** como proveedor
2. **Email:** tu-email@outlook.com
3. **Contraseña:** Tu contraseña normal
4. Configurar nombre y email del remitente

#### **Para Yahoo:**
1. Seleccionar **"Yahoo"** como proveedor
2. **Email:** tu-email@yahoo.com
3. **Contraseña:** Contraseña de aplicación
4. Configurar nombre y email del remitente

### **3. Crear Contraseña de Aplicación (Gmail)**

1. Ve a tu cuenta de Google
2. **Seguridad** → **Verificación en 2 pasos**
3. **Contraseñas de aplicación**
4. **Generar** nueva contraseña
5. **Copiar** la contraseña generada
6. **Pegar** en el campo de contraseña del sistema

## 🔧 **Configuración Avanzada**

### **Proveedor Personalizado**
Si usas otro proveedor de email:

1. Seleccionar **"Personalizado"**
2. **Servidor SMTP:** smtp.tuproveedor.com
3. **Puerto:** 587 (TLS) o 465 (SSL)
4. **Conexión segura:** Habilitar para TLS/SSL
5. Configurar credenciales

### **Variables en Plantillas**
Las plantillas soportan variables dinámicas:

```html
Hola {{nombre}},

Tu clase de {{materia}} está programada para el {{fecha}} a las {{hora}}.

Saludos,
{{institucion}}
```

**Variables disponibles:**
- `{{nombre}}` - Nombre del destinatario
- `{{fecha}}` - Fecha actual
- `{{hora}}` - Hora actual
- `{{materia}}` - Materia de la clase
- `{{institucion}}` - Nombre de la institución
- `{{profesor}}` - Nombre del profesor

## 📝 **Crear Plantillas de Email**

### **1. Plantilla de Bienvenida**
```html
Asunto: Bienvenido a {{institucion}}

Hola {{nombre}},

¡Bienvenido a {{institucion}}!

Tu cuenta ha sido creada exitosamente y ya puedes acceder a todas las funcionalidades del sistema.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de {{institucion}}
```

### **2. Plantilla de Recordatorio de Clase**
```html
Asunto: Recordatorio: Clase de {{materia}}

Hola {{nombre}},

Te recordamos que tienes clase de {{materia}} mañana a las {{hora}}.

Profesor: {{profesor}}
Aula: {{aula}}

¡Nos vemos en clase!

Saludos,
{{institucion}}
```

### **3. Plantilla de Notificación**
```html
Asunto: Notificación Importante - {{institucion}}

Hola {{nombre}},

{{mensaje}}

Fecha: {{fecha}}
Hora: {{hora}}

Saludos,
El equipo de {{institucion}}
```

## 🧪 **Probar la Configuración**

### **1. Test de Configuración**
1. Ve a la sección **"Prueba de Configuración"**
2. Ingresa un email de prueba
3. Haz clic en **"Enviar Email de Prueba"**
4. Verifica que recibas el email

### **2. Verificar Logs**
Si hay problemas, revisa los logs del backend:
```bash
# En la consola del backend
Error sending email: [detalles del error]
```

## 🔒 **Seguridad**

### **Buenas Prácticas**
- ✅ **Usar contraseñas de aplicación** para Gmail
- ✅ **Habilitar 2FA** en tu cuenta de email
- ✅ **No compartir** credenciales
- ✅ **Revisar logs** regularmente
- ✅ **Actualizar** contraseñas periódicamente

### **Almacenamiento**
- La configuración se guarda en `email-config.json`
- Las plantillas se almacenan en la base de datos
- Las contraseñas se almacenan de forma segura

## 🚨 **Solución de Problemas**

### **Error: "Authentication failed"**
- Verificar que la contraseña sea correcta
- Para Gmail, usar contraseña de aplicación
- Verificar que 2FA esté habilitado

### **Error: "Connection timeout"**
- Verificar configuración de firewall
- Comprobar puerto SMTP (587/465)
- Verificar conexión a internet

### **Error: "Invalid credentials"**
- Verificar email y contraseña
- Comprobar que la cuenta no esté bloqueada
- Verificar configuración de seguridad

### **Emails no se envían**
- Verificar que el email esté habilitado
- Comprobar configuración SMTP
- Revisar logs del backend
- Verificar que el destinatario sea válido

## 📞 **Soporte**

Si tienes problemas con la configuración:

1. **Revisar logs** del backend
2. **Probar configuración** con email de prueba
3. **Verificar credenciales** del proveedor
4. **Contactar soporte** con detalles del error

## 🎉 **¡Listo!**

Una vez configurado, podrás:
- ✅ Enviar emails desde el sistema
- ✅ Usar plantillas personalizadas
- ✅ Gestionar configuración desde el frontend
- ✅ Probar configuración en tiempo real
- ✅ Escalar fácilmente con nuevas plantillas 