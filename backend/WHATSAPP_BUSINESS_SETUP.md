# Configuración de WhatsApp Business API

Esta guía te ayudará a configurar WhatsApp Business API para enviar mensajes DESDE tu número.

## 🎯 **Ventajas de WhatsApp Business API**
- ✅ **Envía DESDE tu número** (no desde un bot)
- ✅ **Gratuito**: 1000 mensajes/mes
- ✅ **Oficial**: API de Meta/Facebook
- ✅ **Confiabilidad**: 99.9% de entrega

## 📋 **Paso a Paso**

### **Paso 1: Crear cuenta en Meta for Developers**
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Haz clic en "Get Started" o "Comenzar"
3. Inicia sesión con tu cuenta de Facebook
4. Completa la verificación de tu cuenta

### **Paso 2: Crear aplicación**
1. Haz clic en "Crear aplicación"
2. Selecciona "Negocio" como tipo de aplicación
3. Completa la información básica:
   - **Nombre de la aplicación**: GPS Sistema
   - **Email de contacto**: tu email
   - **Categoría de la aplicación**: Educación

### **Paso 3: Agregar WhatsApp**
1. En el dashboard de tu aplicación, busca "Agregar producto"
2. Busca "WhatsApp" y haz clic en "Configurar"
3. Completa la configuración básica

### **Paso 4: Configurar número de teléfono**
1. Ve a la sección "WhatsApp" en el menú lateral
2. Haz clic en "Getting Started"
3. Haz clic en "Add phone number"
4. Ingresa tu número de teléfono
5. Selecciona tu país
6. Haz clic en "Next"

### **Paso 5: Verificar número**
1. Selecciona el método de verificación (SMS o llamada)
2. Ingresa el código que recibas
3. Tu número estará verificado

### **Paso 6: Obtener credenciales**
1. **Phone Number ID**: 
   - Ve a "WhatsApp" > "Phone Numbers"
   - Copia el "Phone number ID"

2. **Access Token**:
   - Ve a "WhatsApp" > "Getting Started"
   - Busca "Temporary access token"
   - Copia el token (empieza con "EAA...")

### **Paso 7: Configurar variables de entorno**
Agrega esto a tu archivo `.env`:
```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
```

## 🔧 **Verificación**

### **Probar configuración**
```bash
GET http://localhost:1230/api/messaging/config-status
```

### **Respuesta esperada**
```json
{
  "success": true,
  "data": {
    "configuration": {
      "whatsapp": {
        "businessAPI": { "configured": true },
        "callmebot": { "configured": false }
      }
    }
  }
}
```

## ⚠️ **Limitaciones**

### **Límites gratuitos:**
- **1000 mensajes/mes** gratuitos
- **Horario**: 24/7
- **Tipos de mensaje**: Texto, imagen, documento

### **Restricciones:**
- **Número debe estar verificado**
- **Aprobación requerida** para uso comercial
- **Plantillas obligatorias** para mensajes promocionales

## 🚀 **Ventajas sobre Callmebot**

| Característica | Callmebot | WhatsApp Business API |
|----------------|-----------|----------------------|
| Envía desde tu número | ❌ | ✅ |
| Mensajes reales | ❌ | ✅ |
| Gratuito | ✅ | ✅ |
| Límites | Sin límite personal | 1000/mes |
| Configuración | Fácil | Media |
| Aprobación | No requerida | Requerida |

## 📞 **Soporte**

- **Documentación oficial**: [Meta for Developers](https://developers.facebook.com/docs/whatsapp)
- **Soporte**: [Meta for Developers Support](https://developers.facebook.com/support/)

## 🎯 **Recomendación**

Para un sistema profesional como GPS, **WhatsApp Business API** es la mejor opción porque:
- Los mensajes aparecen como enviados desde tu número
- Es la solución oficial de Meta
- Tiene mejor confiabilidad
- Es más profesional 