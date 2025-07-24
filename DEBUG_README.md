# Scripts de Diagnóstico - Autenticación y Autorización

Estos scripts te ayudarán a identificar y resolver problemas relacionados con el error 403 Forbidden al crear alumnos en el sistema.

## 🚀 Scripts Disponibles

### 1. Script Node.js (Recomendado)
**Archivo:** `debug-auth.js`

**Características:**
- Diagnóstico completo y detallado
- Verificación de tokens JWT
- Pruebas de endpoints específicos
- Análisis de respuestas del servidor

**Requisitos:**
- Node.js instalado
- Dependencias: `axios` y `jsonwebtoken`

### 2. Script PowerShell (Alternativo)
**Archivo:** `debug-auth.ps1`

**Características:**
- No requiere dependencias adicionales
- Verificación básica de conectividad
- Pruebas de autenticación
- Verificación de procesos y puertos

**Requisitos:**
- Windows PowerShell (incluido en Windows)

## 📋 Cómo Usar los Scripts

### Opción 1: Script Node.js

1. **Instalar dependencias:**
   ```bash
   npm install axios jsonwebtoken
   ```

2. **Ejecutar el script:**
   ```bash
   node debug-auth.js
   ```

### Opción 2: Script PowerShell

1. **Abrir PowerShell como administrador**

2. **Navegar al directorio del proyecto:**
   ```powershell
   cd "C:\Users\gcadin\Documents\Universidad\2025_1\GPS\Proyecto\escuela-musica"
   ```

3. **Ejecutar el script:**
   ```powershell
   .\debug-auth.ps1
   ```

   Si encuentras problemas de ejecución, ejecuta primero:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## 🔍 Qué Verifican los Scripts

### ✅ Verificaciones Realizadas

1. **Conectividad del Backend**
   - Verifica si el servidor está ejecutándose en `http://localhost:1230`
   - Prueba endpoint de salud

2. **Configuración CORS**
   - Verifica headers CORS
   - Comprueba métodos permitidos

3. **Autenticación**
   - Prueba login con usuario administrador por defecto
   - Verifica roles del usuario
   - Analiza token JWT

4. **Autorización**
   - Prueba endpoint GET `/api/alumnos`
   - Prueba endpoint POST `/api/alumnos`
   - Identifica problemas de permisos

5. **Base de Datos**
   - Verifica conectividad
   - Comprueba existencia de roles

6. **Procesos del Sistema** (Solo PowerShell)
   - Verifica procesos Node.js ejecutándose
   - Comprueba puertos en uso

## 🛠️ Soluciones Comunes

### Error: Backend no accesible
```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

### Error: Usuario administrador no existe
```bash
# En el directorio backend, ejecutar script de inicialización
node scripts/createDefaultRoles.js
# o
node scripts/initialSetup.js
```

### Error: Token expirado
1. Cerrar sesión en el frontend
2. Volver a iniciar sesión con:
   - **Email:** `administrador@email.com`
   - **Password:** `admin123`

### Error: Problemas de CORS
Verificar configuración en `backend/src/app.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📊 Interpretación de Resultados

### ✅ Símbolos de Estado
- ✅ **Verde:** Funcionando correctamente
- ❌ **Rojo:** Error que requiere atención
- ⚠️ **Amarillo:** Advertencia o configuración subóptima
- ℹ️ **Azul:** Información adicional

### 🔍 Análisis de Errores Comunes

**Error 403 - Forbidden:**
- Usuario no tiene rol de administrador
- Token inválido o expirado
- Middleware de autorización fallando

**Error 401 - Unauthorized:**
- No hay token de autenticación
- Token malformado
- Usuario no autenticado

**Error 500 - Internal Server Error:**
- Problema en el servidor backend
- Error de base de datos
- Error en el código del servidor

## 🚨 Pasos de Emergencia

Si los scripts no resuelven el problema:

1. **Reiniciar servicios:**
   ```bash
   # Detener backend (Ctrl+C)
   # Reiniciar backend
   cd backend && npm start
   
   # Detener frontend (Ctrl+C)
   # Reiniciar frontend
   cd frontend && npm run dev
   ```

2. **Limpiar caché:**
   ```bash
   # Backend
   cd backend && npm run clean
   
   # Frontend
   cd frontend && npm run build
   ```

3. **Verificar logs:**
   - Revisar consola del backend
   - Revisar consola del navegador (F12)
   - Verificar logs de base de datos

4. **Recrear base de datos:**
   ```bash
   cd backend
   npm run db:reset
   node scripts/initialSetup.js
   ```

## 📞 Información de Contacto

Si después de ejecutar estos scripts aún tienes problemas:

1. Guarda la salida completa del script
2. Incluye los logs del servidor backend
3. Describe los pasos exactos que llevaron al error
4. Menciona qué navegador y versión estás usando

---

**Nota:** Estos scripts están diseñados para diagnosticar problemas específicos de autenticación y autorización. Para otros tipos de errores, consulta la documentación del proyecto o los logs del sistema.