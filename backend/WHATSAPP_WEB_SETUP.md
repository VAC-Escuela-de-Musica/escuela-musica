# 📱 Configuración de WhatsApp Web - GPS System

## 🎯 **¿Qué es WhatsApp Web?**

WhatsApp Web es una solución **gratuita** que permite enviar mensajes reales de WhatsApp desde tu aplicación sin usar APIs pagas como Twilio, WhatsApp Business API o Callmebot.

### ✅ **Ventajas:**
- **100% Gratuito** - No hay costos mensuales
- **Mensajes Reales** - Los mensajes se envían realmente
- **Desde tu Número** - Los mensajes aparecen como enviados desde tu WhatsApp
- **Sin Límites** - Puedes enviar tantos mensajes como quieras
- **Fácil Configuración** - Solo necesitas escanear un código QR

### ⚠️ **Limitaciones:**
- **Sesión Activa** - Necesitas mantener la sesión activa
- **Un Número por Instancia** - Solo puedes usar un número de WhatsApp por servidor
- **Dependencia de WhatsApp Web** - Si WhatsApp Web cambia, puede afectar la funcionalidad

---

## 🚀 **Configuración Paso a Paso**

### **Paso 1: Instalar Dependencias**

Las dependencias ya están instaladas. Si necesitas reinstalar:

```bash
cd backend
npm install whatsapp-web.js qrcode-terminal
```

### **Paso 2: Inicializar WhatsApp Web**

#### **Opción A: Usando el Script de Prueba**
```bash
cd backend
node test-whatsapp-web.js +34612345678
```

#### **Opción B: Usando la API**
```bash
# Inicializar WhatsApp Web
POST http://localhost:1230/api/messaging/whatsapp-web/initialize

# Verificar estado
GET http://localhost:1230/api/messaging/whatsapp-web/status

# Obtener código QR (si es necesario)
GET http://localhost:1230/api/messaging/whatsapp-web/qr
```

### **Paso 3: Autenticar con WhatsApp**

#### **Opción A: Desde el Frontend (Recomendado)**
1. **Ve al panel de administración** en el frontend
2. **Haz clic en "Configuración WhatsApp"**
3. **Inicializa WhatsApp Web** desde la interfaz
4. **Obtén el código QR** - aparecerá como imagen en el frontend
5. **Abre WhatsApp** en tu teléfono
6. **Ve a Configuración → Dispositivos Vinculados**
7. **Escanea el código QR** que aparece en el frontend
8. **Confirma la vinculación** en tu teléfono

#### **Opción B: Desde la Consola**
1. **Ejecuta el script o la API** de inicialización
2. **Aparecerá un código QR** en la consola
3. **Abre WhatsApp** en tu teléfono
4. **Ve a Configuración → Dispositivos Vinculados**
5. **Escanea el código QR** que aparece en la consola
6. **Confirma la vinculación** en tu teléfono

### **Paso 4: Verificar Estado**

```bash
GET http://localhost:1230/api/messaging/config-status
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "configuration": {
      "whatsapp": {
        "web": { "configured": true },
        "businessAPI": { "configured": false },
        "callmebot": { "configured": false },
        "twilio": { "configured": false },
        "alternative": { "configured": true }
      }
    }
  }
}
```

---

## 📱 **Envío de Mensajes**

### **Usando la API**
```bash
POST http://localhost:1230/api/messaging/send-whatsapp
{
  "phoneNumber": "+34612345678",
  "message": "Hola, este es un mensaje de prueba desde GPS"
}
```

### **Usando el Script de Prueba**
```bash
node test-whatsapp-web.js +34612345678
```

---

## 🔧 **Gestión de Sesión**

### **Verificar Estado de Sesión**
```bash
GET http://localhost:1230/api/messaging/whatsapp-web/status
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "ready": true,
    "hasQrCode": false,
    "qrCode": null
  }
}
```

### **Reinicializar (si es necesario)**
```bash
POST http://localhost:1230/api/messaging/whatsapp-web/initialize
```

---

## 📋 **Formato de Números**

### **Formatos Válidos:**
- `+34612345678` (España)
- `34612345678` (se convierte automáticamente)
- `+525512345678` (México)
- `+5491112345678` (Argentina)

### **Ejemplos de Uso:**
```javascript
// Todos estos formatos funcionan:
"+34612345678"
"34612345678"
"+34 612 345 678"
"612345678"
```

---

## 🚨 **Solución de Problemas**

### **Error: "WhatsApp Web no está autenticado"**
1. Verifica que hayas escaneado el código QR
2. Asegúrate de que WhatsApp esté conectado a internet
3. Reinicializa el servicio

### **Error: "Número inválido"**
1. Verifica el formato del número (+34...)
2. Asegúrate de que el número esté activo en WhatsApp
3. El número debe tener WhatsApp instalado

### **Error: "Sesión expirada"**
1. Reinicializa WhatsApp Web
2. Escanea el código QR nuevamente
3. Verifica que no hayas desvinculado el dispositivo

### **Error: "Puppeteer no puede iniciar"**
1. Verifica que tengas Chrome/Chromium instalado
2. En Linux, instala dependencias adicionales:
   ```bash
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

---

## 🔄 **Prioridad de Servicios**

El sistema usa los servicios en este orden:

1. **WhatsApp Web** (si está configurado y autenticado)
2. **WhatsApp Business API** (si está configurado)
3. **Callmebot** (si está configurado)
4. **Twilio** (si está configurado)
5. **Simulación** (siempre disponible como fallback)

---

## 📁 **Archivos de Sesión**

Los archivos de sesión se guardan en:
```
backend/.wwebjs_auth/
```

**No elimines esta carpeta** si quieres mantener la sesión activa entre reinicios del servidor.

---

## 🎯 **Recomendaciones**

### **Para Desarrollo:**
- Usa WhatsApp Web para pruebas
- Mantén la sesión activa durante el desarrollo
- Usa números de prueba

### **Para Producción:**
- Considera usar WhatsApp Business API para mayor confiabilidad
- Implementa manejo de reconexión automática
- Monitorea el estado de la sesión

### **Seguridad:**
- No compartas los archivos de sesión
- Usa un número dedicado para la aplicación
- Considera usar un contenedor Docker para aislar la sesión

---

## 📞 **Soporte**

Si tienes problemas:

1. **Revisa los logs** del servidor
2. **Verifica el estado** con `/api/messaging/whatsapp-web/status`
3. **Reinicializa** el servicio si es necesario
4. **Consulta la documentación** de [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

---

## 🎉 **¡Listo!**

Una vez configurado, WhatsApp Web te permitirá enviar mensajes reales de WhatsApp sin costos adicionales. Los mensajes aparecerán como enviados desde tu número de WhatsApp personal. 