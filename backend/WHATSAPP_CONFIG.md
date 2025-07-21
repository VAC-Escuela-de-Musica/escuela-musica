# Configuración de WhatsApp

Este documento explica cómo configurar WhatsApp real en el sistema GPS.

## 🎯 **Opciones Disponibles**

### **1. WhatsApp Business API (Recomendado)**
- **Costo**: Gratuito (1000 mensajes/mes)
- **Confiabilidad**: 99.9%
- **Configuración**: Media complejidad
- **Aprobación**: Requerida de Meta

### **2. Callmebot (Más Fácil)**
- **Costo**: Gratuito para uso personal
- **Confiabilidad**: Alta
- **Configuración**: Muy fácil
- **Aprobación**: No requerida

### **3. Simulación (Actual)**
- **Costo**: Gratuito
- **Confiabilidad**: N/A (solo simula)
- **Configuración**: Ninguna
- **Aprobación**: No requerida

## 📋 **Configuración Paso a Paso**

### **Opción 1: WhatsApp Business API**

#### **Paso 1: Crear cuenta en Meta for Developers**
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Crea una cuenta de desarrollador
3. Verifica tu cuenta con tu número de teléfono

#### **Paso 2: Crear aplicación**
1. Crea una nueva aplicación
2. Selecciona "WhatsApp" como producto
3. Completa la información básica

#### **Paso 3: Configurar WhatsApp Business**
1. Ve a la sección "WhatsApp" en tu aplicación
2. Agrega tu número de teléfono
3. Verifica el número con el código que recibas

#### **Paso 4: Obtener credenciales**
1. **Access Token**: Ve a "System Users" > "Access Tokens"
2. **Phone Number ID**: Encuéntralo en la sección "WhatsApp" > "Phone Numbers"

#### **Paso 5: Variables de entorno**
Agrega esto a tu archivo `.env`:
```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
```

### **Opción 2: Callmebot (Más Fácil)**

#### **Paso 1: Obtener API Key**
1. Ve a [callmebot.com](https://callmebot.com)
2. Haz clic en "Get API Key"
3. Escanea el código QR con WhatsApp
4. Envía `/start` al bot
5. El bot te dará tu API key

#### **Paso 2: Variables de entorno**
Agrega esto a tu archivo `.env`:
```env
# Callmebot
CALLMEBOT_API_KEY=tu_api_key_aqui
```

## 🔧 **Verificación de Configuración**

### **Verificar estado actual**
```bash
GET http://localhost:1230/api/messaging/config-status
```

### **Respuesta esperada con WhatsApp Business API:**
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
        "businessAPI": { "configured": true },
        "callmebot": { "configured": false },
        "twilio": { "configured": false },
        "alternative": { "configured": true }
      }
    }
  }
}
```

### **Enviar mensaje de prueba**
```bash
POST http://localhost:1230/api/messaging/test-message
{
  "type": "whatsapp",
  "recipient": "+34612345678"
}
```

## 📱 **Formato de Números**

### **Formato requerido:**
- **España**: `+34612345678`
- **México**: `+525512345678`
- **Argentina**: `+5491112345678`

### **Ejemplos válidos:**
- `+34612345678`
- `34612345678` (se convierte automáticamente)
- `+1-555-123-4567` (se limpia automáticamente)

## 🚀 **Prioridad de APIs**

El sistema usa las APIs en este orden:

1. **WhatsApp Business API** (si está configurada)
2. **Callmebot** (si está configurada)
3. **Twilio** (si está configurada)
4. **Simulación** (siempre disponible)

## ⚠️ **Limitaciones**

### **WhatsApp Business API:**
- **Límite gratuito**: 1000 mensajes/mes
- **Horario**: 24/7
- **Aprobación**: Requerida para uso comercial

### **Callmebot:**
- **Límite**: Sin límite para uso personal
- **Horario**: 24/7
- **Restricción**: Solo para uso personal

## 🔍 **Solución de Problemas**

### **Error: "No autorizado"**
- Verifica que el Access Token sea correcto
- Asegúrate de que el número esté verificado

### **Error: "Número inválido"**
- Verifica el formato del número (+34...)
- Asegúrate de que el número esté activo en WhatsApp

### **Error: "Límite excedido"**
- Espera hasta el próximo mes
- Considera actualizar a un plan de pago

## 📞 **Soporte**

- **WhatsApp Business API**: [Meta for Developers](https://developers.facebook.com/support/)
- **Callmebot**: [callmebot.com](https://callmebot.com)

## 🎯 **Recomendación**

Para **pruebas y desarrollo**: Usa **Callmebot** (más fácil)
Para **producción**: Usa **WhatsApp Business API** (más confiable) 